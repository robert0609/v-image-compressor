var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');

function __path_src() {
	return path.resolve(__dirname, '../src');
}

function __path_test() {
	return path.resolve(__dirname, '../test/unit');
}

function __cssLoaders() {
	if (process.env.NODE_ENV === 'production') {
		return ExtractTextPlugin.extract({
			fallback: 'style-loader',
			use: 'css-loader'
		});
	}
	else {
		return [
			{
				loader: 'style-loader'
			},
			{
				loader: 'css-loader'
			}
		];
	}
}

function __urlLoaders() {
	if (process.env.NODE_ENV === 'production') {
		return [
			{
				loader: 'url-loader',
				options: {
					limit: 8192,
					name: 'img/[name].[ext]'
				}
			}
		];
	}
	else {
		return [
			{
				loader: 'url-loader',
				options: {
					limit: 8192,
					name: 'static/img/[name].[ext]'
				}
			}
		];
	}
}

module.exports = {
	entry: {
		index: __path_src()
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				enforce: 'pre',
				test: /\.(js|html)$/,
				include: [
					__path_src(),
					__path_test()
				],
				use: [
					{
						loader: 'eslint-loader',
						options: {
							formatter: require('eslint-friendly-formatter')
						}
					}
				]
			},
			{
				test: /\.js$/,
				include: [
					__path_src(),
					__path_test()
				],
				use: [
					{
						loader: 'babel-loader'
					}
				]
			},
			{
				test: /\.html$/,
				include: [
					__path_src(),
					__path_test()
				],
				use: [
					{
						loader: 'html-loader'
					}
				]
			},
			{
				resource: {
					test: /\.css$/,
					include: [
						__path_src(),
						__path_test()
					]
				},
				use: __cssLoaders()
			},
			{
				resource: {
					test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
					include: [
						__path_src(),
						__path_test()
					]
				},
				use: __urlLoaders()
			}
		]
	}
};
