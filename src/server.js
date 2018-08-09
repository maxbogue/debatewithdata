import 'systemd';
import config from 'config';
import cookieSession from 'cookie-session';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createRenderer } from 'vue-server-renderer';

import ApiImpl from './api/impl';
import expressLogger from './base/expressLogger';
import { createApiRouter } from './api/router';
import { createApp } from './app';
import { ServerAuth } from './auth';

const INDEX_PATH = path.resolve(__dirname, 'index.html');
const JS_PATH = path.resolve(__dirname, '..', 'build', 'js');

const renderer = createRenderer({
  template: fs.readFileSync('./src/index.html', 'utf-8'),
});

function createAppFromContext(context) {
  // since there could potentially be asynchronous route hooks or components,
  // we will be returning a Promise so that the server can wait until
  // everything is ready before rendering.
  return new Promise((resolve, reject) => {
    const auth = new ServerAuth(context.authToken);
    const { app, router } = createApp(auth);

    // set server-side router's location
    router.push(context.url)

    // wait until router has resolved possible async components and hooks
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // no matched routes, reject with 404
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }

      // the Promise should resolve to the app instance so it can be rendered
      resolve(app)
    }, reject)
  })
}

const server = express();
server.set('trust proxy', 'loopback');
server.use(expressLogger);
server.use(cookieSession({
  name: 'session',
  secret: config.get('secretKey'),
  maxAge: 7 * 24 * 60 * 60 * 1000,
  secure: true,
  httpOnly: false,
  sameSite: 'lax',
}));

server.get('/js/:filename', function (req, res) {
  res.sendFile(path.resolve(JS_PATH, req.params.filename));
});

server.use('/api', createApiRouter(new ApiImpl()));

server.get('*', async (req, res) => {
  const context = {
    url: req.url,
    authToken: req.session.authToken,
  };

	try {
    const app = await createAppFromContext(context);
		const html = await renderer.renderToString(app);
    res.status(200).send(html);
  } catch (err) {
    console.log(err);
    res.status(500).end('Internal Server Error');
	}
});

export default server;

if (process.env.NODE_ENV !== 'test') {
  server.listen(config.get('port'));
}
