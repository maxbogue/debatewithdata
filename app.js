import express from 'express';

import api from './api';

const app = express();

app.use('/static', express.static('static'));

const sendIndex = function (req, res) {
  res.sendFile('/var/www/debatewithdata/index.html');
};

app.get('/', sendIndex);
app.get('/account', sendIndex);
app.get('/login', sendIndex);
app.get('/logout', sendIndex);
app.get('/register', sendIndex);
app.get('/guide', sendIndex);
app.get('/claims', sendIndex);
app.get('/claims/add', sendIndex);
app.get('/claim/:id', sendIndex);
app.get('/claim/:id/edit', sendIndex);
app.get('/sources', sendIndex);
app.get('/sources/add', sendIndex);
app.get('/source/:id', sendIndex);
app.get('/source/:id/edit', sendIndex);

app.use('/api', api);

app.listen(7122, function () {
  /* eslint no-console: 0 */
  console.log('Example app listening on port 7122!');
});
