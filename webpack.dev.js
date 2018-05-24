const webpack = require('webpack');
const merge = require('webpack-merge');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');

const common = require('./webpack.common');

// Merge webpack config common to all environments with this config.
module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    new BrowserSyncPlugin({ proxy: 'http://localhost:8888/zoomable-treemap-prototype/' }),
    new WebpackNotifierPlugin({alwaysNotify: true}),
  ],
});
