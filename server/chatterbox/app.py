from flask import Flask
from sqlalchemy_utils import create_database, database_exists


def create_app(config_object):
    app = Flask(__name__)
    app.config.from_object(config_object)
    register_extensions(app)
    register_blueprint(app)
    return app


def register_extensions(app):
    from .database import db
    from .extensions import bcrypt, cors, jwt, migrate
    from .socketio import socketio

    if not database_exists(app.config["SQLALCHEMY_DATABASE_URI"]):
        create_database(app.config["SQLALCHEMY_DATABASE_URI"])
    db.init_app(app)
    db.create_all(app=app)

    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    socketio.init_app(app)
    return app


def register_blueprint(app):
    from .api import api_blueprint

    app.register_blueprint(api_blueprint)
    return app
