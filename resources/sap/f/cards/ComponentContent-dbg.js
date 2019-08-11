/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/f/cards/BaseContent",
	"sap/ui/core/ComponentContainer"
], function (
	BaseContent,
	ComponentContainer
) {
	"use strict";

	/**
	 * Constructor for a new <code>Component</code> Card Content.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that allows a Component to be put inside a card content
	 *
	 * @extends sap.f.cards.BaseContent
	 *
	 * @author SAP SE
	 * @version 1.68.1
	 *
	 * @experimental
	 * @constructor
	 * @private
	 * @alias sap.f.cards.ComponentContent
	 */
	var ComponentContent = BaseContent.extend("sap.f.cards.ComponentContent", {
		renderer: {}
	});

	ComponentContent.prototype.setConfiguration = function (oConfiguration) {
		BaseContent.prototype.setConfiguration.apply(this, arguments);

		if (!oConfiguration) {
			return;
		}

		var oComponent = new ComponentContainer({
			manifest: oConfiguration,
			async: true,
			componentCreated: function () {
				// TODO _updated event is always needed, so that the busy indicator knows when to stop. We should review this for contents which do not have data.
				this.fireEvent("_actionContentReady");
				this.fireEvent("_updated");
			}.bind(this),
			componentFailed: function () {
				this.fireEvent("_actionContentReady");
				this._handleError("Card content failed to create component");
			}.bind(this)
		});

		this.setAggregation("_content", oComponent);
	};

	return ComponentContent;
});
