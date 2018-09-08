import Api from '@/api/interface';

function paramsFromTrail(trail) {
  if (trail.length > 0) {
    return { trail: trail.join(',') };
  }
  return {};
}

function sortFilterParam([s, b]) {
  return (b ? '+' : '-') + s;
}

export default class ApiClient implements Api {
  private auth: any;
  private http: any;

  constructor(auth, http) {
    this.auth = auth;
    this.http = http;
  }

  public async register(username, password, email) {
    const payload = { username, password, email };
    const res = await this.http.post('/register', payload);
    return res.data;
  }

  public async verifyEmail(verificationToken) {
    await this.http.post('/verify-email', { token: verificationToken });
    return this.auth.getAuthToken();
  }

  public async login(username, password) {
    const payload = { username, password };
    await this.http.post('/login', payload);
    return this.auth.getAuthToken();
  }

  public async forgotPassword(email) {
    const res = await this.http.post('/forgot-password', { email });
    return res.data;
  }

  public async resetPassword(resetToken, password) {
    const payload = { token: resetToken, password };
    await this.http.post('/reset-password', payload);
    return this.auth.getAuthToken();
  }

  public async getUser(username) {
    const res = await this.http.get(`/user/${username}`);
    return res.data;
  }

  public async getItem(type, id, trail) {
    const params = paramsFromTrail(trail);
    const res = await this.http.get(`/${type}/${id}`, { params });
    return res.data;
  }

  public async getItems(type, filters, sort, page) {
    const params = {
      filter: filters.map(sortFilterParam).join(','),
      page,
      sort: sortFilterParam(sort),
    };
    const res = await this.http.get(`/${type}`, { params });
    return res.data;
  }

  public async search(query, types, page) {
    const params = { query, types, page };
    const res = await this.http.get('/search', { params });
    return res.data;
  }

  public async createItem(type, itemData) {
    const res = await this.http.post(`/${type}`, itemData);
    return res.data;
  }

  public async updateItem(type, id, itemData) {
    const res = await this.http.put(`/${type}/${id}`, itemData);
    return res.data;
  }

  public async deleteItem(type, id, message) {
    const params = { message };
    const res = await this.http.delete(`/${type}/${id}`, { params });
    return res.data;
  }

  public async getItemRevs(type, id) {
    const res = await this.http.get(`/${type}/${id}/rev`);
    return res.data;
  }

  public async toggleStar(type, id) {
    const res = await this.http.post(`/${type}/${id}/star`);
    return res.data;
  }

  public async toggleWatch(type, id) {
    const res = await this.http.post(`/${type}/${id}/watch`);
    return res.data;
  }

  public async getComments(type, id) {
    const res = await this.http.get(`/${type}/${id}/comment`);
    return res.data;
  }

  public async createComment(type, id, text) {
    const res = await this.http.post(`/${type}/${id}/comment`, { text });
    return res.data;
  }

  public async deleteComment(type, id, commentId) {
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

  public async readNotifications(until) {
    const res = await this.http.post('/notifications/read', { until });
    return res.data;
  }
}
