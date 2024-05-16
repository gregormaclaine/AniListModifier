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
      'index.tsx'
    )
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            presets: ['@babel/preset-env', 'solid', '@babel/preset-typescript'],
            plugins: [
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-object-rest-spread'
            ]
          }
        }
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
