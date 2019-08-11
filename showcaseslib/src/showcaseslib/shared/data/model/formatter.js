sap.ui.define([], function () {
		"use strict";
		return {

			/**
			 * Returns the correct path for the json model
			 * @public
			 */
			formatPicture: function (sURL) {
				if (/^data:/.test(sURL)) {
					return sURL;
				}
				return sap.ui.require.toUrl("showcaseslib/shared/data/") + sURL;
			},
			getLargeImage: function (sURL) {
				return sap.ui.require.toUrl("showcaseslib/shared/data/large/") + sURL;
			},

			getSmallImage: function (sURL) {
				if (jQuery.sap.sjax({url: sap.ui.require.toUrl("showcaseslib/shared/data/small/") + sURL}).statusCode == 200) {
					return sap.ui.require.toUrl("showcaseslib/shared/data/small/") + sURL;
				} else {
					return sap.ui.require.toUrl("showcaseslib/shared/data/large/") + sURL;
				}
			},
			supportedDeviceUrl: function (sValue) {
				return sap.ui.require.toUrl("showcaseslib/shared/data/") + sValue.toLowerCase() + "_icon_small_white.png";
			},
			defaultDescriptionText: function (sValue) {
				if (sValue === "") {
					return "See how your showcase comes to life as you add more details in the wizard";
				}
				else {
					return sValue;
				}
			},
			hideLinkButtonWhenEmpty: function(sValue){
				for(var i =0;i<sValue.length;i++){
					if(sValue[i].text === ""){
						sValue.splice(i,1);
					}
				}
				return sValue;
			}
		};

	}
);
