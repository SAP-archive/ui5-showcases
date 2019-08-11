sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui5.showcaseApp.controller.App", {
		_iCarouselTimeout: 0, // a pointer to the current timeout
		_iCarouselLoopTime: 100000, // loop to next picture after 8 seconds

		onShowCaseComponentCreated: function(oEvent) {
			var oComponent = oEvent.getParameter("component");
			oComponent.attachButtonClicked(this.onShowCaseButtonClicked, this);
		},

		onShowCaseButtonClicked: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo(
				"overview",
				{
					query: { project: oEvent.getParameter("navTarget") }
				});
		}
	});
});
