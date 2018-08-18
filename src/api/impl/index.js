import config from 'config';
import nodemailer from 'nodemailer';

import { AuthError, ClientError, NotFoundError } from '@/api/error';
import { Claim, Comment, Source, Topic, User } from '@/models';
import { ItemType } from '@/common/constants';
import { addApiData, getTrailData } from '@/models/utils';

import { getActivity } from './activity';
import { getNotifications, hasNotifications } from './notifications';
import { search } from './search';

function makeSmtpTransport() {
  if (!config.has('smtpConfig')) {
    /* eslint no-console: "off" */
    console.warn('Missing SMTP configuration; emails will not work.');
    return null;
  }
  return nodemailer.createTransport(config.get('smtpConfig'));
}

const SMTP_TRANSPORT = makeSmtpTransport();

const ITEM_TYPE_TO_MODEL = {
  [ItemType.CLAIM]: Claim,
  [ItemType.SOURCE]: Source,
  [ItemType.TOPIC]: Topic,
};

function getModel(type) {
  if (!ITEM_TYPE_TO_MODEL[type]) {
    throw new ClientError(`Invalid item type: "${type}"`);
  }
  return ITEM_TYPE_TO_MODEL[type];
}

async function getUser(authToken) {
  if (!authToken) {
    return null;
  }
  return await User.verifyToken(authToken);
}

async function requireUser(authToken) {
  const user = await getUser(authToken);
  if (!user) {
    throw new AuthError();
  }
  return user;
}

export default class ApiImpl {
  async login(username, password) {
    const user = await User.login(username, password);
    return user.genAuthToken();
  }

  async register(username, password, email) {
    const user = await User.register(username, password, email);
    await user.sendVerificationEmail(SMTP_TRANSPORT);
    return { message: 'Email verification required.' };
  }

  async verifyEmail(verificationToken) {
    const user = await User.verifyEmail(verificationToken);
    return user.genAuthToken();
  }

  async forgotPassword(email) {
    const user = await User.forgotPassword(email);
    if (user) {
      await user.sendForgotPasswordEmail(SMTP_TRANSPORT);
    }
    return { message: 'success' };
  }

  async resetPassword(resetToken, password) {
    const user = await User.resetPassword(resetToken, password);
    return user.genAuthToken();
  }

  async createItem(authToken, type, itemData) {
    const user = await requireUser(authToken);
    const Item = getModel(type);
    const rev = await Item.apiCreate(user, itemData);
    const data = await Item.apiGet(rev.getItemId(), user);
    data.id = rev.getItemId();
    return data;
  }

  async getItem(authToken, type, id, trail) {
    const user = await getUser(authToken);
    const data = await getTrailData(trail, user);
    const itemData = await getModel(type).apiGet(id, user, Boolean(trail));
    addApiData(data, itemData);
    return data;
  }

  async getItems(authToken, type, filters, sort, page) {
    const user = await getUser(authToken);
    return await getModel(type).apiGetAll({ user, filters, sort, page });
  }

  async updateItem(authToken, type, id, itemData) {
    const user = await requireUser(authToken);
    const Item = getModel(type);
    await Item.apiUpdate(id, user, itemData);
    return await Item.apiGet(id, user);
  }

  async deleteItem(authToken, type, id, message) {
    const user = await requireUser(authToken);
    const Item = getModel(type);
    await Item.apiDelete(id, user, message);
    return await Item.apiGet(id, user);
  }

  async getItemRevs(authToken, type, id) {
    const user = await getUser(authToken);
    return await getModel(type).apiGetRevs(id, user);
  }

  async toggleStar(authToken, type, id) {
    const user = await requireUser(authToken);
    return await getModel(type).apiToggleStar(id, user);
  }

  async toggleWatch(authToken, type, id) {
    const user = await requireUser(authToken);
    return await getModel(type).apiToggleWatch(id, user);
  }

  async getComments(type, id) {
    return await Comment.apiGetAll(getModel(type), id);
  }

  async createComment(authToken, type, id, text) {
    const user = await requireUser(authToken);
    const commentModel = await Comment.apiAdd(getModel(type), id, user, text);
    const comment = await Comment.apiGet(commentModel.id);
    return { comment };
  }

  async deleteComment(authToken, type, id, commentId) {
    const user = await requireUser(authToken);
    await Comment.apiDelete(getModel(type), id, user, commentId);
    return { message: 'success' };
  }

  async getActivity() {
    const activity = await getActivity({ limit: 100 });
    return { activity };
  }

  async hasNotifications(authToken) {
    const user = await requireUser(authToken);
    return { hasNotifications: await hasNotifications(user) };
  }

  async getNotifications(authToken) {
    const user = await requireUser(authToken);
    return await getNotifications(user);
  }

  async readNotifications(authToken, until) {
    const user = await requireUser(authToken);
    if (!until) {
      throw new ClientError('"until" parameter is required.');
    }
    await user.update({ caughtUpAt: until });
    return { hasNotifications: await hasNotifications(user) };
  }

  async getUser(username) {
    const user = await User.findOne({
      where: { username },
    });
    if (!user) {
      throw new NotFoundError(`User not found: "${username}"`);
    }
    const activity = await getActivity({ user, limit: 100 });
    return {
      createdAt: user.created_at,
      admin: user.admin,
      activity,
    };
  }

  async search(authToken, query, types, page) {
    const user = await getUser(authToken);
    return await search(user, query, types, page);
  }
}
