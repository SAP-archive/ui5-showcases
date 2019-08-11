/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['sap/ui/core/InvisibleText', 'sap/ui/core/Renderer', './InputBaseRenderer', 'sap/m/library'],
	function(InvisibleText, Renderer, InputBaseRenderer, library) {
	"use strict";


	// shortcut for sap.m.InputType
	var InputType = library.InputType;


	/**
	 * Input renderer.
	 * @namespace
	 *
	 * InputRenderer extends the InputBaseRenderer
	 */
	var InputRenderer = Renderer.extend(InputBaseRenderer);

	/**
	 * Adds control specific class
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.addOuterClasses = function(oRm, oControl) {
		oRm.addClass("sapMInput");

		if (oControl.getDescription()) {
			oRm.addClass("sapMInputWithDescription");
		}
	};

	/**
	 * add extra attributes to Input
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.writeInnerAttributes = function(oRm, oControl) {
		oRm.writeAttribute("type", oControl.getType().toLowerCase());
		//if Input is of type "Number" step attribute should be "any" allowing input of floating point numbers
		if (oControl.getType() == InputType.Number) {
			oRm.writeAttribute("step", "any");
		}
		if (oControl.getType() == InputType.Number && sap.ui.getCore().getConfiguration().getRTL()) {
			oRm.writeAttribute("dir", "ltr");
			oRm.addStyle("text-align", "right");
		}

		if (oControl.getShowSuggestion() || oControl.getShowValueStateMessage()) {
			oRm.writeAttribute("autocomplete", "off");
		}

		if ((!oControl.getEnabled() && oControl.getType() == "Password")
				|| (oControl.getShowSuggestion() && oControl._bUseDialog)
				|| (oControl.getValueHelpOnly() && oControl.getEnabled() && oControl.getEditable() && oControl.getShowValueHelp())) {
			// required for JAWS reader on password fields on desktop and in other cases:
			oRm.writeAttribute("readonly", "readonly");
		}
	};

	/**
	 * Adds inner css classes to the input field
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InputRenderer.addInnerClasses = function(oRm, oControl) {};

	InputRenderer.writeDescription = function (oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapMInputDescriptionWrapper");
		oRm.addStyle("width", "calc(100% - " + oControl.getFieldWidth() + ")");
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");

		oRm.write("<span");
		oRm.writeAttribute("id", oControl.getId() + "-descr");
		oRm.addClass("sapMInputDescriptionText");
		oRm.writeClasses();
		oRm.write(">");

		oRm.writeEscaped(oControl.getDescription());

		oRm.write("</span>");
		oRm.write("</div>");
	};

	InputRenderer.writeDecorations = function (oRm, oControl) {
		if (oControl.getDescription()) {
			this.writeDescription(oRm, oControl);
		}

		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			if (oControl.getShowSuggestion() && oControl.getEnabled() && oControl.getEditable()) {
				oRm.write("<span id=\"" +  oControl.getId() + "-SuggDescr\" class=\"sapUiPseudoInvisibleText\" role=\"status\" aria-live=\"polite\"></span>");
			}
		}
	};

	InputRenderer.addWrapperStyles = function (oRm, oControl) {
		oRm.addStyle("width", oControl.getDescription() ? oControl.getFieldWidth() : "100%");
	};

	InputRenderer.getAriaLabelledBy = function(oControl) {
		var ariaLabels = InputBaseRenderer.getAriaLabelledBy.call(this, oControl) || "";

		if (oControl.getDescription()) {
			ariaLabels = ariaLabels + " " + oControl.getId() + "-descr";
		}
		return ariaLabels;
	};

	InputRenderer.getAriaDescribedBy = function(oControl) {

		var sAriaDescribedBy = InputBaseRenderer.getAriaDescribedBy.apply(this, arguments);

		function append( s ) {
			sAriaDescribedBy = sAriaDescribedBy ? sAriaDescribedBy + " " + s : s;
		}

		if (oControl.getShowValueHelp() && oControl.getEnabled() && oControl.getEditable()) {
			append( InvisibleText.getStaticId("sap.m", "INPUT_VALUEHELP") );
			if (oControl.getValueHelpOnly()) {
				append( InvisibleText.getStaticId("sap.m", "INPUT_DISABLED") );
			}
		}

		if (oControl.getShowSuggestion() && oControl.getEnabled() && oControl.getEditable()) {
			append( oControl.getId() + "-SuggDescr" );
		}

		return sAriaDescribedBy;

	};

	/**
	 * Returns aria accessibility role for the control.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control
	 * @returns {String}
	 */
	InputRenderer.getAriaRole = function(oControl) {
		return "";
	};

	InputRenderer.getAccessibilityState = function(oControl) {

		var mAccessibilityState = InputBaseRenderer.getAccessibilityState.apply(this, arguments);

		if (oControl.getShowSuggestion() && oControl.getEnabled() && oControl.getEditable()) {
			mAccessibilityState.autocomplete = "list";
		}

		return mAccessibilityState;

	};

	return InputRenderer;

}, /* bExport= */ true);
