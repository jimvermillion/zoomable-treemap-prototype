const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const { cpus } = require('os');
const { join, resolve } = require('path');
const { existsSync } = require('fs');

const cwd = __dirname;
const pkgPath = join(cwd, 'package.json');
const pkg = existsSync(pkgPath) ? require(pkgPath) : {};

let theme = {};
if (pkg.theme && typeof(pkg.theme) === 'string') {
  let cfgPath = pkg.theme;
  // relative path
  if (cfgPath.charAt(0) === '.') {
    cfgPath = resolve(cwd, cfgPath);
  }
  const getThemeConfig = require(cfgPath);
  theme = getThemeConfig();
} else if (pkg.theme && typeof(pkg.theme) === 'object') {
  theme = pkg.theme;
}

module.exports = {
  context: resolve(cwd),
  entry: ['babel-polyfill', './src/app.ts'],
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: resolve(cwd, 'dist'),
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        include: resolve(cwd, 'app'),
        use: [
          'cache-loader',
          {
            loader: 'thread-loader',
            options: {
              // reserve one cpu for the fork-ts-checker-webpack-plugin
              workers: cpus().length - 1,
            },
          },
          {
            loader: 'ts-loader',
            options: {
              // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
              happyPackMode: true,
            },
          },
        ],
      },
      // preserve any source maps from package dependencies
      {
        test: /\.js?$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.less/,
        use: ['style-loader', 'css-loader', {
          loader: "less-loader",
          options: {
            modifyVars: theme,
          }
        }],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'font/',
            publicPath: 'dist/',
          }
        }
      },
      {
        test: /\.(png|jpg|gif)/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'images/',
            publicPath: 'dist/',
          },
        },
      },
    ],
  },
  externals: {
    d3: 'd3',
    jquery: '$',
    vizhub: 'VizHub',
  },
};
