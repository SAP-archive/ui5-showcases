/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(function () {
	"use strict";

	var BlockBaseRenderer = {};

	BlockBaseRenderer.render = function (oRm, oControl) {

		if (!oControl.getVisible()) {
			return;
		}

		oRm.write("<div");
		oRm.writeControlData(oControl);
		if (oControl._getSelectedViewContent()) {
			oRm.addClass('sapUxAPBlockBase');
			oRm.addClass("sapUxAPBlockBase" + oControl.getMode());
		} else {
			var sClassShortName = oControl.getMetadata().getName().split(".").pop();

			oRm.addClass('sapUxAPBlockBaseDefaultSize');
			oRm.addClass('sapUxAPBlockBaseDefaultSize' + sClassShortName + oControl.getMode());
		}
		oRm.writeClasses();
		oRm.write(">");

		if (oControl._getSelectedViewContent()) {
			oRm.renderControl(oControl._getSelectedViewContent());
		}
		oRm.write("</div>");
	};

	return BlockBaseRenderer;

}, /* bExport= */ true);
