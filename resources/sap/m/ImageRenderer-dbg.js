/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides default renderer for control sap.m.Image
sap.ui.define(['sap/m/library', "sap/base/security/encodeCSS"],
	function(library, encodeCSS) {
	"use strict";

	// shortcut for sap.m.ImageMode
	var ImageMode = library.ImageMode;

	/**
	 * Image renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var ImageRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oImage The control that should be rendered
	 */
	ImageRenderer.render = function(oRm, oImage) {
		var sMode = oImage.getMode(),
			alt = oImage.getAlt(),
			tooltip = oImage.getTooltip_AsString(),
			bHasPressHandlers = oImage.hasListeners("press"),
			oLightBox = oImage.getDetailBox(),
			sUseMap = oImage.getUseMap(),
			aLabelledBy = oImage.getAriaLabelledBy(),
			aDescribedBy = oImage.getAriaDescribedBy();

		// Additional element for Image with LightBox
		if (oLightBox) {
			oRm.write("<span class=\"sapMLightBoxImage\"");
			oRm.writeControlData(oImage);
			oRm.write(">");
			oRm.write("<span class=\"sapMLightBoxMagnifyingGlass\"></span>");
		}


		// Open the DOM element tag. The 'img' tag is used for mode sap.m.ImageMode.Image and 'span' tag is used for sap.m.ImageMode.Background
		oRm.write(sMode === ImageMode.Image ? "<img" : "<span");

		if (!oLightBox) {
			oRm.writeControlData(oImage);
		} else {
			oRm.writeAttribute("id", oImage.getId() + "-inner");
		}

		// aria-labelledby references
		if (!oImage.getDecorative() && aLabelledBy && aLabelledBy.length > 0) {
			oRm.writeAttributeEscaped("aria-labelledby", aLabelledBy.join(" "));
		}

		// aria-describedby references
		if (!oImage.getDecorative() && aDescribedBy && aDescribedBy.length > 0) {
			oRm.writeAttributeEscaped("aria-describedby", aDescribedBy.join(" "));
		}

		if (sMode === ImageMode.Image) {
			oRm.writeAttributeEscaped("src", oImage._getDensityAwareSrc());
		} else {
			// preload the image with a window.Image instance. The source uri is set to the output DOM node via CSS style 'background-image' after the source image is loaded (in onload function)
			oImage._preLoadImage(oImage._getDensityAwareSrc());
			if (oImage._isValidBackgroundSizeValue(oImage.getBackgroundSize())) {
				oRm.addStyle("background-size", oImage.getBackgroundSize());
			}
			if (oImage._isValidBackgroundPositionValue(oImage.getBackgroundPosition())) {
				oRm.addStyle("background-position", oImage.getBackgroundPosition());
			}
			oRm.addStyle("background-repeat", encodeCSS(oImage.getBackgroundRepeat()));
		}

		oRm.addClass("sapMImg");
		if (oImage.hasListeners("press") || oImage.hasListeners("tap")) {
			oRm.addClass("sapMPointer");
		}

		if (sUseMap || !oImage.getDecorative() || bHasPressHandlers) {
			oRm.addClass("sapMImgFocusable");
		}

		oRm.writeClasses();

		//TODO implement the ImageMap control
		if (sUseMap) {
			if (!(sUseMap.startsWith("#"))) {
				sUseMap = "#" + sUseMap;
			}
			oRm.writeAttributeEscaped("usemap", sUseMap);
		}

		if (oImage.getDecorative() && !sUseMap && !bHasPressHandlers) {
			oRm.writeAttribute("role", "presentation");
			oRm.writeAttribute("aria-hidden", "true");
			oRm.write(" alt=''"); // accessibility requirement: write always empty alt attribute for decorative images
		} else {
			if (alt || tooltip) {
				oRm.writeAttributeEscaped("alt", alt || tooltip);
			}
		}

		if (alt || tooltip) {
			oRm.writeAttributeEscaped("aria-label", alt || tooltip);
		}

		if (tooltip) {
			oRm.writeAttributeEscaped("title", tooltip);
		}

		if (bHasPressHandlers) {
			oRm.writeAttribute("role", "button");
			oRm.writeAttribute("tabindex", 0);
		}

		// Dimensions
		if (oImage.getWidth() && oImage.getWidth() != '') {
			oRm.addStyle("width", oImage.getWidth());
		}
		if (oImage.getHeight() && oImage.getHeight() != '') {
			oRm.addStyle("height", oImage.getHeight());
		}

		oRm.writeStyles();

		oRm.write(" />"); // close the <img> element

		if (oLightBox) {
			oRm.write("</span>");
		}
	};

	return ImageRenderer;
}, /* bExport= */ true);