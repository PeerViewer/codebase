const rules = require('./webpack.rules');
Obfuscator = require('webpack-obfuscator')
const CopyPlugin = require("copy-webpack-plugin");

rules.push(
    ...[
	{
	  test: /\.css$/,
	  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
        },
    ]
);

module.exports = {
  module: {
    rules,
  },
  plugins: [
	new CopyPlugin({
	      patterns: [
		{ from: "src/images/", to: "images/" },
	      ],
	}),
	/* Disabled because it creates non-deterministic issues:
        new Obfuscator({
            // this causes issues: deadCodeInjection: true,
            // causes \x20 in strings: rotateUnicodeArray: true,
            // causes \x20 in strings: encodeUnicodeLiterals: true
        }),
	*/
    ],
};

