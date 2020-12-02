from flask import Flask
from sqlalchemy_utils import database_exists, create_database


def create_app(config_filename='config.py'):
    app = Flask(__name__)
    app.config.from_pyfile(config_filename)
    register_extensions(app)
    register_blueprint(app)
    return app


def register_extensions(app):
    from .database import db
    from .socketio import socketio
    from .extensions import (migrate, bcrypt, jwt, cors)

    if not database_exists(app.config['SQLALCHEMY_DATABASE_URI']):
        create_database(app.config['SQLALCHEMY_DATABASE_URI'])
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


app = create_app()
