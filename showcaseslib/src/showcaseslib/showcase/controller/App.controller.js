sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"showcaseslib/shared/data/model/formatter",
	"sap/ui/model/json/JSONModel"
], function( Controller, formatter, JSONModel) {
	"use strict";

	return Controller.extend("showcaseslib.showcase.controller.App", {
		formatter: formatter,
		_iCarouselTimeout: 0, // a pointer to the current timeout
		_iCarouselLoopTime: 100000, // loop to next picture after 8 seconds

		onInit: function () {
			var sPath = sap.ui.require.toUrl('showcaseslib') + '/shared/data/model/showcases.json';
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
		},

		onDetailsPress: function(oEvent) {
			var oCarousel = oEvent.getSource();
			//var sPath = oCarousel.getBindingContext().getPath().substr(1);
			//sap.ui.getCore().byId("basicTemplate---app").getParent().getRouter().navTo("overview", {Project: sPath});
			this.getOwnerComponent().fireButtonClicked({
				navTarget : oCarousel.getBindingContext().getPath().substr(11)
			});
		}
	});
});