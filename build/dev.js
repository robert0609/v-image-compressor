var webpackConfig = require('../conf/webpack.dev.config');
var path = require('path');
var express = require('express');
var webpack = require('webpack');
var rm = require('rimraf');
var opn = require('opn');
var webpackMiddleware = require("webpack-dev-middleware");
var webpackHotMiddleware = require('webpack-hot-middleware');

rm(path.resolve(__dirname, '../dist'), function (err) {
	if (err) {
		throw err;
	}

	var port = 8888;
	var url = 'http://localhost:' + port;

	var app = express();
	var compiler = webpack(webpackConfig);

	var middleware = webpackMiddleware(compiler, {
		publicPath: webpackConfig.output.publicPath
	});
	middleware.waitUntilValid(function (stats) {
		if (stats.hasErrors()) {
			console.log('> Failed!');
			server.close(function () {
				process.exit(0);
			});
		}
		else {
			console.log('> Listenning at ' + url + '\n');
			opn(url);
		}
	});
	app.use(middleware);
	var hotMiddleware = webpackHotMiddleware(compiler);
	app.use(hotMiddleware);


	console.log('> Starting dev server...');
	var server = app.listen(port);
});
