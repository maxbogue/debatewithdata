import config from 'config';
import express from 'express';
import path from 'path';

import api from './api';

const DIRNAME = path.resolve(__dirname, '..');
const INDEX_PATH = path.resolve(DIRNAME, 'index.html');
const JS_FILE = 'index.js';
const JS_PATH = path.resolve(DIRNAME, 'build', JS_FILE);
const JS_MAP_PATH = JS_PATH + '.map';

const app = express();

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
app.get('/account', sendIndex);
app.get('/activity', sendIndex);
app.get('/admin', sendIndex);
app.get('/claim/:id', sendIndex);
app.get('/claim/:id/edit', sendIndex);
app.get('/claims', sendIndex);
app.get('/claims/add', sendIndex);
app.get('/forgot-password', sendIndex);
app.get('/guide', sendIndex);
app.get('/login', sendIndex);
app.get('/logout', sendIndex);
app.get('/register', sendIndex);
app.get('/reset-password', sendIndex);
app.get('/source/:id', sendIndex);
app.get('/source/:id/edit', sendIndex);
app.get('/sources', sendIndex);
app.get('/sources/add', sendIndex);
app.get('/status', sendIndex);
app.get('/topic/:id', sendIndex);
app.get('/topic/:id/edit', sendIndex);
app.get('/topics', sendIndex);
app.get('/topics/add', sendIndex);
app.get('/verify-email', sendIndex);

app.use('/api', api);

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.get('port'));
}
