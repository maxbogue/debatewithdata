import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import jwt from 'jsonwebtoken';

import { AuthError, ClientError } from '../api/error';
import { User } from '../models';

chai.use(chaiAsPromised);
const expect = chai.expect;

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
      expect(user.username).to.equal(USERNAME);
      expect(user.passwordHash).to.not.be.empty;
      expect(user.email).to.equal(EMAIL);
    });

    it('fails with bad args', async function () {
      await expect(User.register('ab', PASSWORD, EMAIL)).to.be.rejectedWith(
          ClientError, /at least 3/, 'short username');
      await expect(User.register('abc_', PASSWORD, EMAIL)).to.be.rejectedWith(
          ClientError, /letters and numbers/, 'bad username');
      await expect(User.register('1ab', PASSWORD, EMAIL)).to.be.rejectedWith(
          ClientError, /letters and numbers/, 'leading number');
      await expect(User.register(USERNAME, 'short', EMAIL)).to.be.rejectedWith(
          ClientError, /at least 8/, 'short password');
    });
  });

  describe('.login()', function () {
    it('auths with good creds', async function () {
      await User.register(USERNAME, PASSWORD, EMAIL);
      let user = await User.login(USERNAME, PASSWORD);
      expect(user.username).to.equal(USERNAME);
      expect(user.passwordHash).to.not.be.empty;
      expect(user.email).to.equal(EMAIL);
    });

    it('fails with bad creds', async function () {
      await expect(User.login(USERNAME, PASSWORD)).to.be.rejectedWith(
          AuthError, /Invalid user/, 'missing user');
      await User.register(USERNAME, PASSWORD, EMAIL);
      await expect(User.login('other user', PASSWORD)).to.be.rejectedWith(
          AuthError, /Invalid user/, 'other missing user');
      await expect(User.login(USERNAME, 'wrong')).to.be.rejectedWith(
          AuthError, /Invalid password/, 'bad password');
    });
  });

  describe('.genAuthToken()', function () {
    it('creates a valid token', async function () {
      let user = await User.register(USERNAME, PASSWORD, EMAIL);
      let token = user.genAuthToken();
      let payload = jwt.decode(token);
      expect(payload.sub).to.equal(USERNAME);
      expect(payload.user.email).to.equal(EMAIL);
      expect(payload.user.created).to.equal(user.created_at.toISOString());
    });
  });

  describe('.verifyToken()', function () {
    it('verifies a valid token', async function () {
      let user = await User.register(USERNAME, PASSWORD, EMAIL);
      let token = user.genAuthToken();
      let userFromToken = await User.verifyToken(token);
      expect(userFromToken.username).to.equal(USERNAME);
      expect(userFromToken.passwordHash).to.not.be.empty;
      expect(userFromToken.email).to.equal(EMAIL);
    });

    it('fails for expired token', async function () {
      let user = await User.register(USERNAME, PASSWORD, EMAIL);
      let token = user.genAuthToken(-1);
      await expect(User.verifyToken(token)).to.be.rejectedWith(
          AuthError, /Expired auth token/);
    });

    it('fails for malformed token', async function () {
      await expect(User.verifyToken('garbage')).to.be.rejectedWith(
          AuthError, /Malformed auth token/);
    });
  });
});
