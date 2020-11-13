from .models import User, Room, Membership, Message, MessageSeen
from .extensions import marshmallow


class UserSchema(marshmallow.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_only = ('password',)
        datetimeformat = '%Y-%m-%dT%H:%M:%S%z'


class RoomSchema(marshmallow.SQLAlchemyAutoSchema):
    class Meta:
        model = Room
        include_fk = True
        datetimeformat = '%Y-%m-%dT%H:%M:%S%z'


class MembershipSchema(marshmallow.SQLAlchemyAutoSchema):
    class Meta:
        model = Membership


class MessageSchema(marshmallow.SQLAlchemyAutoSchema):
    class Meta:
        model = Message
        datetimeformat = '%Y-%m-%dT%H:%M:%S%z'
        include_fk = True
    sender = marshmallow.Nested(UserSchema, only=("username", "email"))
    seens = marshmallow.Nested("MessageSeenSchema", many=True)


class MessageSeenSchema(marshmallow.SQLAlchemyAutoSchema):
    class Meta:
        model = MessageSeen
        include_fk = True
