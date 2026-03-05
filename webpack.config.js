'use strict';

const path = require('path');

const extConfig = {
  name: 'extension',
  mode: 'development',
  target: 'node',
  entry: './src/extension.ts',
  output: {
    filename: 'extension.js',
    path: path.resolve(__dirname, 'out'),
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{ loader: 'ts-loader', options: { configFile: 'tsconfig.ext.json' } }],
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  devtool: 'source-map',
};

const webviewConfig = {
  name: 'webview',
  mode: 'development',
  target: 'web',
  entry: './src/webview/main.ts',
  output: {
    filename: 'webview.js',
    path: path.resolve(__dirname, 'webview-dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{ loader: 'ts-loader', options: { configFile: 'tsconfig.webview.json' } }],
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map',
};

module.exports = (env) => {
  if (env && env.target === 'ext') return extConfig;
  if (env && env.target === 'webview') return webviewConfig;
  return [extConfig, webviewConfig];
};
