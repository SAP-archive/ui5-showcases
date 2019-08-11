sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui5.showcaseApp.controller.Contribute", {
		onOverview: function () { //Return button
			this.getOwnerComponent().getRouter().navTo("overview", {Project: "0"}, true);
		},
	});
});