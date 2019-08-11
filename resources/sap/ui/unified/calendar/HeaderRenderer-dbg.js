/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(["sap/base/security/encodeXML"],
	function(encodeXML) {
	"use strict";


	var MAX_HEADER_BUTTONS = 5;

	/**
	 * Header renderer.
	 * @namespace
	 */
	var HeaderRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.Header} oHead an object representation of the control that should be rendered
	 */
	HeaderRenderer.render = function(oRm, oHead){
		var sLanguage = sap.ui.getCore().getConfiguration().getLocale().getLanguage();
		var sTooltip = oHead.getTooltip_AsString();
		var sId = oHead.getId();
		var mAccProps = {};
		var sLabelNext = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified").getText("CALENDAR_BTN_NEXT");
		var sLabelPrev = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified").getText("CALENDAR_BTN_PREV");

		oRm.write("<div");
		oRm.writeControlData(oHead);
		oRm.addClass("sapUiCalHead");
		oRm.writeClasses();

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}

		oRm.writeAccessibilityState(oHead);

		oRm.write(">"); // div element

		oRm.write("<button");
		oRm.writeAttributeEscaped('id', sId + '-prev');
		oRm.writeAttributeEscaped("title", sLabelPrev);
		oRm.writeAccessibilityState(null, { label: sLabelPrev});

		oRm.addClass("sapUiCalHeadPrev");
		if (!oHead.getEnabledPrevious()) {
			oRm.addClass("sapUiCalDsbl");
			oRm.writeAttribute('disabled', "disabled");
		}
		oRm.writeAttribute('tabindex', "-1");
		oRm.writeClasses();
		oRm.write(">"); // button element
		oRm.writeIcon("sap-icon://slim-arrow-left", null, { title: null });
		oRm.write("</button>");

		var iFirst = -1;
		var iLast = -1;
		var i = 0;
		var iBtn;
		for (i = 0; i < MAX_HEADER_BUTTONS; i++) {
			if (this.getVisibleButton(oHead, i)) {
				if (iFirst < 0) {
					iFirst = i;
				}
				iLast = i;
			}
		}

		for (i = 0; i < MAX_HEADER_BUTTONS; i++) {
			// for Chinese and Japanese the date should be displayed in year, month, day order
			if (sLanguage.toLowerCase() === "ja" || sLanguage.toLowerCase() === "zh") {
				iBtn = MAX_HEADER_BUTTONS - 1 - i;
				// when we have two months displayed next to each other, we have 4 buttons
				// and they should be arranged in order to show year, first month, year, second month
				// this is why the numbers of the buttons are hard-coded
				if (this._isTwoMonthsCalendar(oHead)) {
					switch (i) {
						case 0:
							iBtn = 2;
							break;
						case 2:
							iBtn = 4;
							break;
						case 1:
							iBtn = 1;
							break;
						case 3:
							iBtn = 3;
							break;
					}
				}
			} else {
				iBtn = i;
			}
			if (this._isTwoMonthsCalendar(oHead)) {
				iFirst = 2;
				iLast = 3;
			}
			this.renderCalendarButtons(oRm, oHead, sId, iFirst, iLast, mAccProps, iBtn);
		}

		oRm.write("<button");
		oRm.writeAttributeEscaped('id', sId + '-next');
		oRm.writeAttributeEscaped("title", sLabelNext);
		oRm.writeAccessibilityState(null, { label: sLabelNext});

		oRm.addClass("sapUiCalHeadNext");
		if (!oHead.getEnabledNext()) {
			oRm.addClass("sapUiCalDsbl");
			oRm.writeAttribute('disabled', "disabled");
		}
		oRm.writeAttribute('tabindex', "-1");
		oRm.writeClasses();
		oRm.write(">"); // button element
		oRm.writeIcon("sap-icon://slim-arrow-right", null, { title: null });
		oRm.write("</button>");

		oRm.write("</div>");

	};

	HeaderRenderer.renderCalendarButtons = function (oRm, oHead, sId, iFirst, iLast, mAccProps, i) {
		if (this.getVisibleButton(oHead, i)) {
			oRm.write("<button");
			oRm.writeAttributeEscaped('id', sId + '-B' + i);
			oRm.addClass("sapUiCalHeadB");
			oRm.addClass("sapUiCalHeadB" + i);
			if (iFirst == i) {
				oRm.addClass("sapUiCalHeadBFirst");
			}
			if (iLast == i) {
				oRm.addClass("sapUiCalHeadBLast");
			}
			oRm.writeAttribute('tabindex', "-1");
			oRm.writeClasses();
			if (this.getAriaLabelButton(oHead, i)) {
				mAccProps["label"] = this.getAriaLabelButton(oHead, i);
			}
			oRm.writeAccessibilityState(null, mAccProps);
			mAccProps = {};
			oRm.write(">"); // button element
			var sText = this.getTextButton(oHead, i) || "";
			var sAddText = this.getAdditionalTextButton(oHead, i) || "";
			if (sAddText) {
				oRm.write("<span");
				oRm.writeAttributeEscaped('id', sId + '-B' + i + "-Text");
				oRm.addClass("sapUiCalHeadBText");
				oRm.writeClasses();
				oRm.write(">"); // span element
				oRm.writeEscaped(sText);
				oRm.write("</span>");

				oRm.write("<span");
				oRm.writeAttributeEscaped('id', sId + '-B' + i + "-AddText");
				oRm.addClass("sapUiCalHeadBAddText");
				oRm.writeClasses();
				oRm.write(">"); // span element
				oRm.writeEscaped(sAddText);
				oRm.write("</span>");
			} else {
				oRm.writeEscaped(sText);
			}
			oRm.write("</button>");
		}
	};

	HeaderRenderer.getVisibleButton = function (oHead, iButton) {
		var bVisible = false;

		if (oHead["getVisibleButton" + iButton]) {
			bVisible = oHead["getVisibleButton" + iButton]();
		} else if (oHead["_getVisibleButton" + iButton]) {
			bVisible = oHead["_getVisibleButton" + iButton]();
		}

		return bVisible;
	};

	HeaderRenderer.getAriaLabelButton = function (oHead, iButton) {
		var sAriaLabel;

		if (oHead["getAriaLabelButton" + iButton]) {
			sAriaLabel = oHead["getAriaLabelButton" + iButton]();
		} else if (oHead["_getAriaLabelButton" + iButton]) {
			sAriaLabel = oHead["_getAriaLabelButton" + iButton]();
		}

		return sAriaLabel;
	};

	HeaderRenderer.getTextButton = function (oHead, iButton) {
		var sText;

		if (oHead["getTextButton" + iButton]) {
			sText = oHead["getTextButton" + iButton]();
		} else if (oHead["_getTextButton" + iButton]) {
			sText = oHead["_getTextButton" + iButton]();
		}

		return sText;
	};

	HeaderRenderer.getAdditionalTextButton = function (oHead, iButton) {
		var sText;

		if (oHead["getAdditionalTextButton" + iButton]) {
			sText = oHead["getAdditionalTextButton" + iButton]();
		} else if (oHead["_getAdditionalTextButton" + iButton]) {
			sText = oHead["_getAdditionalTextButton" + iButton]();
		}

		return sText;
	};

	HeaderRenderer._isTwoMonthsCalendar = function (oHead) {
		return (oHead.getParent() instanceof sap.ui.unified.Calendar && (oHead.getParent().getMonths() >= 2));
	};

	return HeaderRenderer;

}, /* bExport= */ true);