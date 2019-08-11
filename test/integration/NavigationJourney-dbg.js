/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/HomePage",
	"./pages/OverviewPage",
	"./pages/ContributePage"
], function (opaTest) {
	"use strict";

	QUnit.module("Navigation Journey");

	opaTest("Should see the initial home of the app", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({hash: "/home"});

		// Assertions
		Then.onTheHomePage.iShouldSeeTheHomePage();
	});

	opaTest("Should navigate to showcases", function (Given, When, Then) {
		//Actions
		When.onTheHomePage.iPressTheDetailsButton();

		// Assertions
		Then.onTheOverviewPage.iShouldSeeTheOverview();
	});

	opaTest("Should see a light box", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnTheFrameImage("sap_sports_one_04.png");

		// Assertions
		Then.onTheOverviewPage.iShouldSeeALightBox();

		//Actions
		When.onTheOverviewPage.iPressTheCloseButtonOfTheLightBox();
	});

	opaTest("Should see a light box", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnTheProductPicture("sap_sports_one_01.jpg");

		// Assertions
		Then.onTheOverviewPage.iShouldSeeALightBox();

		//Actions
		When.onTheOverviewPage.iPressTheCloseButtonOfTheLightBox();
	});

	opaTest("Should see a light box", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnTheProductPicture("sap_sports_one_12.jpg");

		// Assertions
		Then.onTheOverviewPage.iShouldSeeALightBox();

		//Actions
		When.onTheOverviewPage.iPressTheCloseButtonOfTheLightBox();
	});

	opaTest("Should see a light box", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnTheProductPicture("sap_sports_one_09.jpg");

		// Assertions
		Then.onTheOverviewPage.iShouldSeeALightBox();

		//Actions
		When.onTheOverviewPage.iPressTheCloseButtonOfTheLightBox();
	});

	opaTest("Should enter and exit the presentation mode", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressTheButton("sap-icon://full-screen");

		// Assertions
		Then.onTheOverviewPage.iShouldSeeACarousel();

		//Actions
		When.onTheOverviewPage.iPressTheButton("sap-icon://exit-full-screen");
	});

	opaTest("Should navigate to the contribution page", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressTheButton("sap-icon://add-photo");

		// Assertions
		Then.onTheContributePage.iShouldSeeTheContributionPage();
	});

	opaTest("Should name your showcase", function (Given, When, Then) {
		//Actions
		When.onTheContributePage.iFillInTexts();
		// Assertions
		Then.onTheContributePage.iShouldSeeTheStepButton(2);

		//Actions
		When.onTheContributePage.iPressTheStepButton(2);
	});

	opaTest("Should define a scenario", function (Given, When, Then) {
		// Assertions
		Then.onTheContributePage.iShouldSeeTheStepButton(3);

		//Actions
		When.onTheContributePage.iPressTheStepButton(3);
	});

});