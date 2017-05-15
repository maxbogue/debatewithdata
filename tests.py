import unittest
from datetime import timedelta

from flask_testing import TestCase

from models import app, db, User

TEST_SECRET_KEY = 'not so secret'
TEST_DB_URI = 'postgresql://dwd_test:egg@localhost:5432/dwd_test'

USERNAME = 'abc'
PASSWORD = 'abcdefgh'
EMAIL = 'a@b.c'


class AuthTest(TestCase):
    def create_app(self):
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = TEST_SECRET_KEY
        app.config['SQLALCHEMY_DATABASE_URI'] = TEST_DB_URI
        return app

    def setUp(self):
        db.drop_all()
        db.create_all()

    def test_register(self):
        # Test invalid usernames and passwords.
        with self.assertRaises(ValueError):
            User.register('ab', PASSWORD, EMAIL)
        with self.assertRaises(ValueError):
            User.register('abc.', PASSWORD, EMAIL)
        with self.assertRaises(ValueError):
            User.register(USERNAME, 'abc', EMAIL)

        # Test valid username and password.
        u = User.register(USERNAME, PASSWORD, EMAIL)
        self.assertEqual(USERNAME, u.username)
        # The password gets salted and hashed, so it should not match.
        self.assertNotEqual(PASSWORD, u.password)
        self.assertIsNotNone(u.created)

        # Duplicate username.
        with self.assertRaises(ValueError):
            User.register(USERNAME, PASSWORD, EMAIL)

    def test_login(self):
        u = User.register(USERNAME, PASSWORD, EMAIL)

        # Bad username, bad password.
        with self.assertRaises(ValueError):
            User.login('ab', PASSWORD)
        with self.assertRaises(ValueError):
            User.login(USERNAME, 'abc')

        self.assertEqual(u, User.login(USERNAME, PASSWORD))

    def test_auth_token(self):
        u = User.register(USERNAME, PASSWORD, EMAIL)

        # Empty, invalid, expired, and wrongly-signed tokens.
        with self.assertRaises(ValueError):
            User.verify_token('')
        with self.assertRaises(ValueError):
            User.verify_token('invalid token')
        with self.assertRaises(ValueError):
            User.verify_token(u.gen_auth_token(timedelta(seconds=-1)))
        with self.assertRaises(ValueError):
            User.verify_token(u.gen_auth_token(key='bad key'))

        # Happy case.
        auth_token = u.gen_auth_token()
        self.assertEqual(u, User.verify_token(auth_token))


if __name__ == '__main__':
    unittest.main()
