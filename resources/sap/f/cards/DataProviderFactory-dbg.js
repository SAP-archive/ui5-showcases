/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/f/cards/ServiceDataProvider",
	"sap/f/cards/RequestDataProvider",
	"sap/f/cards/DataProvider"
],
function (BaseObject, ServiceDataProvider, RequestDataProvider, DataProvider) {
"use strict";

	/**
	 * @class
	 * A factory class which creates a data provider based on data settings and stores the created instance.
	 * When destroyed, all data providers created by this class are also destroyed.
	 *
	 * @author SAP SE
	 * @version 1.68.1
	 *
	 * @private
	 * @since 1.65
	 * @alias sap.f.cards.DataProviderFactory
	 */
	var DataProviderFactory = BaseObject.extend("sap.f.cards.DataProviderFactory", {
		constructor: function () {
			BaseObject.call(this);
			this._aDataProviders = [];
		}
	});

	DataProviderFactory.prototype.destroy = function () {
		BaseObject.prototype.destroy.apply(this, arguments);

		if (this._aDataProviders) {
			this._aDataProviders.forEach(function(oDataProvider) {
				if (!oDataProvider.bIsDestroyed) {
					oDataProvider.destroy();
				}
			});

			this._aDataProviders = null;
		}
	};

	/**
	 * Factory function which returns an instance of <code>DataProvider</code>.
	 *
	 * @param {Object} oDataSettings The data settings.
	 * @param {sap.ui.integration.util.ServiceManager} oServiceManager A reference to the service manager.
	 * @returns {sap.f.cards.DataProvider|null} A data provider instance used for data retrieval.
	 */
	DataProviderFactory.prototype.create = function (oDataSettings, oServiceManager) {
		var oDataProvider;

		if (!oDataSettings) {
			return null;
		}

		if (oDataSettings.request) {
			oDataProvider = new RequestDataProvider();
		} else if (oDataSettings.service) {
			oDataProvider = new ServiceDataProvider();
		} else if (oDataSettings.json) {
			oDataProvider = new DataProvider();
		} else {
			return null;
		}

		oDataProvider.setSettings(oDataSettings);

		if (oDataProvider.isA("sap.f.cards.IServiceDataProvider")) {
			oDataProvider.createServiceInstances(oServiceManager);
		}

		if (oDataSettings.updateInterval) {
			oDataProvider.setUpdateInterval(oDataSettings.updateInterval);
		}

		this._aDataProviders.push(oDataProvider);

		return oDataProvider;
	};

	return DataProviderFactory;
});