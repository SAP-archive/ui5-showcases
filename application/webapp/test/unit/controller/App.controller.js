/*global QUnit*/

sap.ui.define([
	"sap/ui5/showcaseApp/controller/App.controller"
], function(AppController) {
	"use strict";

	QUnit.module("App Controller");

	QUnit.test("I should test the app controller", function (assert) {
		var oAppController = new AppController();
		assert.ok(oAppController);
	});

});
