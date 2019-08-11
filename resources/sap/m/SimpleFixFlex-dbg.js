/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/ResizeHandler',
	'./SimpleFixFlexRenderer'
],
function (Control, ResizeHandler /**, SimpleFixFlexRenderer */) {
	"use strict";
	/**
	 * Constructor for a new <code>sap.m.SimpleFixFlex</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.SimpleFixFlex</code> builds the container for a layout with a fixed and a flexible part.
	 * The flexible container adapts its size to the fix container.
	 * <h3>Structure</h3>
	 * The control consists of two different parts:
	 * <ul>
	 * <li>Fix content - A container that is used to render a control.</li>
	 * <li>Flex content - A container that stretches to fill the empty space in the parent container.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.68.1
	 *
	 * @constructor
	 * @private
	 * @since 1.65
	 * @alias sap.m.SimpleFixFlex
	 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
	 */
	var SimpleFixFlex = Control.extend("sap.m.SimpleFixFlex", /** @lends sap.m.SimpleFixFlex */ {

		metadata: {
			library: "sap.m",
			aggregations: {
				/**
				* Control in the fixed part of the layout.
				*/
				fixContent: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				/**
				* Control in the flex part of the layout.
				*/
				flexContent: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			properties: {
				/**
				* Determines if the content of the <code>sap.m.SimpleFixFlex</code> should strech
				* the parent container or wrap in order to fit.
				*/
				fitParent: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				}
			}
		}
	});

	SimpleFixFlex.prototype.onBeforeRendering = function () {
		this._deregisterFixContentResizeHandler();
	};

	SimpleFixFlex.prototype.onAfterRendering = function () {
		if (this.getFitParent()) {
			this._registerFixContentResizeHandler();
		}
	};

	SimpleFixFlex.prototype._registerFixContentResizeHandler = function() {
		var oFixContent = this.getFixContent();
		if (!this._sResizeListenerId && oFixContent) {
			this._sResizeListenerId = ResizeHandler.register(oFixContent.getDomRef(), this._onFixContentResize.bind(this));
			this._onFixContentResize();
		}
	};

	SimpleFixFlex.prototype._deregisterFixContentResizeHandler = function () {
		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
	};

	SimpleFixFlex.prototype._onFixContentResize = function () {
		var	$simpleFixFlex = this.$(),
			$fixContent = this.getFixContent().$();

			//using clientHeight as jQuery's innerHeight() method returns the height
			//even if the fix content has style of "display: none;"
			$simpleFixFlex.css("padding-top", $fixContent.get(0).clientHeight);
			$fixContent.addClass("sapUiSimpleFixFlexFixedWrap");
	};

	SimpleFixFlex.prototype.exit = function() {
		this._deregisterFixContentResizeHandler();
	};

	return SimpleFixFlex;
});