/* global module require*/

module.exports = function(config) {
	"use strict";

	require("./karma.conf")(config);

	config.set({
		// to avoid DISCONNECTED messages
		browserDisconnectTimeout : 20000, // default 2000

		preprocessors: {
			'{webapp,webapp/!(test)}/*.js': ['coverage']
		},

		coverageReporter: {
			includeAllSources: true,
			reporters: [
				{
					type: 'html',
					dir: 'coverage'
				},
				{
					type: 'text'
				}
			],
			check: {
				global: {
					statements: 23,
					branches: 23,
					functions: 23,
					lines: 23
				}
			}
		},

		reporters: ['progress', 'coverage'],

		browsers: ['ChromeHeadless'],

		singleRun: true
	});
};