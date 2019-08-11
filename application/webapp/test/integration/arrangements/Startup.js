sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	return Opa5.extend("sap.ui5.showcaseApp.test.integration.arrangements.Startup", {

		iStartMyApp : function (oAdditionalUrlParameters) {
			oAdditionalUrlParameters = oAdditionalUrlParameters || {};
			this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui5.showcaseApp",
					async: true
				},
				hash: oAdditionalUrlParameters.hash
			});
		}

	});

});