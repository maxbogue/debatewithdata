# DebateWithData

DebateWithData is a website dedicated to fostering data-driven discussion
around issues.

## Installation

Create the database:

    sudo -u postgres psql
    CREATE DATABASE dwd;
    CREATE USER dwd;
    GRANT ALL PRIVILEGES ON DATABASE dwd TO dwd;
    \password dwd
    \q

Now you must set the [`SQLALCHEMY_DATABASE_URI`][db-config] variable in your
`local_settings.cfg` file to match the credentials you set for your database.
Then you can set up the server:

    python3 -m venv env
    echo '\nFLASK_APP="routes.py"\nexport FLASK_APP' >> env/bin/activate
    . env/bin/activate
    pip install --upgrade pip setuptools
    pip install flask flask-sqlalchemy flask-migrate psycopg2 bcrypt
    flask db init
    flask db upgrade
    flask run

And finally build the client code:

    npm install
    webpack --watch --progress

[db-config]: http://flask-sqlalchemy.pocoo.org/2.2/config/
