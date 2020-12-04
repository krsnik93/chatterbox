from datetime import timedelta


class BaseConfig:
    SECRET_KEY = "CmhK6vk2WW8yn784"
    PROPAGATE_EXCEPTIONS = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PAGINATION_PER_PAGE = 30
    JWT_SECRET_KEY = "q9cI7K2xhdXH0Bxd"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)


class DevelopmentConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = (
        "postgresql://postgres:postgres@localhost/chatterbox_dev"
    )


class TestingConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    TESTING = True
