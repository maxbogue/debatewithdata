/* global __dirname */

const nodeExternals = require('webpack-node-externals');
const path = require('path');

const { extendBaseConfig } = require('./webpack.base.config.js');

module.exports = [
  extendBaseConfig({
    name: 'server',
    target: 'node',
    entry: './app.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'main.js'
    },
    node: {
      __filename: true,
      __dirname: true
    },
    externals: nodeExternals(),
  }),
  extendBaseConfig({
    name: 'client',
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'index.js'
    },
  }),
];
