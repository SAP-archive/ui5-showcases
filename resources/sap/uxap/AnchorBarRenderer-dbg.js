/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(["sap/m/ToolbarRenderer", "sap/ui/core/Renderer", "sap/m/BarInPageEnabler", "./library"],
	function (ToolbarRenderer, Renderer, BarInPageEnabler, library) {
		"use strict";

		/**
		 * @class ObjectPageRenderer renderer.
		 * @static
		 */
		var AnchorBarRenderer = Renderer.extend(ToolbarRenderer);

		var _AnchorBarHierarchicalSelectMode = AnchorBarRenderer._AnchorBarHierarchicalSelectMode = {
			Icon: "icon",
			Text: "text"
		};

		AnchorBarRenderer.renderBarContent = function (rm, oToolbar) {
			if (oToolbar._bHasButtonsBar) {

				rm.renderControl(oToolbar._getScrollArrowLeft());

				rm.write("<div");
				rm.writeAttributeEscaped("id", oToolbar.getId() + "-scrollContainer");
				// ARIA attributes
				rm.writeAttributeEscaped("aria-label", sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("ANCHOR_BAR_LABEL"));
				//
				rm.addClass("sapUxAPAnchorBarScrollContainer");
				rm.writeClasses();
				rm.write(">");

				rm.write("<div");
				rm.writeAttributeEscaped("id", oToolbar.getId() + "-scroll");
				rm.writeAttributeEscaped("role", "menubar");
				rm.write(">");

				AnchorBarRenderer.renderBarItems(rm, oToolbar);

				rm.write("</div>");

				rm.write("</div>");

				rm.renderControl(oToolbar._getScrollArrowRight());
			}

			BarInPageEnabler.addChildClassTo(oToolbar._oSelect, oToolbar);
			rm.renderControl(oToolbar._oSelect);
		};

		AnchorBarRenderer.renderBarItems = function (rm, oToolbar) {

			var sSelectedItemId = oToolbar.getSelectedButton();
			oToolbar.getContent().forEach(function(oControl) {
				BarInPageEnabler.addChildClassTo(oControl, oToolbar);
				if (oControl.getId() === sSelectedItemId) {
					oControl.addStyleClass("sapUxAPAnchorBarButtonSelected");
				}
				rm.renderControl(oControl);
			});
		};

		AnchorBarRenderer.decorateRootElement = function (rm, oToolbar) {
			ToolbarRenderer.decorateRootElement.apply(this, arguments);
			if (oToolbar._sHierarchicalSelectMode === _AnchorBarHierarchicalSelectMode.Icon) {
				rm.addClass("sapUxAPAnchorBarOverflow");
			}
		};

		return AnchorBarRenderer;

	}, /* bExport= */ true);
