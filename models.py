import bcrypt, datetime, jwt, string
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
app.config.from_pyfile('default_settings.cfg')
app.config.from_pyfile('local_settings.cfg')

db = SQLAlchemy(app)
migrate = Migrate(app, db)

VALID_USERNAME_CHARS = string.ascii_lowercase + string.digits


def _all_valid_chars(s):
    for c in s:
        if c not in VALID_USERNAME_CHARS:
            return False
    return True


def _validate_username(username):
    username = username.lower()
    if len(username) < 3 or not _all_valid_chars(username):
        raise ValueError('Invalid username.')
    return username


class User(db.Model):
    __tablename__ = 'dwd_user'

    username = db.Column(db.String(32), primary_key=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, nullable=False)

    @staticmethod
    def login(username, password):
        user = User.query.get(username)
        if user and bcrypt.checkpw(password.encode(), user.password):
            return user
        return None

    @staticmethod
    def register(username, password, email):
        user = User(username, password, email)
        if User.query.get(user.username):
            raise ValueError('User already exists.')
        db.session.commit()
        return user

    @staticmethod
    def verify_token(auth_token):
        payload = jwt.decode(auth_token, app.config.get('SECRET_KEY'))
        return User.query.get(payload['sub'])

    def __init__(self, username, password, email):
        self.username = _validate_username(username)
        self.password = bcrypt.hashpw(password.encode(),
                                      bcrypt.gensalt()).decode()
        self.email = email

    def gen_auth_token(self):
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=30),
            'iat': datetime.datetime.utcnow(),
            'sub': self.username
        }
        return jwt.encode(
            payload, app.config.get('SECRET_KEY'), algorithm='HS256')

    def __repr__(self):
        return '<User %s (email=%s)>' % (self.username, self.email)
