/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the Design Time Metadata for the sap.f.DynamicPageTitle control
sap.ui.define([],
	function () {
		"use strict";

		return {
			aggregations: {
				heading: {
					domRef: ":sap-domref .sapFDynamicPageTitleMainHeadingInner"
				},
				expandedHeading: {
					domRef: function (oElement) {
						return oElement.$("expand-heading-wrapper").get(0);
					},
					ignore: function (oElement) {
						return oElement.getHeading();
					}
				},
				snappedHeading: {
					domRef: function (oElement) {
						return oElement.$("snapped-heading-wrapper").get(0);
					},
					ignore: function (oElement) {
						return oElement.getHeading();
					}
				},
				actions: {
					domRef: ":sap-domref .sapFDynamicPageTitleMainActions",
					actions: {
						split: {
							changeType: "splitMenuButton"
						},
						combine: {
							changeType: "combineButtons"
						},
						move: {
							changeType: "moveActions"
						}
					}
				},
				content: {
					domRef: ":sap-domref .sapFDynamicPageTitleMainContent",
					actions: {
						move: {
							changeType: "moveControls"
						}
					}
				},
				snappedContent: {
					domRef: function (oElement) {
						return oElement.$("snapped-wrapper").get(0);
					},
					actions: {
						move: {
							changeType: "moveControls"
						}
					}
				},
				expandedContent: {
					domRef: function (oElement) {
						return oElement.$("expand-wrapper").get(0);
					},
					actions: {
						move: {
							changeType: "moveControls"
						}
					}
				},
				snappedTitleOnMobile: {
					ignore: true
				},
				navigationActions: {
					ignore: true
				},
				breadcrumbs: {
					ignore: true
				}
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				}
			},
			name: {
				singular: "DYNAMIC_PAGE_TITLE_NAME",
				plural: "DYNAMIC_PAGE_TITLE_NAME_PLURAL"
			}
		};

	}, /* bExport= */ false);