/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Renderer","sap/ui/core/IconPool","sap/m/library","sap/ui/Device","sap/ui/core/InvisibleText","sap/ui/core/library"],function(e,t,i,a,r,d){"use strict";var s=d.TextDirection;var n=d.ValueState;var l=i.SelectType;var o={};o.CSS_CLASS="sapMSlt";o.render=function(e,i){var r=i.getTooltip_AsString(),d=i.getType(),s=i.getAutoAdjustWidth(),u=i.getEditable(),c=i.getEnabled(),S=i.getWidth(),g=S.indexOf("%")>-1,w=s||S==="auto"||g,I=o.CSS_CLASS;e.write("<div");this.addClass(e,i);e.addClass(I);e.addClass(I+i.getType());if(!c){e.addClass(I+"Disabled")}else if(!u){e.addClass(I+"Readonly")}if(w&&d===l.Default){e.addClass(I+"MinWidth")}if(s){e.addClass(I+"AutoAdjustedWidth")}else{e.addStyle("width",S)}if(i.getIcon()){e.addClass(I+"WithIcon")}if(c&&u&&a.system.desktop){e.addClass(I+"Hoverable")}e.addClass(I+"WithArrow");if(i.getValueState()!==n.None){this.addValueStateClasses(e,i)}e.addStyle("max-width",i.getMaxWidth());e.writeControlData(i);e.writeStyles();e.writeClasses();this.writeAccessibilityState(e,i);if(r){e.writeAttributeEscaped("title",r)}else if(d===l.IconOnly){var b=t.getIconInfo(i.getIcon());if(b){e.writeAttributeEscaped("title",b.text)}}if(c){e.writeAttribute("tabindex","0")}e.write(">");this.renderHiddenInput(e,i);this.renderLabel(e,i);switch(d){case l.Default:this.renderArrow(e,i);break;case l.IconOnly:this.renderIcon(e,i);break}var f=i.getList();if(i._isShadowListRequired()&&f){this.renderShadowList(e,f)}if(i.getName()){this.renderInput(e,i)}e.write("</div>")};o.renderHiddenInput=function(e,t){e.write("<input");e.writeAttribute("id",t.getId()+"-hiddenInput");e.writeAttribute("aria-readonly","true");e.writeAttribute("tabindex","-1");e.addClass("sapUiPseudoInvisibleText");e.writeClasses();e.write(" />")};o.renderLabel=function(t,i){var a=i.getSelectedItem(),r=i.getTextDirection(),d=e.getTextAlign(i.getTextAlign(),r),u=o.CSS_CLASS;t.write("<label");t.writeAttribute("id",i.getId()+"-label");t.writeAttribute("for",i.getId());t.writeAttribute("aria-live","polite");t.addClass(u+"Label");if(i.getValueState()!==n.None){t.addClass(u+"LabelState");t.addClass(u+"Label"+i.getValueState())}if(i.getType()===l.IconOnly){t.addClass("sapUiPseudoInvisibleText")}if(r!==s.Inherit){t.writeAttribute("dir",r.toLowerCase())}if(d){t.addStyle("text-align",d)}t.writeStyles();t.writeClasses();t.write(">");if(i.getType()!==l.IconOnly){t.renderControl(i._getValueIcon());t.write("<span");t.addClass("sapMSelectListItemText");t.writeAttribute("id",i.getId()+"-labelText");t.writeClasses();t.write(">");a&&a.getParent()?t.writeEscaped(a.getText()):"";t.write("</span>")}t.write("</label>")};o.renderArrow=function(e,t){var i=o.CSS_CLASS;e.write("<span");e.addClass(i+"Arrow");if(t.getValueState()!==n.None){e.addClass(i+"ArrowState")}e.writeAttribute("id",t.getId()+"-arrow");e.writeClasses();e.write("></span>")};o.renderIcon=function(e,t){e.writeIcon(t.getIcon(),o.CSS_CLASS+"Icon",{id:t.getId()+"-icon",title:null})};o.renderInput=function(e,t){e.write("<input hidden");e.writeAttribute("id",t.getId()+"-input");e.addClass(o.CSS_CLASS+"Input");e.writeAttribute("aria-hidden","true");e.writeAttribute("tabindex","-1");if(!t.getEnabled()){e.write("disabled")}e.writeClasses();e.writeAttributeEscaped("name",t.getName());e.writeAttributeEscaped("value",t.getSelectedKey());e.write("/>")};o.renderShadowList=function(e,t){var i=t.getRenderer();i.writeOpenListTag(e,t,{elementData:false});this.renderShadowItems(e,t);i.writeCloseListTag(e,t)};o.renderShadowItems=function(e,t){var i=t.getRenderer(),a=t.getItems().length,r=t.getSelectedItem();for(var d=0,s=t.getItems();d<s.length;d++){i.renderItem(e,t,s[d],{selected:r===s[d],setsize:a,posinset:d+1,elementData:false})}};o.addClass=function(e,t){};o.addValueStateClasses=function(e,t){e.addClass(o.CSS_CLASS+"State");e.addClass(o.CSS_CLASS+t.getValueState())};o.getAriaRole=function(e){switch(e.getType()){case l.Default:return"combobox";case l.IconOnly:return"button"}};o._getValueStateString=function(e){var t="sap.ui.core";switch(e.getValueState()){case n.Success:return r.getStaticId(t,"VALUE_STATE_SUCCESS");case n.Warning:return r.getStaticId(t,"VALUE_STATE_WARNING");case n.Information:return r.getStaticId(t,"VALUE_STATE_INFORMATION")}return""};o.writeAccessibilityState=function(e,i){var a=this._getValueStateString(i),r=i.getSelectedItem(),d=i.getType()===l.IconOnly,s,o;if(a){a=" "+a}if(r&&!r.getText()&&r.getIcon&&r.getIcon()){var u=t.getIconInfo(r.getIcon());if(u){o=u.text||u.name}}s={value:o?i._getValueIcon().getId():i.getId()+"-label"+a,append:true};e.writeAccessibilityState(i,{role:this.getAriaRole(i),disabled:!i.getEnabled(),readonly:d?undefined:i.getEnabled()&&!i.getEditable(),expanded:i.isOpen(),invalid:i.getValueState()===n.Error?true:undefined,labelledby:d?undefined:s,haspopup:d?true:undefined})};return o},true);