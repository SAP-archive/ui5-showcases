/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/core/IconPool', 'sap/m/library', 'sap/ui/Device', 'sap/ui/core/InvisibleText', 'sap/ui/core/library'],
	function(Renderer, IconPool, library, Device, InvisibleText, coreLibrary) {
		"use strict";

		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		// shortcut for sap.ui.core.ValueState
		var ValueState = coreLibrary.ValueState;

		// shortcut for sap.m.SelectType
		var SelectType = library.SelectType;

		/**
		 * Select renderer.
		 * @namespace
		 */
		var SelectRenderer = {};

		/**
		 * CSS class to be applied to the HTML root element of the Select control.
		 *
		 * @type {string}
		 */
		SelectRenderer.CSS_CLASS = "sapMSlt";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
		 */
		SelectRenderer.render = function(oRm, oSelect) {
			var	sTooltip = oSelect.getTooltip_AsString(),
				sType = oSelect.getType(),
				bAutoAdjustWidth = oSelect.getAutoAdjustWidth(),
				bEditable = oSelect.getEditable(),
				bEnabled = oSelect.getEnabled(),
				sCSSWidth = oSelect.getWidth(),
				bWidthPercentage = sCSSWidth.indexOf("%") > -1,
				bSelectWithFlexibleWidth = bAutoAdjustWidth || sCSSWidth === "auto" || bWidthPercentage,
				CSS_CLASS = SelectRenderer.CSS_CLASS;

			oRm.write("<div");
			this.addClass(oRm, oSelect);
			oRm.addClass(CSS_CLASS);
			oRm.addClass(CSS_CLASS + oSelect.getType());

			if (!bEnabled) {
				oRm.addClass(CSS_CLASS + "Disabled");
			} else if (!bEditable) {
				oRm.addClass(CSS_CLASS + "Readonly");
			}

			if (bSelectWithFlexibleWidth && (sType === SelectType.Default)) {
				oRm.addClass(CSS_CLASS + "MinWidth");
			}

			if (bAutoAdjustWidth) {
				oRm.addClass(CSS_CLASS + "AutoAdjustedWidth");
			} else {
				oRm.addStyle("width", sCSSWidth);
			}

			if (oSelect.getIcon()) {
				oRm.addClass(CSS_CLASS + "WithIcon");
			}

			if (bEnabled && bEditable && Device.system.desktop) {
				oRm.addClass(CSS_CLASS + "Hoverable");
			}

			oRm.addClass(CSS_CLASS + "WithArrow");

			if (oSelect.getValueState() !== ValueState.None) {
				this.addValueStateClasses(oRm, oSelect);
			}

			oRm.addStyle("max-width", oSelect.getMaxWidth());
			oRm.writeControlData(oSelect);
			oRm.writeStyles();
			oRm.writeClasses();
			this.writeAccessibilityState(oRm, oSelect);

			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			} else if (sType === SelectType.IconOnly) {
				var oIconInfo = IconPool.getIconInfo(oSelect.getIcon());

				if (oIconInfo) {
					oRm.writeAttributeEscaped("title", oIconInfo.text);
				}
			}

			if (bEnabled) {
				oRm.writeAttribute("tabindex", "0");
			}

			oRm.write(">");
			this.renderHiddenInput(oRm, oSelect);
			this.renderLabel(oRm, oSelect);

			switch (sType) {
				case SelectType.Default:
					this.renderArrow(oRm, oSelect);
					break;

				case SelectType.IconOnly:
					this.renderIcon(oRm, oSelect);
					break;

				// no default
			}

			var oList = oSelect.getList();

			if (oSelect._isShadowListRequired() && oList) {
				this.renderShadowList(oRm, oList);
			}

			if (oSelect.getName()) {
				this.renderInput(oRm, oSelect);
			}

			oRm.write("</div>");
		};

		SelectRenderer.renderHiddenInput = function (oRm, oSelect) {
			oRm.write("<input");

			// Attributes
			oRm.writeAttribute("id", oSelect.getId() + "-hiddenInput");
			oRm.writeAttribute("aria-readonly", "true");
			oRm.writeAttribute("tabindex", "-1");

			// Classes
			oRm.addClass("sapUiPseudoInvisibleText");
			oRm.writeClasses();

			oRm.write(" />");
		};

		/**
		 * Renders the select's label, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
		 * @private
		 */
		SelectRenderer.renderLabel = function(oRm, oSelect) {
			var oSelectedItem = oSelect.getSelectedItem(),
				sTextDir = oSelect.getTextDirection(),
				sTextAlign = Renderer.getTextAlign(oSelect.getTextAlign(), sTextDir),
				CSS_CLASS = SelectRenderer.CSS_CLASS;

			oRm.write("<label");
			oRm.writeAttribute("id", oSelect.getId() + "-label");
			oRm.writeAttribute("for", oSelect.getId());
			oRm.writeAttribute("aria-live", "polite");
			oRm.addClass(CSS_CLASS + "Label");

			if (oSelect.getValueState() !== ValueState.None) {
				oRm.addClass(CSS_CLASS + "LabelState");
				oRm.addClass(CSS_CLASS + "Label" + oSelect.getValueState());
			}

			if (oSelect.getType() === SelectType.IconOnly) {
				oRm.addClass("sapUiPseudoInvisibleText");
			}

			if (sTextDir !== TextDirection.Inherit) {
				oRm.writeAttribute("dir", sTextDir.toLowerCase());
			}

			if (sTextAlign) {
				oRm.addStyle("text-align", sTextAlign);
			}

			oRm.writeStyles();
			oRm.writeClasses();
			oRm.write(">");

			// write the text of the selected item only if it has not been removed or destroyed
			// and when the Select isn't in IconOnly mode - BCP 1780431688

			if (oSelect.getType() !== SelectType.IconOnly) {
				oRm.renderControl(oSelect._getValueIcon());
				oRm.write("<span");
				oRm.addClass("sapMSelectListItemText");
				oRm.writeAttribute("id", oSelect.getId() + "-labelText");
				oRm.writeClasses();
				oRm.write(">");

				oSelectedItem && oSelectedItem.getParent() ? oRm.writeEscaped(oSelectedItem.getText()) : "";

				oRm.write("</span>");
			}
			oRm.write("</label>");
		};

		/**
		 * Renders the select's arrow, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.Select} oSelect An object representation of the control that should be rendered.
		 * @private
		 */
		SelectRenderer.renderArrow = function(oRm, oSelect) {
			var CSS_CLASS = SelectRenderer.CSS_CLASS;

			oRm.write("<span");
			oRm.addClass(CSS_CLASS + "Arrow");

			if (oSelect.getValueState() !== ValueState.None) {
				oRm.addClass(CSS_CLASS + "ArrowState");
			}

			oRm.writeAttribute("id", oSelect.getId() + "-arrow");
			oRm.writeClasses();
			oRm.write("></span>");
		};

		/**
		 * Renders the select's icon, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {string} oSelect An object representation of the control that should be rendered.
		 * @private
		 */
		SelectRenderer.renderIcon = function(oRm, oSelect) {
			oRm.writeIcon(oSelect.getIcon(), SelectRenderer.CSS_CLASS + "Icon", {
				id: oSelect.getId() + "-icon",
				title: null
			});
		};

		SelectRenderer.renderInput = function(oRm, oSelect) {
			oRm.write("<input hidden");
			oRm.writeAttribute("id", oSelect.getId() + "-input");
			oRm.addClass(SelectRenderer.CSS_CLASS + "Input");
			oRm.writeAttribute("aria-hidden", "true");
			oRm.writeAttribute("tabindex", "-1");

			if (!oSelect.getEnabled()) {
				oRm.write("disabled");
			}

			oRm.writeClasses();
			oRm.writeAttributeEscaped("name", oSelect.getName());
			oRm.writeAttributeEscaped("value", oSelect.getSelectedKey());
			oRm.write("/>");
		};

		/**
		 * Renders a shadow list control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.SelectList} oList An object representation of the list that should be rendered.
		 * @private
		 */
		SelectRenderer.renderShadowList = function(oRm, oList) {
			var oListRenderer = oList.getRenderer();
			oListRenderer.writeOpenListTag(oRm, oList, { elementData: false });
			this.renderShadowItems(oRm, oList);
			oListRenderer.writeCloseListTag(oRm, oList);
		};

		/**
		 * Renders shadow items for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.Select} oList An object representation of the select that should be rendered.
		 * @private
		 */
		SelectRenderer.renderShadowItems = function(oRm, oList) {
			var oListRenderer = oList.getRenderer(),
				iSize = oList.getItems().length,
				oSelectedItem = oList.getSelectedItem();

			for (var i = 0, aItems = oList.getItems(); i < aItems.length; i++) {
				oListRenderer.renderItem(oRm, oList, aItems[i], {
					selected: oSelectedItem === aItems[i],
					setsize: iSize,
					posinset: i + 1,
					elementData: false // avoid duplicated IDs in the DOM when the select control is rendered inside a dialog
				});
			}
		};

		/**
		 * This method is reserved for derived class to add extra classes to the HTML root element of the control.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSelect An object representation of the control that should be rendered.
		 * @protected
		 */
		SelectRenderer.addClass = function(oRm, oSelect) {};

		/**
		 * Add the CSS value state classes to the control's root element using the provided {@link sap.ui.core.RenderManager}.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSelect An object representation of the control that should be rendered.
		 */
		SelectRenderer.addValueStateClasses = function(oRm, oSelect) {
			oRm.addClass(SelectRenderer.CSS_CLASS + "State");
			oRm.addClass(SelectRenderer.CSS_CLASS + oSelect.getValueState());
		};

		/**
		 * Gets accessibility role.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.Control} oSelect An object representation of the control that should be rendered.
		 * @protected
		 */
		SelectRenderer.getAriaRole = function(oSelect) {
			switch (oSelect.getType()) {
				case SelectType.Default:
					return "combobox";

				case SelectType.IconOnly:
					return "button";

				// no default
			}
		};

		/**
		 * Returns the id of the InvisibleText containing information about the value state of the Select
		 * @param oSelect
		 * @returns {string}
		 * @private
		 */
		SelectRenderer._getValueStateString = function(oSelect) {
			var sCoreLib = "sap.ui.core";

			switch (oSelect.getValueState()) {
				case ValueState.Success:
					return InvisibleText.getStaticId(sCoreLib, "VALUE_STATE_SUCCESS");
				case ValueState.Warning:
					return InvisibleText.getStaticId(sCoreLib, "VALUE_STATE_WARNING");
				case ValueState.Information:
					return InvisibleText.getStaticId(sCoreLib, "VALUE_STATE_INFORMATION");
			}

			return "";
		};

		/**
		 * Writes the accessibility state.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSelect An object representation of the control that should be rendered.
		 */
		SelectRenderer.writeAccessibilityState = function(oRm, oSelect) {
			var sValueState = this._getValueStateString(oSelect),
				oSelectedItem = oSelect.getSelectedItem(),
				bIconOnly = oSelect.getType() === SelectType.IconOnly,
				oAriaLabelledBy,
				sDesc;

			if (sValueState) {
				sValueState = " " + sValueState;
			}

			if (oSelectedItem && !oSelectedItem.getText() && oSelectedItem.getIcon && oSelectedItem.getIcon()) {
				var oIconInfo = IconPool.getIconInfo(oSelectedItem.getIcon());
				if (oIconInfo) {
					sDesc = oIconInfo.text || oIconInfo.name;
				}
			}

			oAriaLabelledBy = {
				value: sDesc ? oSelect._getValueIcon().getId() : oSelect.getId() + "-label" + sValueState,
				append: true
			};

			oRm.writeAccessibilityState(oSelect, {
				role: this.getAriaRole(oSelect),
				disabled: !oSelect.getEnabled(),
				readonly: bIconOnly ? undefined : oSelect.getEnabled() && !oSelect.getEditable(),
				expanded: oSelect.isOpen(),
				invalid: (oSelect.getValueState() === ValueState.Error) ? true : undefined,
				labelledby: bIconOnly ? undefined : oAriaLabelledBy,
				haspopup: bIconOnly ? true : undefined
			});
		};

		return SelectRenderer;
	}, /* bExport= */ true);