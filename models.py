from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
app.config.from_pyfile('default_settings.cfg')
app.config.from_pyfile('local_settings.cfg')

db = SQLAlchemy(app)
migrate = Migrate(app, db)


class DwdUser(db.Model):
    username = db.Column(db.String(32), primary_key=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, nullable=False)

    def __init__(self, username, password, email):
        self.username = username
        self.password = password
        self.email = email

    def __repr__(self):
        return '<User %d (email=%s)>' % (self.username, self.email)
