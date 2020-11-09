from marshmallow_sqlalchemy.fields import Nested

from .models import User, Room, Membership, Message
from .extensions import marshmallow


class UserSchema(marshmallow.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_only = ('password',)
        datetimeformat = '%Y-%m-%dT%H:%M:%S%z'
    events = marshmallow.Nested('EventSchema', many=True, exclude=('user',))


class RoomSchema(marshmallow.SQLAlchemyAutoSchema):
    class Meta:
        model = Room
        datetimeformat = '%Y-%m-%dT%H:%M:%S%z'


class MembershipSchema(marshmallow.SQLAlchemyAutoSchema):
    class Meta:
        model = Membership


class MessageSchema(marshmallow.SQLAlchemyAutoSchema):
    class Meta:
        model = Message
        datetimeformat = '%Y-%m-%dT%H:%M:%S%z'
        include_fk = True
    sender = Nested(UserSchema, only=("username", "email"))
