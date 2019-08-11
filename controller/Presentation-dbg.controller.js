sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
	"use strict";

	return Controller.extend("sap.ui5.showcaseApp.controller.Presentation", {

		onInit: function () {
			var oRouter = UIComponent.getRouterFor(this);
			// create promise for async component created event
			var oContainer = this.byId("presentationComponent");
			if (!this._oComponentCreatedPromise) {
				this._oComponentCreatedPromise = new Promise(function (fnResolve) {
					oContainer.attachComponentCreated(fnResolve);
				});
			}

			oRouter.getRoute("presentation").attachPatternMatched(this._onPatternMatched, this);
		},

		_onPatternMatched: function (oEvent) {
			var oQuery =  oEvent.getParameter("arguments")["?query"],
				iProjectId = oQuery && oQuery.project || 0,
				bExternal = oQuery && oQuery.show === "public";
			this._bExternal = bExternal;

			// ensure that component loaded
			this._oComponentCreatedPromise.then(function () {
				var oApp = this.byId("presentationComponent").getComponentInstance().getRootControl();

				// ensure that the component initiated
				oApp.loaded().then(function () {
					oApp.getController().onRouteMatched(iProjectId, bExternal);
				}.bind(oApp));
			}.bind(this));
		},

		onShowCaseComponentCreated: function (oEvent) {
			var oComponent = oEvent.getParameter("component");
			oComponent.attachNavigateToPresentation(this.onNavigateToPresentation, this);
			oComponent.attachNavigateToOverview(this.onNavigateToOverview, this);
		},

		onNavigateToOverview: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo(
				"overview",
				{
					query: {
						project: oEvent.getParameter("navTarget"),
						show: this._bExternal ? "public" : "all"
					}
				});
		},

		onNavigateToPresentation: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo(
				"presentation",
				{
					query: {
						project: oEvent.getParameter("navTarget"),
						show: this._bExternal ? "public" : "all"
					}
				},
				true);
		}

	});
});
