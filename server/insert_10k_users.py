import random
import string

from chatterbox.app import create_app
from chatterbox.config import DevelopmentConfig
from chatterbox.database import session_scope
from chatterbox.models import User

app = create_app(DevelopmentConfig)
N = 10000
k = 16

users = [
    User(
        username="".join(
            random.choices(string.ascii_uppercase + string.digits, k=k)
        ),
        email="".join(
            random.choices(string.ascii_uppercase + string.digits, k=k)
        )
        + "@gmail.com",
        password="".join(
            random.choices(string.ascii_uppercase + string.digits, k=k)
        ),
    )
    for _ in range(N)
]

with app.app_context():
    with session_scope() as session:
        session.add_all(users)
