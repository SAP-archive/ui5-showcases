sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"showcaseslib/shared/data/model/formatter"
], function (Controller, formatter) {
	"use strict";

	return Controller.extend("showcaseslib.showcase.controller.App", {
		formatter: formatter,
		_iCarouselTimeout: 0, // a pointer to the current timeout
		_iCarouselLoopTime: 100000, // loop to next picture after 8 seconds

		onInit: function () {
			this.getView().byId("contributionButton").setTooltip("Contribute");
		},

		onSectionChange: function (oEvent) {
			var oControl = oEvent.getSource();
			var sPath = oEvent.getParameter("section").getBindingContext().getPath().substr(11); //11 because the main element of the json is called "/showcases/" and we want to have the number which follows this
			oControl.scrollToSection(sPath);
		},

		onPressInfo: function (sValue) {
			window.open(sValue);
		},

		onPressButtonStartFullScreen: function (oEvent) {
			var projectId = this.byId("objectPageLayout").getSelectedSection().substr("-");
			projectId = projectId[projectId.length - 1];
			this.getOwnerComponent().fireNavigateToPresentation({
				navTarget: projectId
			});
		},

		onContribute: function (oEvent) {
			this.getOwnerComponent().fireNavigateToContributionPage();
		}
	});
});
