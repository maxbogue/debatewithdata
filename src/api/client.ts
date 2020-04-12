import { AxiosInstance } from 'axios';

import Api from '@/api/interface';
import Auth from '@/auth';

function paramsFromTrail(trail: string[]) {
  if (trail.length > 0) {
    return { trail: trail.join(',') };
  }
  return {};
}

function sortFilterParam([s, b]: [string, boolean]) {
  return (b ? '+' : '-') + s;
}

export default class ApiClient implements Api {
  private readonly auth: Auth;
  private readonly http: AxiosInstance;

  constructor(auth: Auth, http: AxiosInstance) {
    this.auth = auth;
    this.http = http;
  }

  async register(username: string, password: string, email: string) {
    const payload = { username, password, email };
    const res = await this.http.post('/register', payload);
    return res.data;
  }

  async verifyEmail(verificationToken: string) {
    await this.http.post('/verify-email', { token: verificationToken });
    return this.auth.getAuthToken();
  }

  async login(username: string, password: string) {
    const payload = { username, password };
    await this.http.post('/login', payload);
    return this.auth.getAuthToken();
  }

  async forgotPassword(email: string) {
    const res = await this.http.post('/forgot-password', { email });
    return res.data;
  }

  async resetPassword(resetToken: string, password: string) {
    const payload = { token: resetToken, password };
    await this.http.post('/reset-password', payload);
    return this.auth.getAuthToken();
  }

  async getUser(username: string) {
    const res = await this.http.get(`/user/${username}`);
    return res.data;
  }

  async getItem(type: string, id: string, trail: string[]) {
    const params = paramsFromTrail(trail);
    const res = await this.http.get(`/${type}/${id}`, { params });
    return res.data;
  }

  async getItems(
    type: string,
    filters: Array<[string, boolean]>,
    sort: [string, boolean],
    page: number
  ) {
    const params = {
      filter: filters.map(sortFilterParam).join(','),
      page,
      sort: sortFilterParam(sort),
    };
    const res = await this.http.get(`/${type}`, { params });
    return res.data;
  }

  async search(query: string, types: string[], page: number) {
    const params = { query, types, page };
    const res = await this.http.get('/search', { params });
    return res.data;
  }

  async createItem(type: string, itemData: object) {
    const res = await this.http.post(`/${type}`, itemData);
    return res.data;
  }

  async updateItem(type: string, id: string, itemData: object) {
    const res = await this.http.put(`/${type}/${id}`, itemData);
    return res.data;
  }

  async deleteItem(type: string, id: string, message: string) {
    const params = { message };
    const res = await this.http.delete(`/${type}/${id}`, { params });
    return res.data;
  }

  async getItemRevs(type: string, id: string) {
    const res = await this.http.get(`/${type}/${id}/rev`);
    return res.data;
  }

  async toggleStar(type: string, id: string) {
    const res = await this.http.post(`/${type}/${id}/star`);
    return res.data;
  }

  async toggleWatch(type: string, id: string) {
    const res = await this.http.post(`/${type}/${id}/watch`);
    return res.data;
  }

  async getComments(type: string, id: string) {
    const res = await this.http.get(`/${type}/${id}/comment`);
    return res.data;
  }

  async createComment(type: string, id: string, text: string) {
    const res = await this.http.post(`/${type}/${id}/comment`, { text });
    return res.data;
  }

  async deleteComment(type: string, id: string, commentId: string) {
    const res = await this.http.delete(`/${type}/${id}/comment/${commentId}`);
    return res.data;
  }

  async getActivity() {
    const res = await this.http.get('/activity');
    return res.data;
  }

  async hasNotifications() {
    const res = await this.http.get('/notifications/has');
    return res.data;
  }

  async getNotifications() {
    const res = await this.http.get('/notifications');
    return res.data;
  }

  async readNotifications(until: string) {
    const res = await this.http.post('/notifications/read', { until });
    return res.data;
  }
}
