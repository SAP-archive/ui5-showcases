sap.ui.define([
	"sap/ui/test/Opa5",
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/actions/EnterText',
	'sap/ui/test/actions/Press'
], function(Opa5, PropertyStrictEquals, EnterText, Press) {
	"use strict";
	var sViewName = "Contribute";
	Opa5.createPageObjects({
		onTheContributePage: {

			actions: {

				iFillInTexts : function () {
					return this.waitFor({
						controlType: "sap.m.Input",
						matchers : new PropertyStrictEquals({name: 'placeholder', value: 'Who is the owner?'}),
						actions : new EnterText({text: "SAP"}),
						success : function () {
							return this.waitFor({
								controlType: "sap.m.TextArea",
								matchers : new PropertyStrictEquals({name: 'placeholder', value: 'What does your app do?'}),
								actions : new EnterText({text: "Showcases app"}),
								errorMessage: "Didn't find the 'Description' input filed"
							});
						},
						errorMessage: "Didn't find the 'Company or Author' input filed"
					});
				},

				iPressTheStepButton : function (iStep) {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers : new PropertyStrictEquals({name: 'text', value: 'Step ' + iStep}),
						actions : new Press(),
						errorMessage: "Didn't find the Step " + iStep + " button"
					});
				}

			},

			assertions: {

				iShouldSeeTheContributionPage : function () {
					return this.waitFor({
						id: "page",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The Contribute page is displayed");
						},
						errorMessage: "Did not find the Contribute page"
					});
				},

				iShouldSeeTheStepButton : function (iStep) {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers : new PropertyStrictEquals({name: 'text', value: 'Step ' + iStep}),
						success: function () {
							Opa5.assert.ok(true, "The Step " + iStep+ " button was displayed");
						},
						errorMessage: "The Step " + iStep + " button wasn't displayed"
					});
				}

			}
		}
	});

});