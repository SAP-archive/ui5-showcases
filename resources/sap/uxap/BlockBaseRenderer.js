/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(function(){"use strict";var e={};e.render=function(e,t){if(!t.getVisible()){return}e.write("<div");e.writeControlData(t);if(t._getSelectedViewContent()){e.addClass("sapUxAPBlockBase");e.addClass("sapUxAPBlockBase"+t.getMode())}else{var a=t.getMetadata().getName().split(".").pop();e.addClass("sapUxAPBlockBaseDefaultSize");e.addClass("sapUxAPBlockBaseDefaultSize"+a+t.getMode())}e.writeClasses();e.write(">");if(t._getSelectedViewContent()){e.renderControl(t._getSelectedViewContent())}e.write("</div>")};return e},true);