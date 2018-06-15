/* global __dirname */

const path = require('path');

const { extendBaseConfig } = require('./webpack.config.base.js');

module.exports = extendBaseConfig({
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js'
  },
});
