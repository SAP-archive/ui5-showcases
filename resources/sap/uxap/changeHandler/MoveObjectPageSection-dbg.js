/*!
	* OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
	*/

sap.ui.define(["sap/ui/fl/changeHandler/MoveControls", "sap/ui/thirdparty/jquery"], function(MoveControls, jQuery) {
	"use strict";

	/**
	 * ObjectPageSection Change Handler for Move
	 *
	 * @constructor
	 * @alias sap.uxap.changeHandler.MoveObjectPageSection
	 * @author SAP SE
	 * @version 1.68.1
	 * @experimental Since 1.54
	 */

	var MoveObjectPageSection = jQuery.extend({}, MoveControls);

	MoveObjectPageSection.applyChange = function (oChange, oControl, mPropertyBag) {
		var bJsControllTree = mPropertyBag.modifier.targets === "jsControlTree";
		if (bJsControllTree) {
			oControl._suppressScroll();
		}

		var vReturn = MoveControls.applyChange.call(this, oChange, oControl, mPropertyBag);

		if (bJsControllTree) {
			oControl.attachEventOnce("onAfterRenderingDOMReady", function() {
				oControl._resumeScroll(false);
			});
		}
		return vReturn;
	};

	MoveObjectPageSection.revertChange = function (oChange, oControl, mPropertyBag) {
		var bJsControllTree = mPropertyBag.modifier.targets === "jsControlTree";
		if (bJsControllTree) {
			oControl._suppressScroll();
		}

		var vReturn = MoveControls.revertChange.call(this, oChange, oControl, mPropertyBag);

		if (bJsControllTree) {
			oControl.attachEventOnce("onAfterRenderingDOMReady", function() {
				oControl._resumeScroll(false);
			});
		}
		return vReturn;
	};

	return MoveObjectPageSection;
},
/* bExport= */true);