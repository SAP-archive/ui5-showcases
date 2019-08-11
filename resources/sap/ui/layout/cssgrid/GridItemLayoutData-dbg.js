/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/core/LayoutData",
	"sap/ui/layout/library"
], function(LayoutData) {
	"use strict";

	var mGridItemProperties = {
		gridColumnStart: "grid-column-start",
		gridColumnEnd: "grid-column-end",
		gridRowStart: "grid-row-start",
		gridRowEnd: "grid-row-end",
		gridColumn: "grid-column",
		gridRow: "grid-row"
	};

	/**
	 * Constructor for a new <code>sap.ui.layout.cssgrid.GridItemLayoutData</code>.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element.
	 *
	 * @class
	 * Holds layout data for a grid item.
	 *
	 * @extends sap.ui.core.LayoutData
	 * @version 1.68.1
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.layout.cssgrid.GridItemLayoutData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GridItemLayoutData = LayoutData.extend("sap.ui.layout.cssgrid.GridItemLayoutData", { metadata: {
		library: "sap.ui.layout",
		properties: {

			/**
			 * Sets the value for the CSS display:grid item property grid-column-start
			 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start MDN web docs: grid-column-start}
			 */
			gridColumnStart: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-column-end
			 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end MDN web docs: grid-column-end}
			 */
			gridColumnEnd: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-row-start
			 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start MDN web docs: grid-row-start}
			 */
			gridRowStart: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-row-end
			 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end MDN web docs: grid-row-end}
			 */
			gridRowEnd: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-column
			 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column MDN web docs: grid-column}
			 */
			gridColumn: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-row
			 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row MDN web docs: grid-row}
			 */
			gridRow: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: ""}
		}
	}});

	/**
	 * Updates the display:grid styles of a single item
	 *
	 * @private
	 * @static
	 * @param {sap.ui.core.Control} oItem The item which styles have to be updated
	 */
	GridItemLayoutData._setItemStyles = function (oItem) {

		if (!oItem) {
			return;
		}

		var oLayoutData = GridItemLayoutData._getLayoutDataForControl(oItem),
			oElement = GridItemLayoutData._getElement(oItem),
			oProperties,
			sProp,
			sPropValue;

		if (!oElement) {
			return;
		}

		if (!oLayoutData) {
			GridItemLayoutData._removeItemStyles(oElement);
			return;
		}

		oProperties = oLayoutData.getMetadata().getProperties();

		for (sProp in mGridItemProperties) {
			if (oProperties[sProp]) {
				sPropValue = oLayoutData.getProperty(sProp);

				if (typeof sPropValue !== "undefined") {
					GridItemLayoutData._setItemStyle(oElement, mGridItemProperties[sProp], sPropValue);
				}
			}
		}
	};

	/**
	 * Return the DOM ref of the item or the item's wrapper
	 *
	 * @param {sap.ui.core.Control} oItem The item
	 */
	GridItemLayoutData._getElement = function (oItem) {
		var oItemDom = oItem.getDomRef();

		if (!oItemDom) {
			return undefined;
		}

		var oWrapper = oItemDom.parentNode;

		if (oWrapper && oWrapper.classList.contains("sapUiLayoutCSSGridItemWrapper")) {
			return oWrapper;
		}
		return oItemDom;
	};

	/**
	 * Remove all grid properties from the item
	 *
	 * @private
	 * @static
	 * @param {HTMLElement} oItemDom The Item DOM reference
	 */
	GridItemLayoutData._removeItemStyles = function (oItemDom) {
		for (var sProp in mGridItemProperties) {
			oItemDom.style.removeProperty(mGridItemProperties[sProp]);
		}
	};

	/**
	 * Sets a property on the DOM element
	 *
	 * @private
	 * @static
	 * @param {HTMLElement} oItemDom The item DOM reference
	 * @param {string} sProperty The name of the property to set
	 * @param {string} sValue The value of the property to set
	 */
	GridItemLayoutData._setItemStyle = function (oItemDom, sProperty, sValue) {
		if (sValue !== "0" && !sValue) {
			oItemDom.style.removeProperty(sProperty);
		} else {
			oItemDom.style.setProperty(sProperty, sValue);
		}
	};

	/**
	 * @private
	 * @static
	 * @param {sap.ui.core.Control} oControl The control to get the layoutData from
	 * @returns {sap.ui.layout.cssgrid.GridItemLayoutData|undefined} The layoutData used by the grid item
	 */
	GridItemLayoutData._getLayoutDataForControl = function (oControl) {
		var oLayoutData,
			aLayoutData,
			oInnerLayoutData;

		if (!oControl) {
			return undefined;
		}

		oLayoutData = oControl.getLayoutData();

		if (!oLayoutData) {
			return undefined;
		}

		if (oLayoutData.isA("sap.ui.layout.cssgrid.GridItemLayoutData")) {
			return oLayoutData;
		}

		if (oLayoutData.isA("sap.ui.core.VariantLayoutData")) {
			aLayoutData = oLayoutData.getMultipleLayoutData();
			for (var i = 0; i < aLayoutData.length; i++) {
				oInnerLayoutData = aLayoutData[i];
				if (oInnerLayoutData.isA("sap.ui.layout.cssgrid.GridItemLayoutData")) {
					return oInnerLayoutData;
				}
			}
		}
	};

	return GridItemLayoutData;
});