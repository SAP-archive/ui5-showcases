sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/UIComponent"
], function(Controller, Filter, FilterOperator, UIComponent) {
	"use strict";

	return Controller.extend("sap.ui5.showcaseApp.controller.Overview", {
		_iCarouselTimeout: 0, // a pointer to the current timeout
		_iCarouselLoopTime: 100000, // loop to next picture after 8 seconds

		onInit: function () {
			// attach to router event
			this.getRouter().getRoute("overview").attachPatternMatched(this._onPatternMatched, this);
		},

		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		onShowCaseComponentCreated: function(oEvent) {
			var oComponent = oEvent.getParameter("component");
			oComponent.attachNavigateToPresentation(this.onNavigateToPresentation, this);
			oComponent.attachNavigateToContributionPage(this.onNavigateToContributionPage, this);
		},

		onNavigateToPresentation: function(oEvent) {
			// enter full screen mode
			// has to be in a onPress function (or sth. else user driven) because its forbidden to enter fullscreen without user interaction
			var elem = this.getOwnerComponent().byId("app").getDomRef();

			if (elem.requestFullscreen) {
				 elem.requestFullscreen();
			} else if (elem.mozRequestFullScreen) { /* Firefox */
					elem.mozRequestFullScreen();
			} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
					elem.webkitRequestFullscreen();
			} else if (elem.msRequestFullscreen) { /* IE/Edge */
					elem.msRequestFullscreen();
			}

			this.getRouter().navTo("presentation", {
				query: {
					project: oEvent.getParameter("navTarget"),
					show: this._bExternal ? "public" : "all"
				}
			});
		},

		onNavigateToContributionPage: function() {
				this.getRouter().navTo("contribute");
		},

		_onPatternMatched: function(oEvent) {
			var oQuery =  oEvent.getParameter("arguments")["?query"],
				sProjectId =  oQuery && oQuery.project || 0,
				bExternal = oQuery && oQuery.show === "public",
				sPath = "/" + sProjectId;

			this._bExternal = bExternal;

			// create promise for async component created event
			var oContainer = this.byId("showCasePageComponent");
			if (!this._oComponentCreatedPromise) {
				this._oComponentCreatedPromise = new Promise(function (fnResolve) {
					oContainer.attachComponentCreated(fnResolve);
				});
			}

			// after component init trigger the scrollToSection event on the inner components object page
			this._oComponentCreatedPromise.then(function () {
				var oApp = this.getComponentInstance().getRootControl();
				oApp.loaded().then(function (oApp) {
					var oLayout = oApp.byId("objectPageLayout");
					if (bExternal) {
						var oSectionBinding = oLayout.getBinding("sections");
						var vFilterExternal = new Filter("classification", FilterOperator.EQ, "public");
						oSectionBinding.filter(vFilterExternal);
					}

					function fnScrollToTargetSection(bImmediate) {
						var aTargetSections = this.getSections().filter(function (oSection) {
							var _iPrefixLength = 10; //10 because the main element of the json is called "/showcases" and we want to have the path which follows this
							return oSection.getBindingContext().getPath().substr(_iPrefixLength) === sPath;
						});
						setTimeout(function () {
							this.scrollToSection(aTargetSections[0].getId());
						}.bind(this), (typeof bImmediate === "boolean" ? 0 : 1000));
					}

					if (!oLayout.$().length) {
						oLayout.addEventDelegate({"onAfterRendering": fnScrollToTargetSection.bind(oLayout)});
					} else {
						fnScrollToTargetSection.bind(oLayout)(true);
					}
				});
			}.bind(oContainer));
		}

	});
});
