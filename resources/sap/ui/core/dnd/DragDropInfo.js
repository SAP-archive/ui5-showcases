/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./DragInfo","./DropInfo","sap/base/Log"],function(e,r,t){"use strict";var o=r.extend("sap.ui.core.dnd.DragDropInfo",{metadata:{library:"sap.ui.core",interfaces:["sap.ui.core.dnd.IDragInfo","sap.ui.core.dnd.IDropInfo"],properties:{sourceAggregation:{type:"string",defaultValue:null}},associations:{targetElement:{type:"sap.ui.core.Element",multiple:false}},events:{dragStart:{allowPreventDefault:true},dragEnd:{}}}});o.prototype.isDraggable=e.prototype.isDraggable;o.prototype.fireDragEnd=e.prototype.fireDragEnd;o.prototype.fireDragStart=e.prototype.fireDragStart;o.prototype.getDropTarget=function(){var e=this.getTargetElement();if(e){return sap.ui.getCore().byId(e)}return this.getParent()};o.prototype.setGroupName=function(){t.error("groupName property must not be set on "+this);return this};return o},true);