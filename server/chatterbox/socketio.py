from flask import jsonify, make_response
from flask_socketio import SocketIO, send, emit, join_room, leave_room

from .database import session_scope
from .models import Message
from .schemas import MessageSchema

socketio = SocketIO(cors_allowed_origins='*')


@socketio.on('my event')
def test_message(message):
    emit('my response', {'data': message['data']})


@socketio.on('my broadcast event')
def test_message(message):
    emit('my response', {'data': message['data']}, broadcast=True)


@socketio.on('connect')
def test_connect():
    emit('connect', {'data': 'Connected'})


@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')


@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    print(f'User {username} has joined room {room}.')
    send(username + ' has entered the room.', room=room)


@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    send(username + ' has left the room.', room=room)


@socketio.on('chat message')
def message(data):
    print('chat message received')
    room = data['room']
    username = data['username']
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

    emit('chat message', response, room=room)
