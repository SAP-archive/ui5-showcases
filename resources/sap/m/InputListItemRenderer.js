/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/library","sap/ui/core/Renderer","./ListItemBaseRenderer"],function(e,t,r){"use strict";var i=e.TextDirection;var a=t.extend(r);a.renderLIAttributes=function(e,t){e.addClass("sapMILI")};a.renderLIContent=function(e,t){var r=t.getLabel();if(r){var a=t.getId()+"-label",n=t.getLabelTextDirection();e.write('<span id="'+a+'" class="sapMILILabel"');if(n!==i.Inherit){e.writeAttribute("dir",n.toLowerCase())}e.write(">");e.writeEscaped(r);e.write("</span>")}e.write('<div class="sapMILIDiv sapMILI-CTX">');t.getContent().forEach(function(t){e.renderControl(t)});e.write("</div>")};return a},true);