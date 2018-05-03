const webpack = require('webpack');
const merge = require('webpack-merge');

const common = require('./webpack.common');

// Merge webpack config common to all environments with this config.
module.exports = merge(common, {
  devtool: 'nosources-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.optimize.UglifyJsPlugin({
      parallel: true,
      sourceMap: true,
      uglifyOptions: {
        warnings: true,
      },
    }),
  ],
});
