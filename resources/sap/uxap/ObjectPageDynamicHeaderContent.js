/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","./ObjectPageDynamicHeaderContentRenderer","sap/base/Log"],function(e,t,n){"use strict";try{sap.ui.getCore().loadLibrary("sap.f")}catch(e){n.error("The control 'sap.uxap.ObjectPageDynamicHeaderContent' needs library 'sap.f'.");throw e}var a=sap.ui.requireSync("sap/f/DynamicPageHeader");var r=a.extend("sap.uxap.ObjectPageDynamicHeaderContent",{metadata:{interfaces:["sap.uxap.IHeaderContent"],library:"sap.uxap"}});r.createInstance=function(e,t,n,a,p){return new r({content:e,visible:t,pinnable:a,id:p})};r.prototype.supportsPinUnpin=function(){return true};r.prototype.supportsChildPageDesign=function(){return false};r.prototype.supportsAlwaysExpanded=function(){return false};r.prototype.setContentDesign=function(e){};return r});