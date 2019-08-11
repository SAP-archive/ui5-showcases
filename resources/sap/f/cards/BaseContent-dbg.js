/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Core"
], function (Control, JSONModel, Log, ManagedObjectObserver, Core) {
	"use strict";

	/**
	 * Constructor for a new <code>BaseContent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A base control for all card contents.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.68.1
	 *
	 * @constructor
	 * @private
	 * @since 1.63
	 * @alias sap.f.cards.BaseContent
	 */
	var BaseContent = Control.extend("sap.f.cards.BaseContent", {
		metadata: {
			aggregations: {

				/**
				 * Defines the content of the control.
				 */
				_content: {
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {

				/**
				 * Fires when the user presses the control.
				 */
				press: {}
			}
		},
		renderer: function (oRm, oCardContent) {

			// Add class the simple way. Add renderer hooks only if needed.
			var sClass = "sapFCard";
			var sLibrary = oCardContent.getMetadata().getLibraryName();
			var sName = oCardContent.getMetadata().getName();
			var sType = sName.slice(sLibrary.length + 1, sName.length);
			var sHeight = BaseContent.getMinHeight(sType, oCardContent.getConfiguration());
			var oCard = oCardContent.getParent();
			sClass += sType;

			oRm.write("<div");
			oRm.writeElementData(oCardContent);
			oRm.addClass(sClass);
			oRm.addClass("sapFCardBaseContent");
			oRm.writeClasses();

			if (oCard && oCard.isA("sap.f.ICard") && oCard.getHeight() === "auto") { // if there is no height specified the default value is "auto"
				oRm.addStyle("min-height", sHeight);
			}

			oRm.writeStyles();
			oRm.write(">");

			oRm.renderControl(oCardContent.getAggregation("_content"));

			oRm.write("</div>");
		}
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	BaseContent.prototype.init = function () {
		this._aReadyPromises = [];
		this._bReady = false;
		this._mObservers = {};

		// So far the ready event will be fired when the data is ready. But this can change in the future.
		this._awaitEvent("_dataReady");
		this._awaitEvent("_actionContentReady");

		Promise.all(this._aReadyPromises).then(function () {
			this._bReady = true;
			this.fireEvent("_ready");
		}.bind(this));

		this.setBusyIndicatorDelay(0);
	};

	/**
	 * Handles tap event.
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	BaseContent.prototype.ontap = function (oEvent) {
		if (!oEvent.isMarked()) {
			this.firePress({/* no parameters */});
		}
	};

	BaseContent.prototype.exit = function () {
		this._oServiceManager = null;
		this._oDataProviderFactory = null;

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
			this._oDataProvider = null;
		}
	};

	/**
	 * Await for an event which controls the overall "ready" state of the content.
	 *
	 * @private
	 * @param {string} sEvent The name of the event
	 */
	BaseContent.prototype._awaitEvent = function (sEvent) {
		this._aReadyPromises.push(new Promise(function (resolve) {
			this.attachEventOnce(sEvent, function () {
				resolve();
			});
		}.bind(this)));
	};

	BaseContent.prototype.destroy = function () {
		this.setAggregation("_content", null);
		this.setModel(null);
		this._aReadyPromises = null;
		if (this._mObservers) {
			Object.keys(this._mObservers).forEach(function (sKey) {
				this._mObservers[sKey].disconnect();
				delete this._mObservers[sKey];
			}, this);
		}
		return Control.prototype.destroy.apply(this, arguments);
	};

	BaseContent.prototype.setConfiguration = function (oConfiguration) {

		this._oConfiguration = oConfiguration;

		if (!oConfiguration) {
			return this;
		}

		var oList = this.getInnerList();
		if (oList && oConfiguration.maxItems) {
			oList.setGrowing(true);
			oList.setGrowingThreshold(oConfiguration.maxItems);
			oList.addStyleClass("sapFCardMaxItems");
		}

		this._setData(oConfiguration.data);

		return this;
	};

	BaseContent.prototype.getConfiguration = function () {
		return this._oConfiguration;
	};

	/**
	 * The function should be overwritten for content types which support the maxItems property.
	 *
	 * @protected
	 * @virtual
	 * @returns {sap.ui.core.Control|null} An instance of ListBase or null.
	 */
	BaseContent.prototype.getInnerList = function () {
		return null;
	};

	/**
	 * Requests data and bind it to the item template.
	 *
	 * @private
	 * @param {Object} oDataSettings The data part of the configuration object
	 */
	BaseContent.prototype._setData = function (oDataSettings) {
		var sPath = "/";
		if (oDataSettings && oDataSettings.path) {
			sPath = oDataSettings.path;
		}

		this.bindObject(sPath);

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}

		this._oDataProvider = this._oDataProviderFactory.create(oDataSettings, this._oServiceManager);

		if (this._oDataProvider) {
			this.setBusy(true);

			// If a data provider is created use an own model. Otherwise bind to the one propagated from the card.
			this.setModel(new JSONModel());

			this._oDataProvider.attachDataChanged(function (oEvent) {
				this._updateModel(oEvent.getParameter("data"));
				this.setBusy(false);
			}.bind(this));

			this._oDataProvider.attachError(function (oEvent) {
				this._handleError(oEvent.getParameter("message"));
				this.setBusy(false);
			}.bind(this));

			this._oDataProvider.triggerDataUpdate().then(function () {
				this.fireEvent("_dataReady");
			}.bind(this));
		} else {
			this.fireEvent("_dataReady");
		}
	};

	/**
	 * Helper function to bind an aggregation.
	 *
	 * @param {string} sAggregation The name of the aggregation to bind.
	 * @param {sap.ui.core.Control} oControl The control which aggregation is going to be bound.
	 * @param {Object} oBindingInfo The binding info.
	 */
	function _bind(sAggregation, oControl, oBindingInfo) {
		var oBindingContext = this.getBindingContext(),
			oModel = this.getModel("parameters"),
			oAggregation = oControl.getAggregation(sAggregation);

		if (oBindingContext) {
			oBindingInfo.path = oBindingContext.getPath();
			oControl.bindAggregation(sAggregation, oBindingInfo);

			if (oModel && oAggregation) {
				oModel.setProperty("/visibleItems", oAggregation.length);
			}

			if (!this._mObservers[sAggregation]) {
				this._mObservers[sAggregation] = new ManagedObjectObserver(function (oChanges) {
					if (oChanges.name === sAggregation && (oChanges.mutation === "insert" || oChanges.mutation === "remove")) {
						var oAggregation = oControl.getAggregation(sAggregation);
						var iLength = oAggregation ? oAggregation.length : 0;
						if (oModel) {
							oModel.setProperty("/visibleItems", iLength);
						}
					}
				});
				this._mObservers[sAggregation].observe(oControl, { aggregations: [sAggregation] });
			}
		}
	}

	/**
	 * Binds an aggregation to the binding context path of the BaseContent.
	 *
	 * NOTE:
	 * For now items will always be bound to the content's binding context path.
	 * Later on this can be changed so that the content and items can have different binding context paths.
	 *
	 * Used for Card Content types which support aggregation binding (List, Table, Timeline).
	 *
	 * @protected
	 * @param {string} sAggregation The name of the aggregation to bind.
	 * @param {sap.ui.core.Control} oControl The control which aggregation is going to be bound.
	 * @param {Object} oBindingInfo The binding info.
	 */
	BaseContent.prototype._bindAggregation = function (sAggregation, oControl, oBindingInfo) {
		var bAggregation = sAggregation && typeof sAggregation === "string";
		var bBindingInfo = oBindingInfo && typeof oBindingInfo === "object";
		if (!bAggregation || !oControl || !bBindingInfo) {
			return;
		}

		if (this.getBindingContext()) {
			_bind.apply(this, arguments);
		} else {
			oControl.attachModelContextChange(_bind.bind(this, sAggregation, oControl, oBindingInfo));
		}
	};

	/**
	 * @returns {boolean} If the content is ready or not.
	 */
	BaseContent.prototype.isReady = function () {
		return this._bReady;
	};

	/**
	 * Updates the model and binds the data to the list.
	 *
	 * @private
	 * @param {Object} oData The data to set.
	 */
	BaseContent.prototype._updateModel = function (oData) {
		this.getModel().setData(oData);
	};

	BaseContent.prototype._handleError = function (sLogMessage) {
		this.fireEvent("_error", { logMessage: sLogMessage });
	};

	BaseContent.prototype.setServiceManager = function (oServiceManager) {
		this._oServiceManager = oServiceManager;
		return this;
	};

	BaseContent.prototype.setDataProviderFactory = function (oDataProviderFactory) {
		this._oDataProviderFactory = oDataProviderFactory;
		return this;
	};

	BaseContent.create = function (sType, oConfiguration, oServiceManager, oDataProviderFactory) {
		return new Promise(function (resolve, reject) {
			var fnCreateContentInstance = function (Content) {
				var oContent = new Content();
				oContent.setServiceManager(oServiceManager);
				oContent.setDataProviderFactory(oDataProviderFactory);
				oContent.setConfiguration(oConfiguration);
				resolve(oContent);
			};

			try {
				switch (sType.toLowerCase()) {
					case "list":
						sap.ui.require(["sap/f/cards/ListContent"], fnCreateContentInstance);
						break;
					case "table":
						sap.ui.require(["sap/f/cards/TableContent"], fnCreateContentInstance);
						break;
					case "object":
						sap.ui.require(["sap/f/cards/ObjectContent"], fnCreateContentInstance);
						break;
					case "analytical":
						Core.loadLibrary("sap.viz", {
								async: true
							})
							.then(function () {
								sap.ui.require(["sap/f/cards/AnalyticalContent"], fnCreateContentInstance);
							})
							.catch(function () {
								reject("Analytical content type is not available with this distribution.");
							});
						break;
					case "timeline":
						Core.loadLibrary("sap.suite.ui.commons", {
								async: true
							})
							.then(function() {
								sap.ui.require(["sap/f/cards/TimelineContent"], fnCreateContentInstance);
							})
							.catch(function () {
								reject("Timeline content type is not available with this distribution.");
							});
						break;
					case "component":
						sap.ui.require(["sap/f/cards/ComponentContent"], fnCreateContentInstance);
						break;
					default:
						reject(sType.toUpperCase() + " content type is not supported.");
				}
			} catch (sError) {
				reject(sError);
			}
		});
	};

	BaseContent.getMinHeight = function (sType, oContent) {

		var MIN_HEIGHT = 5,
			iHeight;

		if (jQuery.isEmptyObject(oContent)) {
			return "0rem";
		}

		switch (sType) {
			case "ListContent":
				iHeight = BaseContent._getMinListHeight(oContent); break;
			case "TableContent":
				iHeight = BaseContent._getMinTableHeight(oContent); break;
			case "TimelineContent":
				iHeight = BaseContent._getMinTimelineHeight(oContent); break;
			case "AnalyticalContent":
				iHeight = 14; break;
			case "ObjectContent":
				iHeight = 0; break;
			default:
				iHeight = 0;
		}

		return  (iHeight !== 0 ? iHeight : MIN_HEIGHT) + "rem";
	};

	BaseContent._getMinListHeight = function (oContent) {
		var iCount = oContent.maxItems || 0,
			oTemplate = oContent.item,
			iItemHeight = 3;

		if (!oTemplate) {
			return 0;
		}

		if (oTemplate.icon || oTemplate.description) {
			iItemHeight = 4;
		}

		return iCount * iItemHeight;
	};

	BaseContent._getMinTableHeight = function (oContent) {
		var iCount = oContent.maxItems || 0,
			iRowHeight = 3,
			iTableHeaderHeight = 3;

		return iCount * iRowHeight + iTableHeaderHeight;
	};

	BaseContent._getMinTimelineHeight = function (oContent) {
		var iCount = oContent.maxItems || 0,
			iItemHeight = 6;

		return iCount * iItemHeight;
	};

	return BaseContent;
});
