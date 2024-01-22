const rules = require('./webpack.rules');
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
	})
    ],
};

