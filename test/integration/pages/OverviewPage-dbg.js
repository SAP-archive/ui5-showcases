sap.ui.define([
	"sap/ui/test/Opa5",
	'sap/ui/test/actions/Press',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/matchers/AggregationFilled'
], function(Opa5, Press, PropertyStrictEquals,AggregationFilled) {
	"use strict";

	var sViewName = "Overview";
	Opa5.createPageObjects({
		onTheOverviewPage: {

			actions: {

				iPressOnTheFrameImage : function (sImage) {
					var sSrc = sap.ui.require.toUrl("showcaseslib/shared/data/small/") + sImage;
					return this.waitFor({
						controlType : "showcaseslib.FrameImage",
						matchers: new PropertyStrictEquals({name: "src", value: sSrc}),
						actions : new Press(),
						errorMessage : "Did not find the FrameImage"
					});

				},

				iPressOnTheProductPicture : function (sImage) {
					var sSrc = sap.ui.require.toUrl("showcaseslib/shared/data/small/") + sImage;
					return this.waitFor({
						controlType : "sap.m.Image",
						matchers: new PropertyStrictEquals({name: "src", value: sSrc}),
						actions : new Press(),
						errorMessage : "Did not find the image"
					});

				},

				iPressTheCloseButtonOfTheLightBox: function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers : new PropertyStrictEquals({name : "text", value : "Close"}),
						actions : new Press(),
						errorMessage : "Did not find the Close button"
					});
				},

				iPressTheButton : function (sIcon) {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers : new PropertyStrictEquals({name : "icon", value : sIcon}),
						actions : new Press(),
						errorMessage : "Did not find a button with icon " + sIcon
					});
				}
			},

			assertions: {
				iShouldSeeTheOverview : function () {
					return this.waitFor({
						id: "page",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The Overview view is displayed");
						},
						errorMessage: "Did not find the Overview view"
					})
				},

				iShouldSeeALightBox : function () {
					return this.waitFor({
						controlType : "sap.m.LightBox",
						success : function () {
							Opa5.assert.ok(true, "The light box is displayed");
						},
						errorMessage : "The light box wasn't displayed"
					});
				},

				iShouldSeeACarousel : function () {
					return this.waitFor({
						controlType : "sap.m.Carousel",
						matchers : new AggregationFilled({name : "pages"}),
						success : function () {
							Opa5.assert.ok(true, "The carousel was displayed and showed contents");
						},
						errorMessage : "The carousel wasn't displayed or it didn't show any content"
					});
				}
			}
		}
	});

});