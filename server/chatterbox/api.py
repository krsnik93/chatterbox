from collections import defaultdict
from flask import Blueprint, request, jsonify, make_response
from flask_restful import Resource, Api
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, get_jwt_identity,
                                jwt_refresh_token_required)
from sqlalchemy.sql.expression import func, case
from webargs import fields
from webargs.flaskparser import use_args

from .schemas import UserSchema, RoomSchema, MessageSchema, MessageSeenSchema
from .models import User, Room, Membership, Message, MessageSeen
from .extensions import bcrypt, jwt
from .database import db, session_scope

api_blueprint = Blueprint('api', __name__)
api = Api(api_blueprint)


@api_blueprint.errorhandler(422)
def handle_unprocessable_entity(err):
    # webargs attaches additional metadata to the `data` attribute
    exc = getattr(err, "exc")
    if exc:
        # Get validations from the ValidationError object
        messages = exc.messages
    else:
        messages = ["Invalid request"]
    return jsonify(messages=messages), 422


@jwt.expired_token_loader
def my_expired_token_callback(expired_token):
    token_type = expired_token['type']
    return jsonify({
        'msg': 'The {} token has expired'.format(token_type)
    }), 401


@api.resource('/auth/tokens')
class Tokens(Resource):
    @use_args(UserSchema(only=('username', 'password')))
    def post(self, user):
        matching_user = User.query.filter_by(username=user['username']).first()
        if matching_user is None or not matching_user.check_password(
                user['password']):
            return make_response(
                jsonify(message='Invalid email address or password.'),
                404)
        access_token = create_access_token(matching_user.id)
        refresh_token = create_refresh_token(matching_user.id)
        return make_response(jsonify(
            user=UserSchema().dump(matching_user),
            accessToken=access_token,
            refreshToken=refresh_token,
        ), 200)


@api.resource('/auth/access_tokens')
class AccessTokens(Resource):
    @jwt_refresh_token_required
    def post(self):
        current_user = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user)
        return make_response(jsonify(
            accessToken=new_access_token
        ), 200)


@api.resource('/users')
class Users(Resource):
    @jwt_required
    def get(self):
        from .app import app
        page = request.args.get('page', 1, type=int)
        username = request.args.get('username')
        if username:
            users = db.session.query(User).filter(
                User.username.like(f'%{username}%')
            ).paginate(page, app.config['PAGINATION_PER_PAGE'], False).items
        else:
            users = db.session.query(User).all()
        return make_response(jsonify(
            users=UserSchema(only=("username",), many=True).dump(users),
            page=page
        ), 200)

    @jwt_required
    @use_args(UserSchema())
    def post(self, args):
        user = User(**args)
        if User.query.filter_by(email=user.email).first() is not None:
            return make_response(jsonify(
                message=(
                    'User with the provided email address already exists.'
                )),
                404
            )
        # https://stackoverflow.com/a/38262440/2858258
        user.password = bcrypt.generate_password_hash(
            user.password.encode('utf8')).decode('utf8')
        access_token = create_access_token(user.id, fresh=True)
        refresh_token = create_refresh_token(user.id)
        user_email = user.email
        with session_scope() as session:
            session.add(user)
        user = User.query.filter_by(email=user_email).first()
        return make_response(jsonify(
            user=UserSchema().dump(user),
            accessToken=access_token,
            refreshToken=refresh_token,
        ), 200)


@api.resource('/users/<user_id>/rooms')
class Rooms(Resource):
    @jwt_required
    def get(self, user_id):
        from .app import app
        page = request.args.get('page', 1, type=int)

        rooms = db.session.query(Room).outerjoin(Message).join(
            Membership).filter(Membership.user_id == user_id).group_by(
            Room.id).order_by(func.coalesce(func.max(Message.sent_at),
                                            Room.created_at).desc()).paginate(
            page, app.config['PAGINATION_PER_PAGE'], False).items

        return make_response(jsonify(
            rooms=RoomSchema(many=True).dump(rooms),
            page=page
        ), 200)

    @jwt_required
    def post(self, user_id):
        args = request.json
        if not args.get('created_by'):
            args['created_by'] = user_id
        room = Room(**args)
        if Room.query.filter_by(name=room.name).first() is not None:
            return make_response(
                jsonify(
                    message=(
                        'Room with the provided name address already exists.'
                    )),
                403
            )

        if User.query.filter_by(username=room.name).one_or_none() is not None:
            return make_response(
                jsonify(
                    message=(
                        'Room name must not match another username.'
                    )),
                403
            )

        with session_scope() as session:
            session.add(room)
            session.flush()
            serialized = RoomSchema().dump(room)

        return make_response(jsonify(room=serialized), 200)


