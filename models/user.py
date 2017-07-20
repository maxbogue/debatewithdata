import bcrypt, jwt, string
from datetime import datetime, timedelta

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from debatewithdata.utils import ApiError

app = Flask("dwd")
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
        raise ApiError('Invalid username.')
    return username


def _validate_password(password):
    if len(password) < 8:
        raise ApiError('Invalid password.')


class User(db.Model):
    __tablename__ = 'dwd_user'

    username = db.Column(db.String(32), primary_key=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, nullable=False)
    created = db.Column(
        db.DateTime, nullable=False, server_default=db.func.now())

    @staticmethod
    def login(username, password):
        user = User.query.get(username)
        if user and bcrypt.checkpw(password.encode(), user.password.encode()):
            return user
        raise ApiError('Invalid username or password.')

    @staticmethod
    def register(username, password, email):
        user = User(username, password, email)
        if User.query.get(user.username):
            raise ApiError('User already exists.')
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def verify_token(auth_token):
        try:
            payload = jwt.decode(auth_token.encode(),
                                 app.config.get('SECRET_KEY'))
        except jwt.DecodeError:
            raise ApiError('Malformed or invalid auth token.', 401)
        except jwt.ExpiredSignatureError:
            raise ApiError('Expired auth token.', 401)
        user = User.query.get(payload['sub'])
        if user is None:
            raise ApiError('User for auth token does not exist.', 401)
        return user

    def __init__(self, username, password, email):
        self.username = _validate_username(username)
        _validate_password(password)
        self.password = bcrypt.hashpw(password.encode(),
                                      bcrypt.gensalt()).decode()
        self.email = email

    def gen_auth_token(self, duration=timedelta(minutes=30), key=None):
        payload = {
            'exp': datetime.utcnow() + duration,
            'iat': datetime.utcnow(),
            'sub': self.username,
            'user': {
                'created': str(self.created),
                'email': self.email,
            },
        }
        if not key:
            key = app.config['SECRET_KEY']
        return jwt.encode(payload, key, algorithm='HS256').decode()

    def __repr__(self):
        return '<User %s (email=%s)>' % (self.username, self.email)
