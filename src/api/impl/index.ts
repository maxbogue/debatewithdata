import config from 'config';
import nodemailer from 'nodemailer';

import { AuthError, ClientError, NotFoundError } from '@/api/error';
import Api from '@/api/interface';
import { ItemType } from '@/common/constants';
import { Claim, Comment, Source, Topic, User } from '@/models';
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

export default class ApiImpl implements Api {
  private auth: any;

  constructor(auth) {
    this.auth = auth;
  }

  public async login(username, password) {
    const user = await User.login(username, password);
    return user.genAuthToken();
  }

  public async register(username, password, email) {
    const user = await User.register(username, password, email);
    await user.sendVerificationEmail(SMTP_TRANSPORT);
    return { message: 'Email verification required.' };
  }

  public async verifyEmail(verificationToken) {
    const user = await User.verifyEmail(verificationToken);
    return user.genAuthToken();
  }

  public async forgotPassword(email) {
    const user = await User.forgotPassword(email);
    if (user) {
      await user.sendForgotPasswordEmail(SMTP_TRANSPORT);
    }
    return { message: 'success' };
  }

  public async resetPassword(resetToken, password) {
    const user = await User.resetPassword(resetToken, password);
    return user.genAuthToken();
  }

  public async createItem(type, itemData) {
    const user = await this.requireUser();
    const Item = getModel(type);
    const rev = await Item.apiCreate(user, itemData);
    const data = await Item.apiGet(rev.getItemId(), user);
    data.id = rev.getItemId();
    return data;
  }

  public async getItem(type, id, trail) {
    const user = await this.optionalUser();
    const data = await getTrailData(trail, user);
    const itemData = await getModel(type).apiGet(id, user, trail.length > 0);
    addApiData(data, itemData);
    return data;
  }

  public async getItems(type, filters, sort, page) {
    const user = await this.optionalUser();
    return await getModel(type).apiGetAll({ user, filters, sort, page });
  }

  public async updateItem(type, id, itemData) {
    const user = await this.requireUser();
    const Item = getModel(type);
    await Item.apiUpdate(id, user, itemData);
    return await Item.apiGet(id, user);
  }

  public async deleteItem(type, id, message) {
    const user = await this.requireUser();
    const Item = getModel(type);
    await Item.apiDelete(id, user, message);
    return await Item.apiGet(id, user);
  }

  public async getItemRevs(type, id) {
    const user = await this.optionalUser();
    return await getModel(type).apiGetRevs(id, user);
  }

  public async toggleStar(type, id) {
    const user = await this.requireUser();
    return await getModel(type).apiToggleStar(id, user);
  }

  public async toggleWatch(type, id) {
    const user = await this.requireUser();
    return await getModel(type).apiToggleWatch(id, user);
  }

  public async getComments(type, id) {
    return await Comment.apiGetAll(getModel(type), id);
  }

  public async createComment(type, id, text) {
    const user = await this.requireUser();
    const commentModel = await Comment.apiAdd(getModel(type), id, user, text);
    const comment = await Comment.apiGet(commentModel.id);
    return { comment };
  }

  public async deleteComment(type, id, commentId) {
    const user = await this.requireUser();
    await Comment.apiDelete(getModel(type), id, user, commentId);
    return { message: 'success' };
  }

  public async getActivity() {
    const activity = await getActivity({ limit: 100 });
    return { activity };
  }

  public async hasNotifications() {
    const user = await this.requireUser();
    return { hasNotifications: await hasNotifications(user) };
  }

  public async getNotifications() {
    const user = await this.requireUser();
    return await getNotifications(user);
  }

  public async readNotifications(until) {
    const user = await this.requireUser();
    if (!until) {
      throw new ClientError('"until" parameter is required.');
    }
    await user.update({ caughtUpAt: until });
    return { hasNotifications: await hasNotifications(user) };
  }

  public async getUser(username) {
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

  public async search(query, types, page) {
    const user = await this.optionalUser();
    return await search(user, query, types, page);
  }

  private async optionalUser() {
    const authToken = this.auth.getAuthToken();
    if (!authToken) {
      return null;
    }
    return await User.verifyToken(authToken);
  }

  private async requireUser() {
    const user = await this.optionalUser();
    if (!user) {
      throw new AuthError();
    }
    return user;
  }
}