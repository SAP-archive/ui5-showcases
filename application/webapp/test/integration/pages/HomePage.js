sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";
	var sViewName = "Home";
	Opa5.createPageObjects({
		onTheHomePage: {

			actions: {
				iPressTheDetailsButton: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						success: function (aButtons) {
							aButtons[0].$().trigger("tap");
						},
						errorMessage: "Did not find the \"Details\" button on the page"
					});
				}
			},

			assertions: {
				iShouldSeeTheHomePage : function () {
					return this.waitFor({
						viewName: sViewName,
						id: "page",
						success: function () {
							Opa5.assert.ok(sViewName, "The home page is displayed");
						},
						errorMessage: "The home page wasn't displayed"
					});
				}
			}
		}
	});

});