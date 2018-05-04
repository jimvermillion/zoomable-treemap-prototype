const webpack = require('webpack');
const { resolve } = require('path');

const cwd = __dirname;

module.exports = {
  context: resolve(cwd),
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: resolve(cwd, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      }
    ],
  },
};
