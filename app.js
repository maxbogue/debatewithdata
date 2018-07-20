import 'systemd';
import config from 'config';
import express from 'express';
import path from 'path';

import api from './api';
import expressLogger from './base/expressLogger';

const INDEX_PATH = path.resolve(__dirname, 'index.html');
const JS_FILE = 'index.js';
const JS_PATH = path.resolve(__dirname, 'build', JS_FILE);
const JS_MAP_PATH = JS_PATH + '.map';

const app = express();
app.set('trust proxy', 'loopback');
app.use(expressLogger);

const sendIndex = function (req, res) {
  res.sendFile(INDEX_PATH);
};

app.get('/index.js', function (req, res) {
  res.sendFile(JS_PATH);
});

app.get('/index.js.map', function (req, res) {
  res.sendFile(JS_MAP_PATH);
});

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

app.use('/api', api);

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.get('port'));
}
