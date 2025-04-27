const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TransformJson = require('transform-json-webpack-plugin');

const {
  version: VERSION,
  author: { email: author_email }
} = require('./package.json');

module.exports = env => {
  const isFirefox = env.browser === 'firefox';
  console.log(
    isFirefox
      ? '>>> 🦊 Building for Firefox <<<\n'
      : '>>> 🟠 Building for Chrome <<<\n'
  );

  return {
    mode: 'production',
    // devtool: 'cheap-module-source-map',
    entry: {
      background: path.resolve(__dirname, 'src', 'background', 'index.ts'),
      injection: path.resolve(__dirname, 'src', 'content', 'index.ts'),
      'templates/settings/main': path.resolve(
        __dirname,
        'src',
        'content',
        'templates',
        'settings',
        'index.ts'
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
              presets: [
                '@babel/preset-env',
                'solid',
                '@babel/preset-typescript'
              ],
              plugins: [
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-transform-class-properties',
                '@babel/plugin-transform-object-rest-spread'
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
          {
            from: '.',
            to: '.',
            context: 'public',
            filter: f => !f.match(/manifest-(chrome|firefox)\.json?$/)
          },
          {
            from: './src/popup',
            to: './popup',
            filter: f => !f.match(/\.tsx?$/),
            transform(content, file) {
              if (file.endsWith('.html')) {
                return content
                  .toString()
                  .replace(/{{version}}/g, 'v' + VERSION);
              } else {
                return content;
              }
            }
          },
          {
            from: './src/content/templates',
            to: './templates',
            filter: f => !f.match(/\.tsx?$/),
            transform(content, file) {
              if (file.endsWith('.html')) {
                return content
                  .toString()
                  .replace(/{{version}}/g, 'v' + VERSION);
              } else {
                return content;
              }
            }
          }
        ]
      }),
      new TransformJson({
        filename: 'manifest.json',
        source: `public/manifest-${isFirefox ? 'firefox' : 'chrome'}.json`,
        object: { version: VERSION }
      })
    ]
    // optimization: {
    //   minimize: false
    // }
  };
};
