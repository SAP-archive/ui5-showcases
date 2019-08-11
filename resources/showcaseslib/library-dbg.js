sap.ui.define([], function() {
	"use strict";

	/**
	 * A library containing showcase component
	 *
	 * @namespace
	 * @name sap.demo
	 * @public
	 */

	sap.ui.getCore().initLibrary({
		name : "showcaseslib",
		dependencies : ["sap.ui.core", "sap.m" , "sap.ui.layout"],
		types: [],
		interfaces: [],
		controls: [
			"overview.showcase",
			"overview.showcasePage",
			"overview.presentation",
			"overview.contributionPage"
		],
		elements: [],
		noLibraryCSS: true,
		version: "1.0.0"
	});

	return overview;

});
