/* global __dirname */

var path = require('path');

module.exports = {
  webpack: (config) => {
    config.entry.main = path.resolve(__dirname, 'app.js');
    config.node.__dirname = false;
    return config;
  },
};
