from chatterbox.database import session_scope
from chatterbox.models import User
from flask_jwt_extended import create_access_token


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
