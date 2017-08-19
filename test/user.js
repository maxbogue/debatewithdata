import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import jwt from 'jsonwebtoken';

import { ClientError, NotFoundError } from '../api/error';
import { User } from '../models';

chai.use(chaiAsPromised);
chai.should();

const USERNAME = 'test';
const PASSWORD = 'testtest';
const EMAIL = 'test@debatewithdata.org';

describe('User', function () {
  beforeEach(function () {
    return User.sync({ force: true });
  });

  describe('.register()', function () {
    it('works with good args', async function () {
      let user = await User.register(USERNAME, PASSWORD, EMAIL);
      user.username.should.equal(USERNAME);
      user.passwordHash.should.not.be.empty;
      user.email.should.equal(EMAIL);
    });

    it('fails with bad args', async function () {
      await User.register('ab', PASSWORD, EMAIL).should.be.rejectedWith(
        ClientError, /at least 3/, 'short username');
      await User.register('abc_', PASSWORD, EMAIL).should.be.rejectedWith(
        ClientError, /letters and numbers/, 'bad username');
      await User.register('1ab', PASSWORD, EMAIL).should.be.rejectedWith(
        ClientError, /letters and numbers/, 'leading number');
      await User.register(USERNAME, 'short', EMAIL).should.be.rejectedWith(
        ClientError, /at least 8/, 'short password');
    });
  });

  describe('.login()', function () {
    it('auths with good creds', async function () {
      await User.register(USERNAME, PASSWORD, EMAIL);
      let user = await User.login(USERNAME, PASSWORD);
      user.username.should.equal(USERNAME);
      user.passwordHash.should.not.be.empty;
      user.email.should.equal(EMAIL);
    });

    it('fails with bad creds', async function () {
      await User.login(USERNAME, PASSWORD).should.be.rejectedWith(
        NotFoundError, /User not found/, 'missing user');
      await User.register(USERNAME, PASSWORD, EMAIL);
      await User.login('test2', PASSWORD).should.be.rejectedWith(
        NotFoundError, /User not found/, 'missing user 2');
      await User.login(USERNAME, 'wrong').should.be.rejectedWith(
        ClientError, /Invalid password/, 'bad password');
    });
  });

  describe('.genAuthToken()', function () {
    it('creates a valid token', async function () {
      let user = await User.register(USERNAME, PASSWORD, EMAIL);
      let token = user.genAuthToken();
      let payload = jwt.decode(token);
      payload.sub.should.equal(USERNAME);
      payload.user.email.should.equal(EMAIL);
      payload.user.created.should.equal(user.created_at.toISOString());
    });
  });

  describe('.verifyToken()', function () {
    it('verifies a valid token', async function () {
      let user = await User.register(USERNAME, PASSWORD, EMAIL);
      let token = user.genAuthToken();
      let userFromToken = await User.verifyToken(token);
      userFromToken.username.should.equal(USERNAME);
      userFromToken.passwordHash.should.not.be.empty;
      userFromToken.email.should.equal(EMAIL);
    });

    it('fails for expired token', async function () {
      let user = await User.register(USERNAME, PASSWORD, EMAIL);
      let token = user.genAuthToken(-1);
      return User.verifyToken(token).should.be.rejectedWith(
        jwt.TokenExpiredError);
    });
  });
});
