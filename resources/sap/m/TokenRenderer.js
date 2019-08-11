/*!

* OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.

*/
sap.ui.define(["sap/ui/core/library","sap/ui/core/InvisibleText"],function(e,t){"use strict";var i=e.TextDirection;var a={apiVersion:2};a.render=function(e,i){var n=i._getTooltip(i,i.getEditable()),r=[],s={role:"listitem"};e.openStart("div",i).attr("tabindex","-1").class("sapMToken");if(i.getSelected()){e.class("sapMTokenSelected")}if(!i.getEditable()){e.class("sapMTokenReadOnly")}if(n){e.attr("title",n)}r.push(t.getStaticId("sap.m","TOKEN_ARIA_LABEL"));if(i.getEditable()){r.push(t.getStaticId("sap.m","TOKEN_ARIA_DELETABLE"))}if(i.getSelected()){r.push(t.getStaticId("sap.m","TOKEN_ARIA_SELECTED"))}s.describedby={value:r.join(" "),append:true};e.accessibilityState(i,s);e.openEnd();a._renderInnerControl(e,i);if(i.getEditable()){e.renderControl(i._deleteIcon)}e.close("div")};a._renderInnerControl=function(e,t){var a=t.getTextDirection();e.openStart("span").class("sapMTokenText");if(a!==i.Inherit){e.attr("dir",a.toLowerCase())}e.openEnd();var n=t.getText();if(n){e.text(n)}e.close("span")};return a},true);