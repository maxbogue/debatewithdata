from .user import db, User


class ArgumentLink(db.Model):
    claim_id = db.Column(
        db.Text, db.ForeignKey('claim.id'), primary_key=True, nullable=False)
    argument_id = db.Column(
        db.Text, db.ForeignKey('claim.id'), primary_key=True, nullable=False)
    is_for = db.Column(db.Boolean, nullable=False)

    def __init__(self, claim, argument, is_for):
        self.claim = claim
        self.argument = argument
        self.is_for = is_for

    def __repr__(self):
        return '<ArgumentLink: "%s" %s "%s">' % (self.argument.text, 'supports'
                                                 if self.is_for else 'opposes',
                                                 self.claim.text)


class Claim(db.Model):
    id = db.Column(
        db.Text,
        primary_key=True,
        nullable=False,
        server_default=db.FetchedValue())
    text = db.Column(db.Text, nullable=False)
    sub_claims = db.relationship(
        ArgumentLink, primaryjoin=id == ArgumentLink.claim_id, backref='claim')
    super_claims = db.relationship(
        ArgumentLink,
        primaryjoin=id == ArgumentLink.argument_id,
        backref='argument')

    def __init__(self, text):
        self.text = text
