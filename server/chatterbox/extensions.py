from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate

marshmallow = Marshmallow()
migrate = Migrate()
bcrypt = Bcrypt()
cors = CORS()
jwt = JWTManager()
