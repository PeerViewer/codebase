const rules = require('./webpack.rules');
Obfuscator = require('webpack-obfuscator')

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins: [
        new Obfuscator({
            // this causes issues: deadCodeInjection: true,
            rotateUnicodeArray: true,
            encodeUnicodeLiterals: true
        }),
    ],
};

