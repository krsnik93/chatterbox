import pytest
from chatterbox.app import create_app
from chatterbox.config import TestingConfig


@pytest.fixture
def app():
    app = create_app(TestingConfig)
    yield app


@pytest.fixture(autouse=True)
def db(app):
    with app.app_context():
        db = app.extensions["sqlalchemy"].db
        db.create_all()
        yield db
        db.drop_all()
