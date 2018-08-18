import 'systemd';
import config from 'config';
import cookieSession from 'cookie-session';
import express from 'express';
import path from 'path';

import ApiImpl from './api/impl';
import expressLogger from './base/expressLogger';
import { createApiRouter } from './api/router';

const INDEX_PATH = path.resolve(__dirname, 'index.html');
const JS_PATH = path.resolve(__dirname, '..', 'build', 'js');

const app = express();
app.set('trust proxy', 'loopback');
app.use(expressLogger);

app.use(cookieSession({
  name: 'session',
  secret: config.get('secretKey'),
  maxAge: 7 * 24 * 60 * 60 * 1000,
  secure: true,
  httpOnly: false,
  sameSite: 'lax',
}));

app.get('/js/:filename', function (req, res) {
  res.sendFile(path.resolve(JS_PATH, req.params.filename));
});

function sendIndex(req, res) {
  res.sendFile(INDEX_PATH);
}

app.get('/', sendIndex);
app.get('/:type/:id/history', sendIndex);
app.get('/:type/:id/rev/:revId', sendIndex);
app.get('/about', sendIndex);
app.get('/account', sendIndex);
app.get('/activity', sendIndex);
app.get('/admin', sendIndex);
app.get('/claim/:id', sendIndex);
app.get('/claim/:id/edit', sendIndex);
app.get('/claims', sendIndex);
app.get('/claims/add', sendIndex);
app.get('/contact', sendIndex);
app.get('/forgot-password', sendIndex);
app.get('/guide', sendIndex);
app.get('/login', sendIndex);
app.get('/logout', sendIndex);
app.get('/notifications', sendIndex);
app.get('/register', sendIndex);
app.get('/reset-password', sendIndex);
app.get('/data/:id', sendIndex);
app.get('/data/:id/edit', sendIndex);
app.get('/datas', sendIndex);
app.get('/datas/add', sendIndex);
app.get('/topic/:id', sendIndex);
app.get('/topic/:id/edit', sendIndex);
app.get('/topics', sendIndex);
app.get('/topics/add', sendIndex);
app.get('/user/:username', sendIndex);
app.get('/verify-email', sendIndex);

app.use('/api', createApiRouter(new ApiImpl()));

app.get('*', function (req, res) {
  res.status(404);
  res.sendFile(INDEX_PATH);
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.get('port'));
}
