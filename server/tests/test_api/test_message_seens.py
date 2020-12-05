import pytest
from chatterbox.database import session_scope
from chatterbox.models import Membership, Message, Room, User
from flask_jwt_extended import create_access_token


@pytest.fixture(autouse=True)
def _user_with_msgs(app):
    users = [
        User(
            username="test_username_1",
            email="test_email_1@domain.com",
            password="test_password_1",
        ),
        User(
            username="test_username_2",
            email="test_email_2@domain.com",
            password="test_password_2",
        ),
    ]
    room = Room(name="test_room_1", created_by=1)

    memberships = [
        Membership(user_id=1, room_id=1),
        Membership(user_id=2, room_id=1),
    ]
    messages = [
        Message(text="test_text_1", sender_id=1, room_id=1),
        Message(text="test_text_2", sender_id=2, room_id=1),
    ]

    with session_scope() as session:
        session.add_all(users + [room] + memberships + messages)

    user = User.query.order_by(User.id).first()
    user.access_token = create_access_token(user.id)
    yield user


def test_put_success(app, _user_with_msgs):
    with app.test_client() as client:
        response = client.put(
            f"/users/{_user_with_msgs.id}/rooms/1/messages_seen",
            json={"status": True, "messageIds": [1]},
            headers={
                "Authorization": (f"Bearer {_user_with_msgs.access_token}")
            },
        )
    assert response.status_code == 200
    assert len(response.json["messages"]) == 1
    assert response.json["messages"][0]["text"] == "test_text_1"
    assert response.json["messages"][0]["seens"] == [
        {"user_id": 1, "message_id": 1, "status": True}
    ]


def test_put_success_set_all(app, _user_with_msgs):
    with app.test_client() as client:
        response = client.put(
            f"/users/{_user_with_msgs.id}/rooms/1/messages_seen",
            json={
                "status": True,
                "all": True,
            },
            headers={
                "Authorization": (f"Bearer {_user_with_msgs.access_token}")
            },
        )
    assert response.status_code == 200
    assert len(response.json["messages"]) == 2
    assert response.json["messages"][0]["text"] == "test_text_1"
    assert response.json["messages"][0]["seens"] == [
        {"user_id": 1, "message_id": 1, "status": True}
    ]
    assert response.json["messages"][1]["text"] == "test_text_2"
    assert response.json["messages"][1]["seens"] == [
        {"user_id": 1, "message_id": 2, "status": True}
    ]
