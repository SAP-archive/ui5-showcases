/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./isPlainObject"],function(r){"use strict";var e=function(){
/*
		 * The code in this function is taken from jQuery 2.2.3 "jQuery.extend" and got modified.
		 *
		 * jQuery JavaScript Library v2.2.3
		 * http://jquery.com/
		 *
		 * Copyright jQuery Foundation and other contributors
		 * Released under the MIT license
		 * http://jquery.org/license
		 */
var i,n,t,f,o,a,s=arguments[0]||{},u=1,c=arguments.length;if(typeof s!=="object"&&typeof s!=="function"){s={}}for(;u<c;u++){o=arguments[u];for(f in o){i=s[f];t=o[f];if(f==="__proto__"||s===t){continue}if(t&&(r(t)||(n=Array.isArray(t)))){if(n){n=false;a=Array.isArray(i)?i:[]}else{a=i&&r(i)?i:{}}s[f]=e(a,t)}else{s[f]=t}}}return s};return e});