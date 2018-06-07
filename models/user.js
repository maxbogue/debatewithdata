import bcrypt from 'bcrypt';
import config from 'config';
import jwt from 'jsonwebtoken';

import { AuthError, ClientError } from '../api/error';
import { ItemType } from '../common/constants';
import { ROOT_URL, randomHexString } from './utils';

const VALID_USERNAME = /^[a-z][a-z0-9]+$/;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const VERIFY_EMAIL = 'To complete your registration, verify your '
    + 'email by visiting the following link:';

const FORGOT_PASSWORD = 'To reset your password, please visit the '
    + 'following link:';

function validateUsername(username) {
  username = username.toLowerCase();
  if (username.length < 3) {
    throw new ClientError('Username must be at least 3 characters.');
  } else if (!VALID_USERNAME.test(username)) {
    throw new ClientError('Username can only use letters and numbers.');
  }
  return username;
}

function hashPassword(password) {
  if (password.length < 8) {
    throw new ClientError('Password must be at least 8 characters.');
  }
  return bcrypt.hash(password, 10);
}

export default function (sequelize, DataTypes) {
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    passwordHash: {
      field: 'password_hash',
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    emailVerificationToken: {
      field: 'email_verification_token',
      type: DataTypes.TEXT,
      defaultValue: () => randomHexString(40),
    },
    passwordResetToken: {
      field: 'password_reset_token',
      type: DataTypes.TEXT,
    },
    passwordResetExpiration: {
      field: 'password_reset_expiration',
      type: DataTypes.DATE,
    },
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    caughtUpAt: {
      field: 'caught_up_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('NOW'),
    },
  });

  User.associate = function (models) {
    User.belongsToMany(models.Claim, {
      as: 'starredClaims',
      through: {
        model: models.Star,
        unique: false,
        scope: {
          starrable: ItemType.CLAIM,
        }
      },
      constraints: false,
    });
  };

  User.postAssociate = function (models) {
    User.register = async function (username, password, email, inviteCode) {
      let invite = await models.Invite.findById(inviteCode);
      if (!invite) {
        throw new AuthError('Invalid invite code.');
      } else if (invite.user_id) {
        throw new AuthError('Invite code already used.');
      }
      username = validateUsername(username);
      let passwordHash = await hashPassword(password);
      return sequelize.transaction(async function(transaction) {
        let user = await User.create({ username, passwordHash, email }, {
          transaction,
        });
        await invite.setUser(user, { transaction });
        return user;
      });
    };

    User.login = async function (username, password) {
      let user = await User.findOne({ where: { username }});
      if (!user) {
        throw new AuthError('Invalid user.');
      } else if (user.emailVerificationToken) {
        throw new AuthError('Email verification required.');
      } else if (!await bcrypt.compare(password, user.passwordHash)) {
        throw new AuthError('Invalid password.');
      }
      return user;
    };

    User.verifyToken = async function (authToken) {
      let decoded;
      try {
        decoded = jwt.verify(authToken, config.get('secretKey'));
      } catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
          throw new AuthError('Expired auth token.');
        }
        throw new AuthError('Malformed auth token.');
      }
      let username = decoded.sub;
      let user = await User.findOne({ where: { username }});
      if (!user) {
        throw new AuthError('User not found: ' + username);
      }
      return user;
    };

    User.prototype.genAuthToken = function (exp = '7d') {
      if (this.emailVerificationToken) {
        throw new AuthError('Email verification required.');
      }
      let user = {
        createdAt: this.created_at,
        email: this.email,
        admin: this.admin,
      };
      return jwt.sign({ user }, config.get('secretKey'), {
        subject: this.username,
        expiresIn: exp,
      });
    };

    User.prototype.sendVerificationEmail = async function (transport) {
      let url = ROOT_URL + '/verify-email?token=' + this.emailVerificationToken;

      if (!transport) {
        /* eslint no-console: "off" */
        console.log('Verify ' + this.email + ': ' + url);
        return;
      }

      await transport.sendMail({
        from: 'DebateWithData <contact@debatewithdata.org>',
        to: this.email,
        subject: 'Email Verification',
        text: VERIFY_EMAIL + '\n\n' + url,
        html: `<p>${VERIFY_EMAIL}</p><p><a href="${url}">Verify Email</a></p>`,
      });
    };

    User.verifyEmail = async function (emailVerificationToken) {
      if (!emailVerificationToken) {
        throw new AuthError('Null email verification token.');
      }
      let user = await User.findOne({ where: { emailVerificationToken }});
      if (!user) {
        throw new AuthError('Invalid email verification token.');
      }
      await user.update({ emailVerificationToken: null });
      return user;
    };

    User.forgotPassword = async function (email) {
      let user = await User.findOne({ where: { email }});
      if (!user) {
        return null;
      }
      await user.update({
        passwordResetToken: randomHexString(40),
        passwordResetExpiration: new Date(Date.now() + ONE_DAY_MS),
      });
      return user;
    };

    User.prototype.sendForgotPasswordEmail = async function (transport) {
      let url = ROOT_URL + '/reset-password?token=' + this.passwordResetToken;

      if (!transport) {
        /* eslint no-console: "off" */
        console.log('Reset ' + this.email + ': ' + url);
        return;
      }

      await transport.sendMail({
        from: 'DebateWithData <contact@debatewithdata.org>',
        to: this.email,
        subject: 'Reset Password',
        text: FORGOT_PASSWORD + '\n\n' + url,
        html: `<p>${FORGOT_PASSWORD}</p>`
            + `<p><a href="${url}">Reset Password</a></p>`,
      });
    };

    User.resetPassword = async function (passwordResetToken, password) {
      let user = await User.findOne({
        where: {
          passwordResetToken,
          passwordResetExpiration: {
            [sequelize.Op.gt]: new Date(),
          },
        }
      });
      if (!user) {
        throw new AuthError('Invalid password reset token.');
      }
      let passwordHash = await hashPassword(password);
      await user.update({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiration: null,
      });
      return user;
    };
  };

  return User;
}
