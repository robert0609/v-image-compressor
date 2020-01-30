var webpackConfig = require('../conf/webpack.prod.config');
var path = require('path');
var webpack = require('webpack');
var rm = require('rimraf');

rm(path.resolve(__dirname, '../dist'), function (err) {
	if (err) {
		throw err;
	}

	var compiler = webpack(webpackConfig);
	compiler.run(function (err, stats) {
		if (err) {
			throw err;
		}
	});
});
