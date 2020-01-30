var baseConfig = require('./webpack.base.config');
var merge = require('webpack-merge');

var testConfig = merge(baseConfig, {
	devtool: 'inline-source-map'
});

delete testConfig.entry;

module.exports = testConfig;
