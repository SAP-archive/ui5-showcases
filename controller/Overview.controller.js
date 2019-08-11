sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/UIComponent"],function(e,t,n,o){"use strict";return e.extend("sap.ui5.showcaseApp.controller.Overview",{_iCarouselTimeout:0,_iCarouselLoopTime:1e5,onInit:function(){this.getRouter().getRoute("overview").attachPatternMatched(this._onPatternMatched,this)},getRouter:function(){return o.getRouterFor(this)},onShowCaseComponentCreated:function(e){var t=e.getParameter("component");t.attachNavigateToPresentation(this.onNavigateToPresentation,this);t.attachNavigateToContributionPage(this.onNavigateToContributionPage,this)},onNavigateToPresentation:function(e){var t=this.getOwnerComponent().byId("app").getDomRef();if(t.requestFullscreen){t.requestFullscreen()}else if(t.mozRequestFullScreen){t.mozRequestFullScreen()}else if(t.webkitRequestFullscreen){t.webkitRequestFullscreen()}else if(t.msRequestFullscreen){t.msRequestFullscreen()}this.getRouter().navTo("presentation",{query:{project:e.getParameter("navTarget"),show:this._bExternal?"public":"all"}})},onNavigateToContributionPage:function(){this.getRouter().navTo("contribute")},_onPatternMatched:function(e){var o=e.getParameter("arguments")["?query"],i=o&&o.project||0,r=o&&o.show==="public",a="/"+i;this._bExternal=r;var s=this.byId("showCasePageComponent");if(!this._oComponentCreatedPromise){this._oComponentCreatedPromise=new Promise(function(e){s.attachComponentCreated(e)})}this._oComponentCreatedPromise.then(function(){var e=this.getComponentInstance().getRootControl();e.loaded().then(function(e){var o=e.byId("objectPageLayout");if(r){var i=o.getBinding("sections");var s=new t("classification",n.EQ,"public");i.filter(s)}function u(e){var t=this.getSections().filter(function(e){var t=10;return e.getBindingContext().getPath().substr(t)===a});setTimeout(function(){this.scrollToSection(t[0].getId())}.bind(this),typeof e==="boolean"?0:1e3)}if(!o.$().length){o.addEventDelegate({onAfterRendering:u.bind(o)})}else{u.bind(o)(true)}})}.bind(s))}})});