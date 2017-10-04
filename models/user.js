import bcrypt from 'bcrypt';
import config from 'config';
import jwt from 'jsonwebtoken';

import { AuthError, ClientError } from '../api/error';

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
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'password_hash',
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  User.associate = function (models) {
    User.belongsToMany(models.Claim, {
      as: 'starredClaims',
      through: {
        model: models.Star,
        unique: false,
        scope: {
          starrable: 'claim',
        }
      },
      constraints: false,
    });
  };

  const VALID_USERNAME = /^[a-z][a-z0-9]+$/;

  function validateUsername(username) {
    username = username.toLowerCase();
    if (username.length < 3) {
      throw new ClientError('Username must be at least 3 characters.');
    } else if (!VALID_USERNAME.test(username)) {
      throw new ClientError('Username can only use letters and numbers.');
    }
    return username;
  }

  function validatePassword(password) {
    if (password.length < 8) {
      throw new ClientError('Password must be at least 8 characters.');
    }
  }

  User.login = async function (username, password) {
    let user = await User.findOne({ where: { username }});
    if (!user) {
      throw new AuthError('Invalid user.');
    }
    if (!await bcrypt.compare(password, user.passwordHash)) {
      throw new AuthError('Invalid password.');
    }
    return user;
  };

  User.register = async function (username, password, email) {
    username = validateUsername(username);
    validatePassword(password);
    let passwordHash = await bcrypt.hash(password, 10);
    return User.create({ username, passwordHash, email });
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
    let user = {
      created: this.created_at,
      email: this.email,
    };
    return jwt.sign({ user }, config.get('secretKey'), {
      subject: this.username,
      expiresIn: exp,
    });
  };

  return User;
}
