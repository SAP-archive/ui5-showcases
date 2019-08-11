/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,r){var t=r._getSearchField(),n=r._getCancelButton(),i=r._getSearchButton(),a=r.getIsOpen(),o=r.getPhoneMode(),l=r.getWidth();e.openStart("div",r);if(a){e.class("sapFShellBarSearch")}if(o){e.class("sapFShellBarSearchFullWidth")}if(l&&a&&!o){e.style("width",l)}e.openEnd();if(a){e.renderControl(t)}e.renderControl(i);if(a&&o){e.renderControl(n)}e.close("div")};return e},true);