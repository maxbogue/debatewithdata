import Router from 'express-promise-router';
import config from 'config';
import nodemailer from 'nodemailer';

import { User } from '../models';
import { AuthError } from './error';

function makeSmtpTransport() {
  if (!config.has('smtpConfig')) {
    /* eslint no-console: "off" */
    console.warn('Missing SMTP configuration; emails will not work.');
    return null;
  }
  return nodemailer.createTransport(config.get('smtpConfig'));
}

const AUTH_HEADER_REGEX = /^Bearer (.+)$/;
const SMTP_TRANSPORT = makeSmtpTransport();

// A middleware that parses the authorization request header and sets req.user
// if it is valid.
export async function parseAuthHeader(req, res, next) {
  if (req.headers.authorization) {
    let match = req.headers.authorization.match(AUTH_HEADER_REGEX);
    if (!match) {
      throw new AuthError('Malformed auth token.');
    }
    let user = await User.verifyToken(match[1]);
    req.user = user;
  }
  next();
}

const router = Router();

router.post('/login', async function (req, res) {
  let user = await User.login(req.body.username, req.body.password);
  res.json({ authToken: user.genAuthToken() });
});

router.post('/register', async function (req, res) {
  let user = await User.register(
      req.body.username, req.body.password, req.body.email, req.body.invite);
  await user.sendVerificationEmail(SMTP_TRANSPORT);
  res.json({ message: 'Email verification required.' });
});

router.post('/verify-email', async function (req, res) {
  let user = await User.verifyEmail(req.body.token);
  res.json({ authToken: user.genAuthToken() });
});

router.post('/forgot-password', async function (req, res) {
  let user = await User.forgotPassword(req.body.email);
  if (user) {
    await user.sendForgotPasswordEmail(SMTP_TRANSPORT);
  }
  res.json({ message: 'success' });
});

router.post('/reset-password', async function (req, res) {
  let user = await User.resetPassword(req.body.token, req.body.password);
  res.json({ authToken: user.genAuthToken() });
});

export default router;

