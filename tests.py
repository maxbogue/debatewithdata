import unittest

from flask_testing import TestCase

from models import app, db, User

USERNAME = 'abc'
PASSWORD = 'abcdefgh'
EMAIL = 'a@b.c'


class AuthTest(TestCase):
    def create_app(self):
        app.config['TESTING'] = True
        app.config[
            'SQLALCHEMY_DATABASE_URI'] = 'postgresql://dwd_test:egg@localhost:5432/dwd_test'
        return app

    def setUp(self):
        db.drop_all()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

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
        self.assertNotEqual(PASSWORD, u.password)

    def test_login(self):
        u1 = User.register(USERNAME, PASSWORD, EMAIL)
        with self.assertRaises(ValueError):
            User.login('ab', PASSWORD)
        with self.assertRaises(ValueError):
            User.login(USERNAME, 'abc')

        u2 = User.login(USERNAME, PASSWORD)
        self.assertIsNotNone(u2)
        self.assertEqual(u1, u2)

    def test_auth_token(self):
        u1 = User.register(USERNAME, PASSWORD, EMAIL)
        auth_token = u1.gen_auth_token()
        u2 = User.verify_token(auth_token)
        self.assertEqual(u1, u2)


if __name__ == '__main__':
    unittest.main()
