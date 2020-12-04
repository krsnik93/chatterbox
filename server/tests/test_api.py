from chatterbox.database import session_scope
from chatterbox.models import User
from flask_bcrypt import Bcrypt
from flask_jwt_extended import decode_token


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

    def test_login(self, app):
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
