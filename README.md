# DebateWithData

DebateWithData is a website dedicated to fostering data-driven discussion
around issues.

## Installation

Install node modules:

    npm i

Create the database:

    # linux:
    sudo -u postgres psql
    # or on mac:
    psql -d postgres
    CREATE DATABASE dwd;
    CREATE DATABASE dwd_dev;
    CREATE DATABASE dwd_test;
    CREATE USER dwd;
    GRANT ALL PRIVILEGES ON DATABASE dwd TO dwd;
    GRANT ALL PRIVILEGES ON DATABASE dwd_dev TO dwd;
    GRANT ALL PRIVILEGES ON DATABASE dwd_test TO dwd;
    \password dwd
    \q

Now create a ~/.pgpass file with the form

    # hostname:port:database:username:password
    *:*:*:dwd:<your_password_here>

Now generate secret keys and migrate your databases:

    ./bin/generate_keys
    sequelize db:migrate --env test
    sequelize db:migrate --env development
    sequelize db:migrate --env production

Finally, set up your smtpConfig in config/local.json and you're ready to go:

    npm run dev

in one terminal and

    webpack --progress --watch

in another to get the dev server working at localhost:7142.