@api.resource('/users/<user_id>/rooms/<room_id>/memberships')
class Memberships(Resource):
    @jwt_required
    @use_args({
        "usernames": fields.List(fields.String()),
        "user_ids": fields.List(fields.Int())
    }, location="json")
    def post(self, args, user_id, room_id):
        if not Membership.query.filter_by(user_id=user_id, room_id=room_id).one_or_none():
            return make_response(jsonify(
                message=(
                    'User must be a member of the room to add other users.'
                )),
                403
            )
        usernames = args.get('usernames')
        user_ids = args.get('user_ids')
        if usernames:
            users = db.session.query(User).filter(
                User.username.in_(usernames)
            ).all()
            user_ids = [u.id for u in users]
        memberships = [
            Membership(room_id=room_id, user_id=user_id)
            for user_id in user_ids
        ]

        with session_scope() as session:
            session.add_all(memberships)

        return make_response(jsonify(
            message='Memberships added.'
        ), 200)


@api.resource(
    '/users/<user_id>/rooms/<room_id>/messages',
    '/users/<user_id>/messages'
)
class Messages(Resource):
    @jwt_required
    @use_args({
        "room_ids": fields.List(fields.Int())
    }, location="query")
    def get(self, args, user_id, room_id=None):
        from .app import app

        page = request.args.get('page', 1, type=int)
        room_ids = [room_id] if room_id else args.get('room_ids')

        if Membership.query.filter(
            Membership.user_id == user_id,
            Membership.room_id.in_(room_ids)
        ).count() < len(room_ids):
            return make_response(jsonify(
                message=(
                    'User must be a member of the room to add other users.'
                )),
                403
            )

        subquery = db.session.query(
            Message.id,
            func.rank().over(
                order_by=Message.sent_at.desc(),
                partition_by=Message.room_id
            ).label('rank')
        ).filter(Message.room_id.in_(room_ids)).subquery()

        message_dicts = db.session.query(subquery.c.id).filter(
            subquery.c.rank <= app.config['PAGINATION_PER_PAGE']).order_by(
            subquery.c.rank.desc()).all()

        message_ids = [id_ for (id_,) in message_dicts]

        ordering = case(
            {id_: index for index, id_ in enumerate(message_ids)},
            value=Message.id
        )
        messages = Message.query.filter(Message.id.in_(message_ids)).order_by(
            ordering).all()

        messages_serialized = MessageSchema(many=True).dump(messages)
        messages_by_room_id = defaultdict(list)
        for m in messages_serialized:
            messages_by_room_id[m['room_id']].append(m)

        return make_response(jsonify(
            messages=messages_by_room_id,
            room_ids=room_ids,
            page=page
        ), 200)


@api.resource('/users/<user_id>/rooms/<room_id>/messages_seen')
class MessageSeens(Resource):
    @jwt_required
    def put(self, user_id, room_id):
        status = request.json.get('status')
        message_ids = request.json.get('messageIds')
        set_all = request.json.get('all')

        if status is None:
            return make_response(jsonify(
                message="Missing argument 'status'."
            ), 403)

        if set_all:
            message_ids = [m.id for m in db.session.query(Message.id).filter_by(
                room_id=room_id)]

        existing_seens = db.session.query(MessageSeen).filter(
            MessageSeen.user_id == user_id,
            MessageSeen.message_id.in_(message_ids)
        ).all()

        for s in existing_seens:
            s.status = True

        new_message_ids = set(message_ids).difference(
            set([s.message_id for s in existing_seens])
        )

        new_seens = [
            MessageSeen(user_id=user_id, message_id=message_id, status=status)
            for message_id in new_message_ids
        ]

        seens = existing_seens + new_seens

        with session_scope() as session:
            session.add_all(seens)
            session.flush()
            serialized_seens = MessageSeenSchema(many=True).dump(seens)

        messages = Message.query.filter(
            Message.id.in_([s['message_id'] for s in serialized_seens])
        ).all()
        serialized_messages = MessageSchema(many=True).dump(messages)

        return make_response(jsonify(
            seens=serialized_seens,
            messages=serialized_messages,
        ), 200)
