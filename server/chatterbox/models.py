import datetime

from .database import db
from .extensions import bcrypt


class User(db.Model):

    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(80), nullable=False)
    registered_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    signed_in_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    created_rooms = db.relationship("Room")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)


class Room(db.Model):

    __tablename__ = 'room'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    messages = db.relationship("Message")
    memberships = db.relationship("Membership")


class Membership(db.Model):

    __tablename__ = 'membership'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)


class Message(db.Model):

    __tablename__ = 'message'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(512), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'))
    sent_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
