const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'cheap-module-source-map',
  entry: {
    background: path.resolve(__dirname, 'src', 'background.ts'),
    injection: path.resolve(__dirname, 'src', 'injection.ts'),
    'popup/main': path.resolve(__dirname, 'src', 'popup', 'main.ts')
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
        { from: './src/popup', to: './popup', filter: f => !f.endsWith('.ts') }
      ]
    })
  ]
  // optimization: {
  //   minimize: false
  // }
};
