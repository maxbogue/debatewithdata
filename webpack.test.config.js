/* global __dirname */

const nodeExternals = require('webpack-node-externals');
const { EnvironmentPlugin } = require('webpack');

const { extendBaseConfig } = require('./webpack.config.base.js');

module.exports = extendBaseConfig({
  mode: 'development',
  plugins: [
    new EnvironmentPlugin({ NODE_ENV: 'test' }),
  ],
  externals: [nodeExternals()],
  devtool: 'inline-cheap-module-source-map',
});
