const path = require('path');

module.exports = (env, argv) => ({
  entry: './src/KintoneRestAPIClientWx.js',
  output: {
    filename: 'kintone-rest-api-client-wechat-mp.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  devtool: argv.mode === 'development' ? 'inline-cheap-source-map' : ''
});
