sap.ui.define([
	'sap/m/Image',
	'sap/m/library'
], function (Image, mobileLibrary) {
	"use strict";

	var ImageMode = mobileLibrary.ImageMode;
	return Image.extend("showcaseslib.FrameImage", {
		metadata: {
			properties: {
				/**
				 * In which device frame should the image be displayed.
				 */
				device: {type: "string", group: "Data", defaultValue: ""}
			}
		},

		/**
		 * Light box CSS classes
		 */
		lightBoxClass: {
			tablet: "sc-frameimage__magnifier--tablet",
			laptop: "sc-frameimage__magnifier--laptop",
			desktop: "",
			phone: "sc-frameimage__magnifier--tablet"
		},

		/**
		 * Frame image source image
		 */
		rootClass: {
			desktop: "sc-frameimage--desktop",
			tablet: "sc-frameimage--tablet",
			laptop: "sc-frameimage--laptop",
			phone: ""
		},

		/**
		 * Frame image source image
		 */
		contentClass: {
			desktop: "sc-frameimage__content--desktop",
			tablet: "sc-frameimage__content--tablet",
			laptop: "sc-frameimage__content--laptop",
			phone: ""
		},

		/**
		 * Frame image CSS classes
		 */
		frameImageClass: {
			desktop: "sc-frameimage__frame--desktop",
			tablet: "sc-frameimage__frame--tablet",
			laptop: "sc-frameimage__frame--laptop",
			phone: ""
		},

		/**
		 * Set the source of the main image
		 * @override
		 */
		setSrc: function (sSrc) {
			if (sSrc === this.getSrc()) {
				return this;
			}

			this.setProperty("src", sSrc, false);
			return this;
		},

		getRootClass: function () {
			return this.rootClass[this.getProperty("device")];
		},

		getContentClass: function () {
			return this.contentClass[this.getProperty("device")];
		},

		getLightBoxClass: function () {
			return this.lightBoxClass[this.getProperty("device")] || "";
		},

		getFrameImageClass: function () {
			return this.frameImageClass[this.getProperty("device")];
		},

		init: function () {
			this.setDensityAware(false);
			this.addStyleClass("sc-frameimage");
		},

		renderer: function (oRm, oImage) {
			var sMode = oImage.getMode(),
				alt = oImage.getAlt(),
				tooltip = oImage.getTooltip_AsString(),
				bHasPressHandlers = oImage.hasListeners("press"),
				oLightBox = oImage.getDetailBox(),
				sUseMap = oImage.getUseMap(),
				aLabelledBy = oImage.getAriaLabelledBy(),
				aDescribedBy = oImage.getAriaDescribedBy();

			oRm.write("<div");
			oRm.writeControlData(oImage);
			oRm.addClass(oLightBox ? "" : oImage.getRootClass());
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sc-frameimage__content");
			oRm.addClass(oImage.getContentClass());
			oRm.writeClasses();
			oRm.write(">");

			// Additional element for Image with LightBox
			if (oLightBox) {
				oRm.write("<span class=\"sapMLightBoxImage\">");
				oRm.write("<span");
				oRm.addClass("sapMLightBoxMagnifyingGlass");
				oRm.addClass(oImage.getLightBoxClass());
				oRm.writeClasses();
				oRm.write("></span>");
			}

			oRm.write("<div");
			oRm.addClass("sc-frameimage__frame");
			oRm.addClass(oImage.getFrameImageClass());
			oRm.writeClasses();
			oRm.write(">");
			oImage._renderImages(oRm);

			// hack: do not show image when src is not set
			if (!oImage.getSrc()) {
				oRm.addStyle("display", "none");
				oRm.writeStyles();
			}

			if (!oLightBox) {
				oRm.writeControlData(oImage);
			}

			// aria-labelledby references
			if (!oImage.getDecorative() && aLabelledBy && aLabelledBy.length > 0) {
				oRm.writeAttributeEscaped("aria-labelledby", aLabelledBy.join(" "));
			}

			// aria-describedby references
			if (!oImage.getDecorative() && aDescribedBy && aDescribedBy.length > 0) {
				oRm.writeAttributeEscaped("aria-describedby", aDescribedBy.join(" "));
			}

			if (sMode === ImageMode.Image) {
				oRm.writeAttributeEscaped("src", oImage._getDensityAwareSrc());
			} else {
				// preload the image with a window.Image instance.
				// The source uri is set to the output DOM node via CSS style 'background-image'
				// after the source image is loaded (in onload function)
				oImage._preLoadImage(oImage._getDensityAwareSrc());
				oRm.addStyle("background-size", jQuery.sap.encodeHTML(oImage.getBackgroundSize()));
				oRm.addStyle("background-position", jQuery.sap.encodeHTML(oImage.getBackgroundPosition()));
				oRm.addStyle("background-repeat", jQuery.sap.encodeHTML(oImage.getBackgroundRepeat()));
			}

			oRm.addClass("sapMImg");
			if (oImage.hasListeners("press") || oImage.hasListeners("tap")) {
				oRm.addClass("sapMPointer");
			}

			if (sUseMap || !oImage.getDecorative() || bHasPressHandlers) {
				oRm.addClass("sapMImgFocusable");
			}

			oRm.writeClasses();

			//TODO implement the ImageMap control
			if (sUseMap) {
				if (!(jQuery.sap.startsWith(sUseMap, "#"))) {
					sUseMap = "#" + sUseMap;
				}
				oRm.writeAttributeEscaped("useMap", sUseMap);
			}

			if (oImage.getDecorative() && !sUseMap && !bHasPressHandlers) {
				oRm.writeAttribute("role", "presentation");
				oRm.writeAttribute("aria-hidden", "true");
				// accessibility requirement: write always empty alt attribute for decorative images
				oRm.write(" alt=''");
			} else {
				if (alt || tooltip) {
					oRm.writeAttributeEscaped("alt", alt || tooltip);
				}
			}

			if (alt || tooltip) {
				oRm.writeAttributeEscaped("aria-label", alt || tooltip);
			}

			if (tooltip) {
				oRm.writeAttributeEscaped("title", tooltip);
			}

			if (bHasPressHandlers) {
				oRm.writeAttribute("role", "button");
				oRm.writeAttribute("tabIndex", 0);
			}

			// Dimensions
			if (oImage.getWidth() && oImage.getWidth() != '') {
				oRm.addStyle("width", oImage.getWidth());
			}
			if (oImage.getHeight() && oImage.getHeight() != '') {
				oRm.addStyle("height", oImage.getHeight());
			}

			oRm.writeStyles();

			oRm.write(" />"); // close the <img> element
			oRm.write("</div>"); // close container

			if (oLightBox) {
				oRm.write("</span>");
			}
			oRm.write("</div>");

			// close wrapper

				oRm.write("</div>");

		},

		/**
		 * Changes the properties on the given control
		 *
		 * @param {sap.ui.fl.Change} oChangeWrapper - change object with instructions to be applied on the control
		 * @param {object} oControl - the control which has been determined by the selector id
		 * @param {object} mPropertyBag - map containing the control modifier object (either sap.ui.core.util.reflection.JsControlTreeModifier or
		 *                                sap.ui.core.util.reflection.XmlTreeModifier), the view object where the controls are embedded and the application component
		 * @private
		 */

		/**
		 * Renders a device frame image and the image itself in case the frame image exists
		 * @param {sap.ui.core.RenderManager} oRm - instance of the RenderManager
		 */
		_renderImages: function (oRm) {
			// Open the DOM element tag. The 'img' tag is used for mode sap.m.ImageMode.Image
			// and 'span' tag is used for sap.m.ImageMode.Background
			oRm.write(this.getMode() === ImageMode.Image ? "<img" : "<span");
			oRm.addClass("sc-frameimage__image");
			oRm.writeClasses();
		}
	});
});