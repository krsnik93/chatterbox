import pytest
from chatterbox.database import session_scope
from chatterbox.models import Membership, Message, Room, User
from flask_jwt_extended import create_access_token


@pytest.fixture(autouse=True)
def _user_with_msgs(app):
    user = User(
        username="test_username_1",
        email="test_email_1@domain.com",
        password="test_password_1",
    )
    rooms = [
        Room(name="test_room_1", created_by=1),
        Room(name="test_room_2", created_by=1),
        Room(name="test_room_3", created_by=1),
    ]
    memberships = [
        Membership(user_id=1, room_id=1),
        Membership(user_id=1, room_id=2),
        Membership(user_id=1, room_id=3),
    ]
    messages = [
        Message(text="test_text_1", sender_id=1, room_id=1),
        Message(text="test_text_2", sender_id=1, room_id=2),
    ]

    with session_scope() as session:
        session.add_all([user] + rooms + memberships + messages)

    user = User.query.all().pop()
    user.access_token = create_access_token(user.id)
    yield user


def test_get_success(app, _user_with_msgs):
    with app.test_client() as client:
        response = client.get(
            f"/users/{_user_with_msgs.id}/messages?room_ids=1&room_ids=2",
            headers={
                "Authorization": f"Bearer {_user_with_msgs.access_token}"
            },
        )
    assert response.status_code == 200
    assert response.json["room_ids"] == [1, 2]
    assert response.json["messages"]["1"][0]["room_id"] == 1
    assert response.json["messages"]["1"][0]["sender_id"] == 1
    assert response.json["messages"]["1"][0]["text"] == "test_text_1"
    assert response.json["messages"]["2"][0]["room_id"] == 2
    assert response.json["messages"]["2"][0]["sender_id"] == 1
    assert response.json["messages"]["2"][0]["text"] == "test_text_2"


def test_get_fail_user_not_member(app, _user_with_msgs):
    with app.test_client() as client:
        response = client.get(
            f"/users/{_user_with_msgs.id}/messages?room_ids=1234",
            headers={
                "Authorization": f"Bearer {_user_with_msgs.access_token}"
            },
        )
    assert response.status_code == 403
    assert response.json["message"] == (
        "User must be a member of the room to get messages."
    )
