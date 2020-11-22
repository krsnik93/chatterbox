from flask_socketio import SocketIO, emit, join_room, leave_room
from engineio.payload import Payload

from .database import session_scope
from .models import User, Room, Message, Membership
from .schemas import RoomSchema, MessageSchema


Payload.max_decode_packets = 500
socketio = SocketIO(
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)


@socketio.on('connect')
def test_connect():
    emit('connect', {'data': 'Connected'})


@socketio.on('disconnect')
def test_disconnect():
    emit('disconnect', {'data': 'Disconnected'})


@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    print(f"User {username} has joined room '{room}'.")
    emit(
        'join',
        {'data': f"User '{username}' has joined room '{room}'."},
        room=room
    )


@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    emit(
        'leave',
        {'data': f"User '{username}' has left room '{room}'."},
        room=room
    )


@socketio.on('room event')
def room_event(data):
    room_name = data['roomName']
    user_id = data['userId']
    usernames = data['usernames']

    if Room.query.filter_by(name=room_name).one_or_none() is not None:
        return {
            'message': 'Room with the provided name already exists.',
            'status_code': 403
        }

    if User.query.filter_by(username=room_name).one_or_none() is not None:
        return {
            'message': 'Room name must not match another username.',
            'status_code': 403
        }

    room = Room(name=room_name, created_by=user_id)

    with session_scope() as session:
        session.add(room)
        session.flush()
        serialized_room = RoomSchema().dump(room)

    members = User.query.filter(User.username.in_(usernames)).all()
    memberships = [
        Membership(user_id=member.id, room_id=serialized_room['id'])
        for member in members
    ]

    with session_scope() as session:
        session.add_all(memberships)

    response = {
        'message': 'Room created successfully.',
        'room': serialized_room,
        'status_code': 200
    }
    for username in usernames:
        emit("room event", response, room=username)


@socketio.on('message event')
def message_event(data):
    room = data['room']
    sender_id = data['sender_id']
    text = data['message']

    msg = Message(text=text, sender_id=sender_id, room_id=room)
    with session_scope() as session:
        session.add(msg)
        session.flush()

        msg_id = msg.id
        response = {
            'message': MessageSchema().dump(msg),
            'status_code': 200
        }

    if not Message.query.filter_by(id=msg_id).one_or_none():
        response = {
            'message': 'Failed to insert message.',
            'status_code': 403
        }

    emit('message event', response, room=room)

