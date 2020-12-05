import pytest
from chatterbox.database import session_scope
from chatterbox.models import Membership, Message, Room, User
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                decode_token)


class TestAuth:
    def test_signup_success(self, app):
        with app.test_client() as client:
            response = client.post(
                "/users",
                json={
                    "username": "test_username",
                    "email": "test_email@domain.com",
                    "password": "test_password",
                },
            )

        assert response.status_code == 200
        assert response.json["user"]["username"] == "test_username"
        assert response.json["user"]["email"] == "test_email@domain.com"
        assert "password" not in response.json["user"]
        assert decode_token(response.json["accessToken"])["type"] == "access"
        assert decode_token(response.json["refreshToken"])["type"] == "refresh"

        user = User.query.all().pop()
        assert user.username == "test_username"
        assert user.email == "test_email@domain.com"
        assert Bcrypt().check_password_hash(user.password, "test_password")

    def test_signup_fail(self, app):
        with session_scope() as session:
            session.add_all(
                (
                    User(
                        username="same_username",
                        email="unique_email@domain.com",
                        password=Bcrypt()
                        .generate_password_hash("test_password")
                        .decode("utf8"),
                    ),
                    User(
                        username="unique_username",
                        email="same_email@domain.com",
                        password=Bcrypt()
                        .generate_password_hash("test_password")
                        .decode("utf8"),
                    ),
                )
            )

        with app.test_client() as client:
            response1 = client.post(
                "/users",
                json={
                    "username": "same_username",
                    "email": "test_email@domain.com",
                    "password": "test_password",
                },
            )
            response2 = client.post(
                "/users",
                json={
                    "username": "test_username",
                    "email": "same_email@domain.com",
                    "password": "test_password",
                },
            )

        assert response1.status_code == 403
        assert response2.status_code == 403
        assert response1.json["errors"]["username"]["message"] == (
            "Username already in use."
        )
        assert response2.json["errors"]["email"]["message"] == (
            "Email address already in use."
        )

    def test_login_success(self, app):
        with session_scope() as session:
            session.add(
                User(
                    username="test_username",
                    email="test_email@domain.com",
                    password=Bcrypt()
                    .generate_password_hash("test_password")
                    .decode("utf8"),
                )
            )

        with app.test_client() as client:
            response = client.post(
                "/login",
                json={
                    "username": "test_username",
                    "password": "test_password",
                },
            )
        assert response.status_code == 200
        assert response.json["user"]["username"] == "test_username"
        assert response.json["user"]["email"] == "test_email@domain.com"
        assert "password" not in response.json["user"]
        assert decode_token(response.json["accessToken"])["type"] == "access"
        assert decode_token(response.json["refreshToken"])["type"] == "refresh"

    def test_login_fail(self, app):
        with app.test_client() as client:
            response = client.post(
                "/login",
                json={
                    "username": "test_username",
                    "password": "test_password",
                },
            )
        assert response.status_code == 403
        assert response.json["errors"]["username"]["message"] == (
            "Invalid email address or password."
        )
        assert response.json["errors"]["password"]["message"] == (
            "Invalid email address or password."
        )

    def test_refresh_token(self, app):
        user = User(
            username="test_username",
            email="test_email@domain.com",
            password="test_password",
        )
        with session_scope() as session:
            session.add(user)
            session.flush()
            refresh_token = create_refresh_token(identity=user.id)

        with app.test_client() as client:
            response = client.post(
                "/auth/access_tokens",
                headers={"Authorization": f"Bearer {refresh_token}"},
            )
        assert response.status_code == 200
        assert decode_token(response.json["accessToken"])["type"] == "access"


class TestUsers:
    def test_get(self, app):
        with session_scope() as session:
            user1, user2 = (
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
            )
            session.add_all((user1, user2))
            session.flush()
            access_token = create_access_token(user1.id)

        with app.test_client() as client:
            response = client.get(
                "/users", headers={"Authorization": f"Bearer {access_token}"}
            )
            assert response.status_code == 200
            assert response.json["users"] == [
                {"username": "test_username_1"},
                {"username": "test_username_2"},
            ]

            response = client.get(
                "/users?username=test_username_1",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            assert response.status_code == 200
            assert response.json["users"] == [{"username": "test_username_1"}]


class TestRooms:
    @pytest.fixture(autouse=True)
    def _user_with_rooms(self):
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

        user = User.query.all().pop()
        user.access_token = create_access_token(user.id)
        yield user

    def test_get_all(self, app, _user_with_rooms):
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
        assert all(
            [room["created_by"] == 1 for room in response.json["rooms"]]
        )

    def test_get_with_ids_and_skip(self, app, _user_with_rooms):
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

    def test_post_success(self, app, _user_with_rooms):
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

    def test_post_fail_room_name_conflict(self, app, _user_with_rooms):
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

    def test_post_fail_username_conflict(self, app, _user_with_rooms):
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

    def test_delete_success(self, app, _user_with_rooms):
        with app.test_client() as client:
            response = client.delete(
                f"/users/{_user_with_rooms.id}/rooms/{1}",
                headers={
                    "Authorization": f"Bearer {_user_with_rooms.access_token}"
                },
            )
        assert response.status_code == 200
        assert response.json["room_id"] == 1

    def test_delete_fail_wrong_id(self, app, _user_with_rooms):
        with app.test_client() as client:
            response = client.delete(
                f"/users/{_user_with_rooms.id}/rooms/1234",
                headers={
                    "Authorization": f"Bearer {_user_with_rooms.access_token}"
                },
            )
        assert response.status_code == 403
        assert (
            response.json["message"]
            == "There is no room with the provided id."
        )

    def test_delete_fail_not_created_by_user(self, app, _user_with_rooms):
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


class TestMemberships:
    @pytest.fixture(autouse=True)
    def _user_with_rooms(self):
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

        user = User.query.all().pop()
        user.access_token = create_access_token(user.id)
        yield user

    def test_get_success(self, app, _user_with_rooms):
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

    def test_post_success_with_ids(self, app, _user_with_rooms):
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

    def test_post_success_with_usernames(self, app, _user_with_rooms):
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

    def test_post_fail_creator_not_member(self, app, _user_with_rooms):
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

    def test_delete_success(self, app, _user_with_rooms):
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

    def test_delete_fail_creator_not_member(self, app, _user_with_rooms):
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


class TestMessages:
    @pytest.fixture(autouse=True)
    def _user_with_msgs(self, app):
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

    def test_get_success(self, app, _user_with_msgs):
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

    def test_get_fail_user_not_member(self, app, _user_with_msgs):
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

    class TestMessageSeens:
        @pytest.fixture(autouse=True)
        def _user_with_msgs(self, app):
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

        def test_put_success(self, app, _user_with_msgs):
            with app.test_client() as client:
                response = client.put(
                    f"/users/{_user_with_msgs.id}/rooms/1/messages_seen",
                    json={"status": True, "messageIds": [1]},
                    headers={
                        "Authorization":
                            f"Bearer {_user_with_msgs.access_token}"
                    },
                )
            assert response.status_code == 200
            assert len(response.json["messages"]) == 1
            assert response.json["messages"][0]["text"] == "test_text_1"
            assert response.json["messages"][0]["seens"] == [
                {"user_id": 1, "message_id": 1, "status": True}
            ]

        def test_put_success_set_all(self, app, _user_with_msgs):
            with app.test_client() as client:
                response = client.put(
                    f"/users/{_user_with_msgs.id}/rooms/1/messages_seen",
                    json={
                        "status": True,
                        "all": True,
                    },
                    headers={
                        "Authorization":
                            f"Bearer {_user_with_msgs.access_token}"
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
