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


def test_get_success(app, _user_with_rooms):
    user_id = _user_with_rooms.id
    with app.test_client() as client:
        response = client.get(
            f"/users/{user_id}/memberships",
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )
    assert response.status_code == 200
    assert response.json["memberships"] == [1, 2, 3]


def test_post_success_with_ids(app, _user_with_rooms):
    user_id = _user_with_rooms.id
    with session_scope() as session:
        session.add_all(
            (
                User(
                    username="test_username_2",
                    email="test_username_3@email.com",
                    password="test_password",
                ),
                User(
                    username="test_username_3",
                    email="test_username_3@email.com",
                    password="test_password",
                ),
            )
        )
    with app.test_client() as client:
        response = client.post(
            f"/users/{user_id}/rooms/1/memberships",
            json={"user_ids": [2]},
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )
    assert response.status_code == 200
    assert response.json["message"] == "Memberships added."
    assert len(response.json["memberships"]) == 1
    assert response.json["memberships"][0]["room_id"] == 1
    assert response.json["memberships"][0]["user_id"] == 2


def test_post_success_with_usernames(app, _user_with_rooms):
    user_id = _user_with_rooms.id
    with session_scope() as session:
        session.add_all(
            (
                User(
                    username="test_username_2",
                    email="test_username_3@email.com",
                    password="test_password",
                ),
                User(
                    username="test_username_3",
                    email="test_username_3@email.com",
                    password="test_password",
                ),
            )
        )
    with app.test_client() as client:
        response = client.post(
            f"/users/{user_id}/rooms/1/memberships",
            json={"usernames": ["test_username_3"]},
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )
    assert response.status_code == 200
    assert response.json["message"] == "Memberships added."
    assert len(response.json["memberships"]) == 1
    assert response.json["memberships"][0]["room_id"] == 1
    assert response.json["memberships"][0]["user_id"] == 3


def test_post_fail_creator_not_member(app, _user_with_rooms):
    user_id = _user_with_rooms.id
    membership_of_creator = Membership.query.filter_by(
        room_id=1, user_id=user_id
    ).one_or_none()
    with session_scope() as session:
        session.delete(membership_of_creator)

    with app.test_client() as client:
        response = client.post(
            f"/users/{user_id}/rooms/1/memberships",
            json={"user_ids": [2]},
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )
    assert response.status_code == 403
    assert response.json["message"] == (
        "User must be a member of the room to add other users."
    )


def test_delete_success(app, _user_with_rooms):
    user_id = _user_with_rooms.id

    with app.test_client() as client:
        response = client.delete(
            f"/users/{user_id}/rooms/1/memberships",
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )
    assert response.status_code == 200
    assert response.json["room_id"] == 1


def test_delete_fail_creator_not_member(app, _user_with_rooms):
    user_id = _user_with_rooms.id
    membership_of_creator = Membership.query.filter_by(
        room_id=1, user_id=user_id
    ).one_or_none()
    with session_scope() as session:
        session.delete(membership_of_creator)

    with app.test_client() as client:
        response = client.delete(
            f"/users/{user_id}/rooms/1/memberships",
            headers={
                "Authorization": f"Bearer {_user_with_rooms.access_token}"
            },
        )
    assert response.status_code == 403
    assert response.json["message"] == (
        "User must be a member of the room to leave it."
    )
