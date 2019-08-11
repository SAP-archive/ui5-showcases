/*!
	* OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
	*/
sap.ui.define(["sap/ui/fl/changeHandler/MoveControls","sap/ui/thirdparty/jquery"],function(e,r){"use strict";var n=r.extend({},e);n.applyChange=function(r,n,t){var a=t.modifier.targets==="jsControlTree";if(a){n._suppressScroll()}var i=e.applyChange.call(this,r,n,t);if(a){n.attachEventOnce("onAfterRenderingDOMReady",function(){n._resumeScroll(false)})}return i};n.revertChange=function(r,n,t){var a=t.modifier.targets==="jsControlTree";if(a){n._suppressScroll()}var i=e.revertChange.call(this,r,n,t);if(a){n.attachEventOnce("onAfterRenderingDOMReady",function(){n._resumeScroll(false)})}return i};return n},true);