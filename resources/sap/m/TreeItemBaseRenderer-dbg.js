/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['./ListItemBaseRenderer', 'sap/ui/core/Renderer'],
	function(ListItemBaseRenderer, Renderer) {
	"use strict";

	/**
	 * TreeItemBaseRenderer renderer.
	 * @namespace
	 */
	var TreeItemBaseRenderer = Renderer.extend(ListItemBaseRenderer);

	TreeItemBaseRenderer.renderLIAttributes = function(rm, oLI) {
		rm.addClass("sapMTreeItemBase");

		if (!oLI.isTopLevel()) {
			rm.addClass("sapMTreeItemBaseChildren");
		}
		if (oLI.isLeaf()) {
			rm.addClass("sapMTreeItemBaseLeaf");
		} else {
			rm.writeAttribute("aria-expanded", oLI.getExpanded());
		}

		var iIndentation = oLI._getPadding();
		if (sap.ui.getCore().getConfiguration().getRTL()){
			rm.addStyle("padding-right", iIndentation + "rem");
		} else {
			rm.addStyle("padding-left", iIndentation + "rem");
		}

	};

	TreeItemBaseRenderer.renderContentFormer = function(rm, oLI) {
		this.renderHighlight(rm, oLI);
		this.renderExpander(rm, oLI);
		this.renderMode(rm, oLI, -1);
	};

	TreeItemBaseRenderer.renderExpander = function(rm, oLI) {
		var oExpander = oLI._getExpanderControl();
		if (oExpander) {
			rm.renderControl(oExpander);
		}
	};

	/**
	 * Returns the ARIA accessibility role.
	 *
	 * @param {sap.ui.core.Control} oLI An object representation of the control
	 * @returns {String}
	 * @protected
	 */
	TreeItemBaseRenderer.getAriaRole = function(oLI) {
		return "treeitem";
	};

	TreeItemBaseRenderer.getAccessibilityState = function(oLI) {
		var mAccessibilityState = ListItemBaseRenderer.getAccessibilityState.call(this, oLI);

		mAccessibilityState.level = oLI.getLevel() + 1;
		if (!oLI.isLeaf()) {
			mAccessibilityState.expanded = oLI.getExpanded();
		}

		return mAccessibilityState;
	};

	return TreeItemBaseRenderer;

}, /* bExport= */ true);
