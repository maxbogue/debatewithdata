import Api from '@/api/interface';
import Auth from '@/auth';
import { AxiosInstance } from 'axios';

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
  constructor(private auth: Auth, private http: AxiosInstance) {}

  public async register(username: string, password: string, email: string) {
    const payload = { username, password, email };
    const res = await this.http.post('/register', payload);
    return res.data;
  }

  public async verifyEmail(verificationToken: string) {
    await this.http.post('/verify-email', { token: verificationToken });
    return this.auth.getAuthToken();
  }

  public async login(username: string, password: string) {
    const payload = { username, password };
    await this.http.post('/login', payload);
    return this.auth.getAuthToken();
  }

  public async forgotPassword(email: string) {
    const res = await this.http.post('/forgot-password', { email });
    return res.data;
  }

  public async resetPassword(resetToken: string, password: string) {
    const payload = { token: resetToken, password };
    await this.http.post('/reset-password', payload);
    return this.auth.getAuthToken();
  }

  public async getUser(username: string) {
    const res = await this.http.get(`/user/${username}`);
    return res.data;
  }

  public async getItem(type: string, id: string, trail: string[]) {
    const params = paramsFromTrail(trail);
    const res = await this.http.get(`/${type}/${id}`, { params });
    return res.data;
  }

  public async getItems(
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

  public async search(query: string, types: string[], page: number) {
    const params = { query, types, page };
    const res = await this.http.get('/search', { params });
    return res.data;
  }

  public async createItem(type: string, itemData: object) {
    const res = await this.http.post(`/${type}`, itemData);
    return res.data;
  }

  public async updateItem(type: string, id: string, itemData: object) {
    const res = await this.http.put(`/${type}/${id}`, itemData);
    return res.data;
  }

  public async deleteItem(type: string, id: string, message: string) {
    const params = { message };
    const res = await this.http.delete(`/${type}/${id}`, { params });
    return res.data;
  }

  public async getItemRevs(type: string, id: string) {
    const res = await this.http.get(`/${type}/${id}/rev`);
    return res.data;
  }

  public async toggleStar(type: string, id: string) {
    const res = await this.http.post(`/${type}/${id}/star`);
    return res.data;
  }

  public async toggleWatch(type: string, id: string) {
    const res = await this.http.post(`/${type}/${id}/watch`);
    return res.data;
  }

  public async getComments(type: string, id: string) {
    const res = await this.http.get(`/${type}/${id}/comment`);
    return res.data;
  }

  public async createComment(type: string, id: string, text: string) {
    const res = await this.http.post(`/${type}/${id}/comment`, { text });
    return res.data;
  }

  public async deleteComment(type: string, id: string, commentId: string) {
    const res = await this.http.delete(`/${type}/${id}/comment/${commentId}`);
    return res.data;
  }

  public async getActivity() {
    const res = await this.http.get('/activity');
    return res.data;
  }

  public async hasNotifications() {
    const res = await this.http.get('/notifications/has');
    return res.data;
  }

  public async getNotifications() {
    const res = await this.http.get('/notifications');
    return res.data;
  }

  public async readNotifications(until: string) {
    const res = await this.http.post('/notifications/read', { until });
    return res.data;
  }
}
