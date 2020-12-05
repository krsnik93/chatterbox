import pytest
from chatterbox.database import session_scope
from chatterbox.models import Membership, Room, User
from flask_jwt_extended import create_access_token


@pytest.fixture(autouse=True)
def _user_with_rooms():
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

    with session_scope() as session:
        session.add_all([user] + rooms + memberships)

    user = User.query.one()
    user.access_token = create_access_token(user.id)
    yield user


def test_get_all(app, _user_with_rooms):
    with app.test_client() as client:
        response = client.get(
            f"/users/{_user_with_rooms.id}/rooms",
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )

    assert response.status_code == 200
    assert len(response.json["rooms"]) == 3
    assert {"test_room_1", "test_room_2", "test_room_3"} == {
        room["name"] for room in response.json["rooms"]
    }
    assert all([room["created_by"] == 1 for room in response.json["rooms"]])


def test_get_with_ids_and_skip(app, _user_with_rooms):
    with app.test_client() as client:
        user_id = _user_with_rooms.id
        response = client.get(
            f"/users/{user_id}/rooms?ids_to_fetch=1&ids_to_skip=2",
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )

    assert response.status_code == 200
    assert len(response.json["rooms"]) == 1
    assert response.json["rooms"].pop()["name"] == "test_room_1"


def test_post_success(app, _user_with_rooms):
    with app.test_client() as client:
        response = client.post(
            f"/users/{_user_with_rooms.id}/rooms",
            json={"name": "test_create_room"},
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )
    assert response.status_code == 200
    assert response.json["room"]["name"] == "test_create_room"


def test_post_fail_room_name_conflict(app, _user_with_rooms):
    user_id = _user_with_rooms.id
    with session_scope() as session:
        session.add(Room(name="test_create_room", created_by=user_id))
    with app.test_client() as client:
        response = client.post(
            f"/users/{user_id}/rooms",
            json={"name": "test_create_room"},
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )
    assert response.status_code == 403
    assert response.json["message"] == (
        "Room with the provided name address already exists."
    )


def test_post_fail_username_conflict(app, _user_with_rooms):
    with app.test_client() as client:
        response = client.post(
            f"/users/{_user_with_rooms.id}/rooms",
            json={"name": "test_username_1"},
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )
    assert response.status_code == 403
    assert response.json["message"] == (
        "Room name must not match another username."
    )


def test_delete_success(app, _user_with_rooms):
    with app.test_client() as client:
        response = client.delete(
            f"/users/{_user_with_rooms.id}/rooms/{1}",
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )
    assert response.status_code == 200
    assert response.json["room_id"] == 1


def test_delete_fail_wrong_id(app, _user_with_rooms):
    with app.test_client() as client:
        response = client.delete(
            f"/users/{_user_with_rooms.id}/rooms/1234",
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )
    assert response.status_code == 403
    assert response.json["message"] == "There is no room with the provided id."


def test_delete_fail_not_created_by_user(app, _user_with_rooms):
    user_id = _user_with_rooms.id
    with session_scope() as session:
        user = User(
            username="test_username",
            email="test_email@domain.com",
            password="test_password",
        )
        session.add(user)
        session.flush()
        room = Room(name="test_create_room", created_by=user.id)
        session.add(room)
        session.flush()
        room_id = room.id
    with app.test_client() as client:
        response = client.delete(
            f"/users/{user_id}/rooms/{room_id}",
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )
    assert response.status_code == 403
    assert response.json["message"] == (
        "User must be the creator of the room to be able to delete it."
    )
