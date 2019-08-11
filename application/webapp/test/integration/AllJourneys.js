sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui5/showcaseApp/test/integration/arrangements/Startup",
	"./NavigationJourney"
], function (Opa5, Startup) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "sap.ui5.showcaseApp.view.",
		autowait: true
	});
});