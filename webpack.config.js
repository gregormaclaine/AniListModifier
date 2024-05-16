const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TransformJson = require('transform-json-webpack-plugin');

const VERSION = require('./package.json').version;

module.exports = {
  mode: 'production',
  // devtool: 'cheap-module-source-map',
  entry: {
    background: path.resolve(__dirname, 'src', 'background.ts'),
    injection: path.resolve(__dirname, 'src', 'injection.ts'),
    'popup/main': path.resolve(__dirname, 'src', 'popup', 'main.ts'),
    'templates/compare/main': path.resolve(
      __dirname,
      'src',
      'templates',
      'compare',
      'index.ts'
    )
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: '.', to: '.', context: 'public' },
        {
          from: './src/popup',
          to: './popup',
          filter: f => !f.endsWith('.ts'),
          transform(content, file) {
            if (file.endsWith('.html')) {
              return content.toString().replace(/{{version}}/g, 'v' + VERSION);
            } else {
              return content;
            }
          }
        },
        {
          from: './src/templates',
          to: './templates',
          filter: f => !f.endsWith('.ts'),
          transform(content, file) {
            if (file.endsWith('.html')) {
              return content.toString().replace(/{{version}}/g, 'v' + VERSION);
            } else {
              return content;
            }
          }
        }
      ]
    }),
    new TransformJson({
      filename: 'manifest.json',
      source: 'public/manifest.json',
      object: { version: VERSION }
    })
  ]
  // optimization: {
  //   minimize: false
  // }
};
