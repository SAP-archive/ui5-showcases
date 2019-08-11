/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";return{apiVersion:2,render:function(e,t){var i=t._oAcc,o=i.getRootAttributes(),l=t.getTitle(),a=l&&!t.getShowMenuButton();e.openStart("div",t);e.class("sapFShellBar");if(t.getShowNotifications()){e.class("sapFShellBarNotifications")}e.accessibilityState({role:o.role,label:o.label});e.openEnd();if(a){e.openStart("div",t.getId()+"-titleHidden").class("sapFShellBarTitleHidden").attr("role","heading").attr("aria-level","1").openEnd();e.text(l).close("div")}e.renderControl(t._getOverflowToolbar());e.close("div")},shouldAddIBarContext:function(){return false}}},true);