function paramsFromTrail(trail) {
  if (trail.length > 0) {
    return { trail: trail.join(',') };
  }
  return {};
}

function sortFilterParam([s, b]) {
  return (b ? '+' : '-') + s;
}

export default class ApiClient {
  constructor(auth, http) {
    this.auth = auth;
    this.http = http;
  }

  async register(username, password, email) {
    const payload = { username, password, email };
    const res = await this.http.post('/register', payload);
    return res.data;
  }

  async verifyEmail(verificationToken) {
    await this.http.post('/verify-email', { token: verificationToken });
    return this.auth.getAuthToken();
  }

  async login(username, password) {
    const payload = { username, password };
    await this.http.post('/login', payload);
    return this.auth.getAuthToken();
  }

  async forgotPassword(email) {
    const res = await this.http.post('/forgot-password', { email });
    return res.data;
  }

  async resetPassword(resetToken, password) {
    const payload = { token: resetToken, password };
    await this.http.post('/reset-password', payload);
    return this.auth.getAuthToken();
  }

  async getItem(type, id, trail) {
    const params = paramsFromTrail(trail);
    const res = await this.http.get(`/${type}/${id}`, { params });
    return res.data;
  }

  async getItems(type, filters, sort, page) {
    const params = {
      sort: sortFilterParam(sort),
      filter: filters.map(sortFilterParam).join(','),
      page,
    };
    const res = await this.http.get(`/${type}`, { params });
    return res.data;
  }

  async createItem(type, itemData) {
    const res = await this.http.post(`/${type}`, itemData);
    return res.data;
  }

  async updateItem(type, id, itemData) {
    const res = await this.http.put(`/${type}/${id}`, itemData);
    return res.data;
  }

  async deleteItem(type, id, message) {
    const params = { message };
    const res = await this.http.delete(`/${type}/${id}`, { params });
    return res.data;
  }

  /*
  async getItemRevs(type, id) {
    throw new Error('not implemented');
  }

  async toggleStar(type, id) {
    throw new Error('not implemented');
  }

  async toggleWatch(type, id) {
    throw new Error('not implemented');
  }

  async getComments(type, id) {
    throw new Error('not implemented');
  }

  async createComment(type, id, text) {
    throw new Error('not implemented');
  }

  async deleteComment(type, id, commentId) {
    throw new Error('not implemented');
  }

  async getActivity() {
    throw new Error('not implemented');
  }
  */

  async hasNotifications() {
    const res = await this.http.get('/notifications/has');
    return res.data;
  }

  async getNotifications() {
    const res = await this.http.get('/notifications');
    return res.data;
  }

  async readNotifications(until) {
    const res = await this.http.post('/notifications/read', { until });
    return res.data;
  }

  async getUser(username) {
    const res = await this.http.get(`/user/${username}`);
    return res.data;
  }

  async search(query, types, page) {
    const params = { query, types, page };
    const res = await this.http.get('/search', { params });
    return res.data;
  }
}
