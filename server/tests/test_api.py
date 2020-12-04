from chatterbox.database import session_scope
from chatterbox.models import User
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
                        password=Bcrypt().generate_password_hash(
                            "test_password"
                        ),
                    ),
                    User(
                        username="unique_username",
                        email="same_email@domain.com",
                        password=Bcrypt().generate_password_hash(
                            "test_password"
                        ),
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
                    password=Bcrypt().generate_password_hash("test_password"),
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
    pass
