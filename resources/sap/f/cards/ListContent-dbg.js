/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/f/cards/BaseContent", "sap/m/List", "sap/m/StandardListItem", "sap/ui/base/ManagedObject", "sap/f/cards/ActionEnablement"],
	function (BaseContent, sapMList, StandardListItem, ManagedObject, ActionEnablement) {
		"use strict";

		/**
		 * Constructor for a new <code>ListContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A control that is a wrapper of a <code>sap.m.List</code> and allows its creation based on a configuration.
		 *
		 * @extends sap.f.cards.BaseContent
		 *
		 * @author SAP SE
		 * @version 1.68.1
		 *
		 * @constructor
		 * @private
		 * @since 1.62
		 * @alias sap.f.cards.ListContent
		 */
		var ListContent = BaseContent.extend("sap.f.cards.ListContent", {
			renderer: {}
		});

		/**
		 * Lazily get a configured <code>sap.m.List</code>.
		 *
		 * @private
		 * @returns {sap.m.List} The inner list
		 */
		ListContent.prototype._getList = function () {

			if (this._bIsBeingDestroyed) {
				return null;
			}

			var oList = this.getAggregation("_content");

			if (!oList) {
				oList = new sapMList({
					id: this.getId() + "-list",
					growing: false,
					showNoData: false,
					showSeparators: "None"
				});
				this.setAggregation("_content", oList);
			}

			return oList;
		};

		/**
		 * Called when control is initialized.
		 */
		ListContent.prototype.init = function () {
			BaseContent.prototype.init.apply(this, arguments);

			var oList = this._getList();
			var that = this;

			oList.attachUpdateFinished(function () {
				if (that._iVisibleItems) {
					var aItems = oList.getItems();
					for (var i = that._iVisibleItems + 1; i < aItems.length; i++) {
						aItems[i].setVisible(false);
					}
				}
			});

			this._oItemTemplate = new StandardListItem({
				iconDensityAware: false
			});
		};

		/**
		 * Called when control is destroyed.
		 */
		ListContent.prototype.exit = function () {
			BaseContent.prototype.exit.apply(this, arguments);

			if (this._oItemTemplate) {
				this._oItemTemplate.destroy();
				this._oItemTemplate = null;
			}
		};

		/**
		 * Setter for configuring a <code>sap.f.cards.ListContent</code>.
		 *
		 * @public
		 * @param {Object} oConfiguration Configuration object used to create the internal list.
		 * @returns {sap.f.cards.ListContent} Pointer to the control instance to allow method chaining.
		 */
		ListContent.prototype.setConfiguration = function (oConfiguration) {
			BaseContent.prototype.setConfiguration.apply(this, arguments);

			if (!oConfiguration) {
				return this;
			}

			if (oConfiguration.items) {
				this._setStaticItems(oConfiguration.items);
				return this;
			}

			if (oConfiguration.item) {
				this._setItem(oConfiguration.item);
			}

			return this;
		};

		/**
		 * Binds/Sets properties to the inner item template based on the configuration object item template.
		 * Attaches all required actions.
		 *
		 * @private
		 * @param {Object} mItem The item template of the configuration object
		 */
		ListContent.prototype._setItem = function (mItem) {
			/* eslint-disable no-unused-expressions */
			mItem.title && this._bindObjectItemProperty("title", mItem.title);
			mItem.description && this._bindObjectItemProperty("description", mItem.description);
			mItem.icon && mItem.icon.src && this._bindItemProperty("icon", mItem.icon.src);
			mItem.highlight && this._bindItemProperty("highlight", mItem.highlight);
			mItem.info && this._bindItemProperty("info", mItem.info.value);
			mItem.info && this._bindItemProperty("infoState", mItem.info.state);
			/* eslint-enable no-unused-expressions */

			this._attachActions(mItem, this._oItemTemplate);

			var oBindingInfo = {
				template: this._oItemTemplate
			};
			this._bindAggregation("items", this._getList(), oBindingInfo);
		};

		/**
		 * Create static StandardListItems which will be mapped with the configuration that is passed.
		 *
		 * @private
		 * @param {Array} mItems The list of static items that will be used
		 */
		ListContent.prototype._setStaticItems = function (mItems) {
			var oList = this._getList();
			mItems.forEach(function (oItem) {
				var oListItem = new StandardListItem({
					iconDensityAware: false,
					title: oItem.title ? oItem.title : "",
					description: oItem.description ? oItem.description : "",
					icon: oItem.icon ? oItem.icon : "",
					infoState: oItem.infoState ? oItem.infoState : "None",
					info: oItem.info ? oItem.info : "",
					highlight: oItem.highlight ? oItem.highlight : "None"
				});

				// Here can be called _attachNavigationAction so that navigation service can be used
				if (oItem.action) {
					oListItem.setType("Navigation");

					if (oItem.action.url) {
						oListItem.attachPress(function () {
							window.open(oItem.action.url, oItem.target || "_blank");
						});
					}
				}
				oList.addItem(oListItem);
			});

			//workaround until actions refactor
			this.fireEvent("_actionContentReady");
		};

		/**
		 * Directly bind the property when the value is of type string.
		 * If the value is an object call bind property for both the value and the label properties.
		 *
		 * This allow the usage of both:
		 *
		 * "title": "Some item title"
		 *
		 * and
		 *
		 * "title": {
		 * 		"label": "Some label for the title"
		 * 		"value": "Some item title"
		 * }
		 *
		 * @private
		 * @param {string} sPropertyName The name of the property
		 * @param {string|Object} vPropertyValue The value of the property
		 */
		ListContent.prototype._bindObjectItemProperty = function (sPropertyName, vPropertyValue) {
			if (typeof vPropertyValue === "string") {
				this._bindItemProperty(sPropertyName, vPropertyValue);
			} else {
				this._bindItemProperty(sPropertyName, vPropertyValue.value);
			}
		};

		/**
		 * Tries to create a binding info object based on sPropertyValue.
		 * If succeeds the binding info will be used for property binding.
		 * Else sPropertyValue will be set directly on the item template.
		 *
		 * @private
		 * @param {string} sPropertyName The name of the property
		 * @param {string} sPropertyValue The value of the property
		 */
		ListContent.prototype._bindItemProperty = function (sPropertyName, sPropertyValue) {
			if (!sPropertyValue) {
				return;
			}

			var oBindingInfo = ManagedObject.bindingParser(sPropertyValue);
			if (oBindingInfo) {
				this._oItemTemplate.bindProperty(sPropertyName, oBindingInfo);
			} else {
				this._oItemTemplate.setProperty(sPropertyName, sPropertyValue);
			}
		};

		/**
		 * @overwrite
		 * @returns {sap.m.List} The inner list.
		 */
		ListContent.prototype.getInnerList = function () {
			return this._getList();
		};

		ActionEnablement.enrich(ListContent);

		return ListContent;
	}
);
