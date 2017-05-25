import unittest

from flask_testing import TestCase

from debatewithdata.models import app, db
from debatewithdata.models.claim import Claim, ArgumentLink

from sqlalchemy.schema import DropTable
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm.exc import FlushError


@compiles(DropTable, "postgresql")
def _compile_drop_table(element, compiler, **kwargs):
    return compiler.visit_drop_table(element) + " CASCADE"


TEST_SECRET_KEY = 'not so secret'
TEST_DB_URI = 'postgresql://dwd_test:egg@localhost:5432/dwd_test'


class ClaimTest(TestCase):
    def create_app(self):
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = TEST_SECRET_KEY
        app.config['SQLALCHEMY_DATABASE_URI'] = TEST_DB_URI
        return app

    def setUp(self):
        db.drop_all()
        db.create_all()
        db.engine.execute(
            'CREATE TRIGGER trigger_claim_genid BEFORE INSERT ON claim FOR EACH ROW EXECUTE PROCEDURE unique_short_id();'
        )

    def test_basic(self):
        c1 = Claim('test1')
        c2 = Claim('test2')
        link = ArgumentLink(c1, c2, True)
        db.session.add(c1)
        db.session.add(c2)
        db.session.add(link)
        db.session.commit()

        self.assertEqual([link], c1.sub_claims)
        self.assertEqual([link], c2.super_claims)

        # Can't have multiple links of the same claims.
        with self.assertRaises(FlushError):
            conflicting = ArgumentLink(c1, c2, False)
            db.session.add(conflicting)
            db.session.commit()


if __name__ == '__main__':
    unittest.main()
