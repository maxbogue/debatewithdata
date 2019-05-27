import 'systemd';

import config from 'config';
import cookieSession from 'cookie-session';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createRenderer } from 'vue-server-renderer';

import ApiImpl from './api/impl';
import { createApiRouter } from './api/router';
import { createApp } from './app';
import { ServerAuth } from './auth';
import expressLogger from './base/expressLogger';

const JS_PATH = path.resolve(__dirname, '..', 'build', 'js');

const renderer = createRenderer({
  template: fs.readFileSync('./src/index.html', 'utf-8'),
});

function createAppFromContext(context) {
  return new Promise((resolve, reject) => {
    const auth = new ServerAuth(context.authToken);
    const api = new ApiImpl(auth);
    const { app, store, router } = createApp(api, auth);

    router.push(context.url);
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();
      if (!matchedComponents.length) {
        reject({ code: 404 });
      }
      context.state = store.state;
      context.meta = app.$meta();
      resolve(app);
    }, reject);
  });
}

const server = express();
server.set('trust proxy', 'loopback');
server.use(expressLogger);
server.use(
  cookieSession({
    name: 'session',
    secret: config.get('secretKey'),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: true,
    httpOnly: false,
    sameSite: 'lax',
  })
);

server.get('/js/:filename', function(req, res) {
  res.sendFile(path.resolve(JS_PATH, req.params.filename));
});

server.use(
  '/api',
  createApiRouter(authToken => new ApiImpl(new ServerAuth(authToken)))
);

server.use('/robots.txt', express.static('static/robots.txt'));
server.use('/static', express.static('static'));

server.get('*', async (req, res) => {
  const context = {
    url: req.url,
    authToken: req.session.authToken,
  };

  try {
    const app = await createAppFromContext(context);
    const html = await renderer.renderToString(app, context);
    res.status(200).send(html);
  } catch (err) {
    console.error(err);
    res.status(500).end('Internal Server Error');
  }
});

export default server;

if (process.env.NODE_ENV !== 'test') {
  server.listen(config.get('port'));
}
