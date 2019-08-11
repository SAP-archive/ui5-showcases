sap.ui.define([
	"showcaseslib/shared/control/FrameImage"
], function(FrameImage) {
	"use strict";

	QUnit.module("Custom Control", {
		beforeEach: function () {
			this.oFrameImage = new FrameImage();
		},
		afterEach: function () {
			this.oFrameImage.destroy();
		}
	});

	QUnit.test("setSrc sets the src property correctly", function (assert) {
		this.oFrameImage.setProperty("device", "tablet");
		var sSrc="resources/showcaseslib/data/small/SAPSportsOne_04.png";

		this.oFrameImage.setSrc(sSrc);
		assert.strictEqual(sSrc, this.oFrameImage.getSrc(), "the source of the image is set");

		this.oFrameImage.setSrc("");
		assert.strictEqual("", this.oFrameImage.getSrc(), "the source of the image din't change");
	});

	QUnit.test("Set device property tablet should return tablet css classes", function (assert) {
		this.oFrameImage.setProperty("device", "tablet");
		var sLightBoxClass = this.oFrameImage.getLightBoxClass(),
			sFrameImageClass = this.oFrameImage.getFrameImageClass(),
			sContentClass = this.oFrameImage.getContentClass(),
			sRootClass = this.oFrameImage.getRootClass();

		assert.strictEqual(sLightBoxClass, "sc-frameimage__magnifier--tablet", "'lightBoxClass' was set for tablet");
		assert.strictEqual(sFrameImageClass, "sc-frameimage__frame--tablet", "'frameImageClass' was set for tablet");
		assert.strictEqual(sContentClass, "sc-frameimage__content--tablet", "'contentClass' was set for tablet");
		assert.strictEqual(sRootClass, "sc-frameimage--tablet", "'rootClass' was set for tablet");
	});

	QUnit.test("Set device property desktop should return desktop css classes", function (assert) {
		this.oFrameImage.setProperty("device", "desktop");
		var sLightBoxClass = this.oFrameImage.getLightBoxClass(),
			sFrameImageClass = this.oFrameImage.getFrameImageClass(),
			sContentClass = this.oFrameImage.getContentClass(),
			sRootClass = this.oFrameImage.getRootClass();

		assert.strictEqual(sLightBoxClass, "", "'lightBoxClass' was set for desktop");
		assert.strictEqual(sFrameImageClass, "sc-frameimage__frame--desktop", "'frameImageClass' was set for desktop");
		assert.strictEqual(sContentClass, "sc-frameimage__content--desktop", "'contentClass' was set for desktop");
		assert.strictEqual(sRootClass, "sc-frameimage--desktop", "'rootClass' was set for desktop");
	});

	QUnit.test("Set device property laptop should return laptop css classes", function (assert) {
		this.oFrameImage.setProperty("device", "laptop");
		var sLightBoxClass = this.oFrameImage.getLightBoxClass(),
			sFrameImageClass = this.oFrameImage.getFrameImageClass(),
			sContentClass = this.oFrameImage.getContentClass(),
			sRootClass = this.oFrameImage.getRootClass();

		assert.strictEqual(sLightBoxClass, "sc-frameimage__magnifier--laptop", "'lightBoxClass' was set for laptop");
		assert.strictEqual(sFrameImageClass, "sc-frameimage__frame--laptop", "'frameImageClass' was set for laptop");
		assert.strictEqual(sContentClass, "sc-frameimage__content--laptop", "'contentClass' was set for laptop");
		assert.strictEqual(sRootClass, "sc-frameimage--laptop", "'rootClass' was set for laptop");
	});

	QUnit.test("Set device property phone should return phone css classes", function (assert) {
		this.oFrameImage.setProperty("device", "phone");
		var sLightBoxClass = this.oFrameImage.getLightBoxClass(),
			sFrameImageClass = this.oFrameImage.getFrameImageClass(),
			sContentClass = this.oFrameImage.getContentClass(),
			sRootClass = this.oFrameImage.getRootClass();

		assert.strictEqual(sLightBoxClass, "sc-frameimage__magnifier--tablet", "'lightBoxClass' was set for phone");
		assert.strictEqual(sFrameImageClass, "", "'frameImageClass' was set for phone");
		assert.strictEqual(sContentClass, "", "'contentClass' was set for phone");
		assert.strictEqual(sRootClass, "", "'rootClass' was set for phone");
	});

	QUnit.test("Call the 'init' function should call the 'setDensityAware' and 'addStyleClass'", function (assert) {
		this.oFrameImage.init();
		assert.ok(true,"functions are called successfully");
	});
});