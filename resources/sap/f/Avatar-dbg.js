/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.f.Avatar.
sap.ui.define([
    "./library",
    "sap/ui/core/Control",
    "sap/ui/core/IconPool",
    "./AvatarRenderer",
    "sap/ui/events/KeyCodes",
    "sap/base/Log"
], function(library, Control, IconPool, AvatarRenderer, KeyCodes, Log) {
	"use strict";

	// shortcut for sap.f.AvatarType
	var AvatarType = library.AvatarType;

	// shortcut for sap.f.AvatarImageFitType
	var AvatarImageFitType = library.AvatarImageFitType;

	// shortcut for sap.f.AvatarSize
	var AvatarSize = library.AvatarSize;

	// shortcut for sap.f.AvatarShape
	var AvatarShape = library.AvatarShape;

	/**
	 * Constructor for a new <code>Avatar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * An image-like control that has different display options for representing images, initials,
	 * and icons.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>Avatar</code> control allows the usage of different content, shapes, and sizes
	 * depending on the use case.
	 *
	 * The content types that can be displayed are either images, icons, or initials. The shape
	 * can be circular or square. There are several predefined sizes, as well as an option to
	 * set a custom size.
	 *
	 * <h3>Usage</h3>
	 *
	 * Up to two Latin letters can be displayed as initials in an <code>Avatar</code>. If there
	 * are more than two letters, or if there's a non-Latin character present, a default image
	 * placeholder will be created.
	 *
	 * There are two options for how the displayed image can fit inside the
	 * available area:
	 * <ul>
	 * <li>Cover - the image is scaled to cover all of the available area</li>
	 * <li>Contain - the image is scaled as large as possible while both
	 * its height and width fit inside the avalable area</li>
	 * </ul>
	 * <b>Note:</b> To set a custom size for the <code>Avatar</code>, you have to choose the <code>Custom</code>
	 * value for the <code>displaySize</code> property. Then, you have to set both the
	 * <code>customDisplaySize</code> and <code>customFontSize</code> properties.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.68.1
	 *
	 * @constructor
	 * @public
	 * @since 1.46
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/avatar/ Avatar}
	 * @alias sap.f.Avatar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Avatar = Control.extend("sap.f.Avatar", {
		metadata: {
			library: "sap.f",
			properties: {
				/**
				 * Determines the path to the desired image or icon.
				 */
				src: {type: "sap.ui.core.URI", group: "Data", defaultValue: null},
				/**
				 * Defines the displayed initials.
				 */
				initials: {type: "string", group: "Data", defaultValue: null},
				/**
				 * Defines the shape of the <code>Avatar</code>.
				 */
				displayShape: {type: "sap.f.AvatarShape", group: "Appearance", defaultValue: AvatarShape.Circle},
				/**
				 * Sets a predefined display size of the <code>Avatar</code>.
				 */
				displaySize: {type: "sap.f.AvatarSize", group: "Appearance", defaultValue: AvatarSize.S},
				/**
				 * Specifies custom display size of the <code>Avatar</code>.
				 *
				 *<b>Note:</b> It takes effect if the <code>displaySize</code> property is set to <code>Custom</code>.
				 */
				customDisplaySize: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "3rem"},
				/**
				 * Specifies custom font size of the <code>Avatar</code>.
				 *
				 *<b>Note:</b> It takes effect if the <code>displaySize</code> property is set to <code>Custom</code>.
				 */
				customFontSize: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "1.125rem"},
				/**
				 * Specifies how an image would fit in the <code>Avatar</code>.
				 */
				imageFitType: {type: "sap.f.AvatarImageFitType", group: "Appearance", defaultValue: AvatarImageFitType.Cover},
				/**
				 * Defines the fallback icon displayed in case of wrong image src and no initials set.
				 *
				 * <b>Notes:</b>
				 * <ul>
				 * <li>If not set, a default fallback icon is displayed depending on the set <code>displayShape</code> property.</li>
				 * <li>Accepted values are only icons from the SAP icon font.</li>
				 * </ul>
				 *
				 * @since 1.65
				 */
				fallbackIcon: {type: "string", group: "Data", defaultValue: null}
			},
			aggregations : {
				/**
				 * A <code>sap.m.LightBox</code> instance, that will be opened automatically when the user interacts with the <code>Avatar</code> control.
				 *
				 * The <code>press</code> event will still be fired.
				 * @since 1.48
				 * @public
				 */
				detailBox: {type: 'sap.m.LightBox', multiple: false, bindable: "bindable"}
			},
			associations : {
				/**
				 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
				 */
				ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"},

				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledBy).
				 */
				ariaLabelledBy: {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
			},
			events : {
				/**
				 * Fired when the user selects the control.
				 */
				press: {}
			},
			dnd: { draggable: true, droppable: false },
			designtime: "sap/f/designtime/Avatar.designtime"
		}
	});

	/**
	 * This is the URI for the default icon, when <code>displayShape</code> is <code>Circle</code>.
	 *
	 * @type {string}
	 */
	Avatar.DEFAULT_CIRCLE_PLACEHOLDER = "sap-icon://person-placeholder";

	/**
	 * This is the URI for the default icon, when <code>displayShape</code> is <code>Square</code>.
	 *
	 * @type {string}
	 */
	Avatar.DEFAULT_SQUARE_PLACEHOLDER = "sap-icon://product";

	Avatar.prototype.init = function () {
		// Property holding the actual display type of the avatar
		this._sActualType = null;
		// Property that determines if the created icon is going to be the default one
		this._bIsDefaultIcon = true;
		this._sImageFallbackType = null;
	};

	Avatar.prototype.exit = function () {
		if (this._icon) {
			this._icon.destroy();
		}
		if (this._fnLightBoxOpen) {
			this._fnLightBoxOpen = null;
		}
	};

	/**
	 * Sets the <code>detailBox</code> aggregation.
	 * @param {sap.m.LightBox|undefined} oLightBox - Instance of the <code>LightBox</code> control or undefined
	 * @returns {object} <code>this</code> for chaining
	 * @since 1.48
	 * @override
	 * @public
	 */
	Avatar.prototype.setDetailBox = function (oLightBox) {
		var oCurrentDetailBox = this.getDetailBox();

		if (oLightBox) {
			// In case someone try's to set the same LightBox twice we don't do anything
			if (oLightBox === oCurrentDetailBox) {
				return this;
			}

			// If we already have a LightBox detach old one's event
			if (oCurrentDetailBox) {
				this.detachPress(this._fnLightBoxOpen, oCurrentDetailBox);
			}

			// Bind the LightBox open method to the press event of the Avatar
			this._fnLightBoxOpen = oLightBox.open;
			this.attachPress(this._fnLightBoxOpen, oLightBox);
		} else if (this._fnLightBoxOpen) {
			// If there was a LightBox - cleanup
			this.detachPress(this._fnLightBoxOpen, oCurrentDetailBox);
			this._fnLightBoxOpen = null;
		}

		return this.setAggregation("detailBox", oLightBox);
	};

	/**
	 * @override
	 */
	Avatar.prototype.clone = function () {
		var oClone = Control.prototype.clone.apply(this, arguments),
			oCloneDetailBox = oClone.getDetailBox();

		// Handle press event if DetailBox is available
		if (oCloneDetailBox) {

			// Detach the old event
			oClone.detachPress(this._fnLightBoxOpen, this.getDetailBox());

			// Attach new event with the cloned detail box
			oClone._fnLightBoxOpen = oCloneDetailBox.open;
			oClone.attachPress(oClone._fnLightBoxOpen, oCloneDetailBox);

		}

		return oClone;
	};

	Avatar.prototype.attachPress = function() {
		Array.prototype.unshift.apply(arguments, ["press"]);
		Control.prototype.attachEvent.apply(this, arguments);

		if (this.hasListeners("press")) {
			this.$().attr("tabindex", "0");
			this.$().attr("role", "button");
		}

		return this;
	};

	Avatar.prototype.detachPress = function() {
		Array.prototype.unshift.apply(arguments, ["press"]);
		Control.prototype.detachEvent.apply(this, arguments);

		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex");
			this.$().attr("role", "img");
		}

		return this;
	};

	/**
	 * Called when the <code>Avatar</code> is selected.
	 *
	 * @private
	 */
	Avatar.prototype.ontap = function () {
		this.firePress({/* no parameters */});
	};

	/**
	 * Handles the key up event for SPACE and ENTER.
	 *
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	Avatar.prototype.onkeyup = function (oEvent) {
		if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER) {
			this.firePress({/* no parameters */});

			//stop the propagation, it is handled by the control
			oEvent.stopPropagation();
		}
	};

	/**
	 * Checks the validity of the <code>initials</code> parameter and returns <code>true</code> if the
	 * initials are correct.
	 *
	 * @param {string} sInitials The initials value
	 * @returns {boolean} The initials are valid or not
	 * @private
	 */
	Avatar.prototype._areInitialsValid = function (sInitials) {
		var validInitials = /^[a-zA-Z]{1,2}$/;
		if (!validInitials.test(sInitials)) {
			Log.warning("Initials should consist of only 1 or 2 latin letters", this);
			this._sActualType = AvatarType.Icon;
			this._bIsDefaultIcon = true;
			return false;
		}

		return true;
	};

	/**
	 * Validates the <code>src</code> parameter, and sets the actual type appropriately.
	 *
	 * @param {string} sSrc
	 * @returns {sap.f.Avatar}
	 * @private
	 */
	Avatar.prototype._validateSrc = function (sSrc) {
		if (IconPool.isIconURI(sSrc)) {
			this._sActualType = AvatarType.Icon;
			this._bIsDefaultIcon = false;
		} else {
			this._bIsDefaultIcon = true;
			this._sActualType = AvatarType.Image;

		// we perform this action in order to validate the image source and
		// take further actions depending on that
			this.preloadedImage = new window.Image();
			this.preloadedImage.src = sSrc;
			this.preloadedImage.onload = this._onImageLoad.bind(this);
			this.preloadedImage.onerror = this._onImageError.bind(this);
		}

		return this;
	};

	/**
	 * Validates the entered parameters, and returns what the actual display type parameter would be.
	 *
	 * @returns {sap.f.AvatarType}
	 * @private
	 */
	Avatar.prototype._getActualDisplayType = function () {
		var sSrc = this.getSrc(),
			sInitials = this.getInitials();

		if (sSrc) {
			this._validateSrc(sSrc);
		} else if (sInitials && this._areInitialsValid(sInitials)) {
			this._sActualType = AvatarType.Initials;
		} else {
			Log.warning("No src and initials were provided", this);
			this._sActualType = AvatarType.Icon;
			this._bIsDefaultIcon = true;
		}

		return this._sActualType;
	};

	/**
	 * Indicates what type of fallback we should show if there is invalid image source.
	 *
	 * @returns {sap.f.AvatarType}
	 * @private
	 */
	Avatar.prototype._getImageFallbackType = function () {
		var sInitials = this.getInitials();

		if (this._sActualType === AvatarType.Image) {
			this._sImageFallbackType = sInitials && this._areInitialsValid(sInitials) ?
			AvatarType.Initials : AvatarType.Icon;
		}

		return this._sImageFallbackType;
	};

	/**
	 * Returns the path for the default icon, based on the value of the <code>DisplayShape</code> property.
	 *
	 * @param {sap.f.AvatarShape} sDisplayShape
	 * @returns {string} the default icon
	 * @private
	 */
	Avatar.prototype._getDefaultIconPath = function (sDisplayShape) {
		var sDefaultIconPath = null,
			sFallbackIcon = this.getFallbackIcon();

		if (sFallbackIcon && IconPool.isIconURI(sFallbackIcon)) {
			sDefaultIconPath = sFallbackIcon;
		} else if (sDisplayShape === AvatarShape.Circle) {
			sDefaultIconPath = Avatar.DEFAULT_CIRCLE_PLACEHOLDER;
		} else if (sDisplayShape === AvatarShape.Square) {
			sDefaultIconPath = Avatar.DEFAULT_SQUARE_PLACEHOLDER;
		}

		return sDefaultIconPath;
	};

	/**
	 * Returns a control of type <code>Icon</code> and changes the <code>src</code> value if the
	 * <code>Icon</code> control was already created.
	 *
	 * @returns {sap.ui.core.Control}
	 * @private
	 */
	Avatar.prototype._getIcon = function () {
		var sSrc = this.getSrc(),
			sDisplayShape = this.getDisplayShape();

		if (this._bIsDefaultIcon) {
			sSrc = this._getDefaultIconPath(sDisplayShape);
		}

		if (!this._icon) {
			this._icon = IconPool.createControlByURI({
				alt: "Image placeholder",
				src: sSrc
			});
		} else if (this._icon.getSrc() !== sSrc) {
			this._icon.setSrc(sSrc);
		}

		return this._icon;
	};

	Avatar.prototype._getDefaultTooltip = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.f").getText("AVATAR_TOOLTIP");
	};


	/**
	 * We use this callback to make sure we hide fallback content if our original image source
	 * is loaded.
	 *
	 * @private
	 */
	Avatar.prototype._onImageLoad = function() {
		//we need to remove fallback content
		delete this.preloadedImage;
	};

	/**
	 * We use the negative callback to clean the useless property.
	 *
	 * @private
	 */
	 Avatar.prototype._onImageError = function() {
		 var sFallBackType = this._getImageFallbackType();

		 this.$().removeClass("sapFAvatarImage")
				.addClass("sapFAvatar" + sFallBackType);

		delete this.preloadedImage;
	};

	return Avatar;

});