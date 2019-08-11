sap.ui.define(["sap/m/Image","sap/m/library"],function(e,t){"use strict";var a=t.ImageMode;return e.extend("showcaseslib.FrameImage",{metadata:{properties:{device:{type:"string",group:"Data",defaultValue:""}}},lightBoxClass:{tablet:"sc-frameimage__magnifier--tablet",laptop:"sc-frameimage__magnifier--laptop",desktop:"",phone:"sc-frameimage__magnifier--tablet"},rootClass:{desktop:"sc-frameimage--desktop",tablet:"sc-frameimage--tablet",laptop:"sc-frameimage--laptop",phone:""},contentClass:{desktop:"sc-frameimage__content--desktop",tablet:"sc-frameimage__content--tablet",laptop:"sc-frameimage__content--laptop",phone:""},frameImageClass:{desktop:"sc-frameimage__frame--desktop",tablet:"sc-frameimage__frame--tablet",laptop:"sc-frameimage__frame--laptop",phone:""},setSrc:function(e){if(e===this.getSrc()){return this}this.setProperty("src",e,false);return this},getRootClass:function(){return this.rootClass[this.getProperty("device")]},getContentClass:function(){return this.contentClass[this.getProperty("device")]},getLightBoxClass:function(){return this.lightBoxClass[this.getProperty("device")]||""},getFrameImageClass:function(){return this.frameImageClass[this.getProperty("device")]},init:function(){this.setDensityAware(false);this.addStyleClass("sc-frameimage")},renderer:function(e,t){var s=t.getMode(),i=t.getAlt(),r=t.getTooltip_AsString(),g=t.hasListeners("press"),o=t.getDetailBox(),d=t.getUseMap(),n=t.getAriaLabelledBy(),l=t.getAriaDescribedBy();e.write("<div");e.writeControlData(t);e.addClass(o?"":t.getRootClass());e.writeClasses();e.write(">");e.write("<div");e.addClass("sc-frameimage__content");e.addClass(t.getContentClass());e.writeClasses();e.write(">");if(o){e.write('<span class="sapMLightBoxImage">');e.write("<span");e.addClass("sapMLightBoxMagnifyingGlass");e.addClass(t.getLightBoxClass());e.writeClasses();e.write("></span>")}e.write("<div");e.addClass("sc-frameimage__frame");e.addClass(t.getFrameImageClass());e.writeClasses();e.write(">");t._renderImages(e);if(!t.getSrc()){e.addStyle("display","none");e.writeStyles()}if(!o){e.writeControlData(t)}if(!t.getDecorative()&&n&&n.length>0){e.writeAttributeEscaped("aria-labelledby",n.join(" "))}if(!t.getDecorative()&&l&&l.length>0){e.writeAttributeEscaped("aria-describedby",l.join(" "))}if(s===a.Image){e.writeAttributeEscaped("src",t._getDensityAwareSrc())}else{t._preLoadImage(t._getDensityAwareSrc());e.addStyle("background-size",jQuery.sap.encodeHTML(t.getBackgroundSize()));e.addStyle("background-position",jQuery.sap.encodeHTML(t.getBackgroundPosition()));e.addStyle("background-repeat",jQuery.sap.encodeHTML(t.getBackgroundRepeat()))}e.addClass("sapMImg");if(t.hasListeners("press")||t.hasListeners("tap")){e.addClass("sapMPointer")}if(d||!t.getDecorative()||g){e.addClass("sapMImgFocusable")}e.writeClasses();if(d){if(!jQuery.sap.startsWith(d,"#")){d="#"+d}e.writeAttributeEscaped("useMap",d)}if(t.getDecorative()&&!d&&!g){e.writeAttribute("role","presentation");e.writeAttribute("aria-hidden","true");e.write(" alt=''")}else{if(i||r){e.writeAttributeEscaped("alt",i||r)}}if(i||r){e.writeAttributeEscaped("aria-label",i||r)}if(r){e.writeAttributeEscaped("title",r)}if(g){e.writeAttribute("role","button");e.writeAttribute("tabIndex",0)}if(t.getWidth()&&t.getWidth()!=""){e.addStyle("width",t.getWidth())}if(t.getHeight()&&t.getHeight()!=""){e.addStyle("height",t.getHeight())}e.writeStyles();e.write(" />");e.write("</div>");if(o){e.write("</span>")}e.write("</div>");e.write("</div>")},_renderImages:function(e){e.write(this.getMode()===a.Image?"<img":"<span");e.addClass("sc-frameimage__image");e.writeClasses()}})});