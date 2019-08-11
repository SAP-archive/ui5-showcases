/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/Object","sap/f/cards/ServiceDataProvider","sap/f/cards/RequestDataProvider","sap/f/cards/DataProvider"],function(e,t,r,a){"use strict";var s=e.extend("sap.f.cards.DataProviderFactory",{constructor:function(){e.call(this);this._aDataProviders=[]}});s.prototype.destroy=function(){e.prototype.destroy.apply(this,arguments);if(this._aDataProviders){this._aDataProviders.forEach(function(e){if(!e.bIsDestroyed){e.destroy()}});this._aDataProviders=null}};s.prototype.create=function(e,s){var i;if(!e){return null}if(e.request){i=new r}else if(e.service){i=new t}else if(e.json){i=new a}else{return null}i.setSettings(e);if(i.isA("sap.f.cards.IServiceDataProvider")){i.createServiceInstances(s)}if(e.updateInterval){i.setUpdateInterval(e.updateInterval)}this._aDataProviders.push(i);return i};return s});