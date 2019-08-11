sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"showcaseslib/shared/data/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(jQuery, Controller, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("showcaseslib.showcase.controller.App", {
		formatter: formatter,
		_iCarouselLoopTime: 4000, // loop to next picture after 4 seconds

		onInit: function () {

			var sPath = sap.ui.require.toUrl('showcaseslib') + '/shared/data/model/showcases.json';
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);

			this.getCarouselPresentation().addEventDelegate({
				"onAfterRendering": function() {
					this.setOnlyFirstImageOfEachShowcaseVisible();
				}.bind(this)
			});

			this.registerEvents();
		},

		registerEvents: function () {
			var oButtons = this.byId("flexboxButtons");
			var presentationPage = this.byId("presentationPage");

			presentationPage.addEventDelegate({"ontap": function (oEvent) {
			if(jQuery(oEvent.target).control()[0].getMetadata().getName() === "sap.m.Image") {
				this.onPressButtonTogglePresentation();
			}
			}.bind(this)});
			presentationPage.attachBrowserEvent("mouseenter", function () {
				oButtons.setVisible(true);
			}.bind(this));
			presentationPage.attachBrowserEvent("mouseleave", function () {
				oButtons.setVisible(false);
			}.bind(this));
			presentationPage.attachBrowserEvent("mousemove", function () {
				oButtons.setVisible(true);
				clearTimeout(this.timeoutHandlerMouseMove);
				this.timeoutHandlerMouseMove = setTimeout(function() {
					oButtons.setVisible(false);
				}.bind(this), 5000);
			}.bind(this));

			document.addEventListener('fullscreenchange', this.onExitFullScreen.bind(this));
			document.addEventListener('webkitfullscreenchange', this.onExitFullScreen.bind(this)); // Chrome, Safari and Opera
			document.addEventListener('mozfullscreenchange', this.onExitFullScreen.bind(this)); // Firefox
			document.addEventListener('MSFullscreenChange', this.onExitFullScreen.bind(this)); // IE/Edge
			document.addEventListener("keyup", this.onKeyUp.bind(this));
		},

		onExit: function () {
			this.onPressButtonResetPresentation();
		},

		onRouteMatched: function(sProjectId, bExternal) {
			var oCarouselPresentation = this.getCarouselPresentation();
			this._bExternal = bExternal === true;

			if(bExternal) {
				var oPagesBinding = oCarouselPresentation.getBinding("pages");
				var vFilterExternal = new Filter("classification", FilterOperator.EQ, "public");
				oPagesBinding.filter(vFilterExternal);
			}

			oCarouselPresentation.setActivePage(oCarouselPresentation.getPages()[sProjectId || 0]);
			this.setOnlyFirstImageOfEachShowcaseVisible();
			this.resetPositionsOfImages();
		},

		/**
		* on press space => toggle presentation
		*/
		onKeyUp: function(e) {
			var key = e.key || e.keyCode;
			if(key == " " || key == 32) {
				this.onPressButtonTogglePresentation();
			}
		},

		onPressButtonEndFullScreen: function() {
			// leave fullscreen mode
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
				document.webkitExitFullscreen();
			} else if (document.mozCancelFullScreen) { /* Firefox */
				document.mozCancelFullScreen();
			} else if (document.msExitFullscreen) { /* IE/Edge */
				document.msExitFullscreen();
			}

			this.onPressButtonResetPresentation();
			var projectId = this.getActivePageId();
			this.getOwnerComponent().fireNavigateToOverview({
				navTarget : projectId
			});
		},

		onPressButtonTogglePresentation: function() {
			if(this.bIsPresenting) {
				this.endPresentation();
			} else {
				this.startPresentation();
			}
		},

		onPressButtonResetPresentation: function() {
			this.byId("buttonToggle").setIcon("sap-icon://play");
			this.endPresentationAndAnimations();
			this.setOnlyFirstImageOfEachShowcaseVisible();
			this.resetPositionsOfImages();
			this.bIsPresenting = false;
		},

		endPresentation: function() {
			this.byId("buttonToggle").setIcon("sap-icon://play");
			this.endPresentationAndAnimations();
			this.resetPositionsOfImages();
			this.bIsPresenting = false;
		},

		onExitFullScreen: function() {
			if (!(document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement	)) {
				this.onPressButtonEndFullScreen();
			}
		},

		/**
		 * Refresh browser url to current project id
		 */
		onPageChanged: function() {
			var projectId = this.getActivePageId();
			this.getOwnerComponent().fireNavigateToPresentation({
			navTarget : projectId
			});
			if(this.bIsPresenting) {
			this.startPresentation();
			}
		},

		/**
		* resets images to starting positions and starts the presentation of the current show
		*/
		startPresentation: function() {

			this.byId("buttonToggle").setIcon("sap-icon://pause");
			this.resetPositionsOfImages();
			this.setOnlyFirstImageOfEachShowcaseVisible();
			this.bIsPresenting = true;

			//get objects
			var oCarouselPresentation = this.getCarouselPresentation();
			var iPageId = this.getActivePageId();
			var aImages = oCarouselPresentation.getPages()[iPageId].getItems()[0].getItems();

			//start animations
			aImages[0].$().context.style.display = "inline-block";
			this.startImageAnimation(iPageId, 0);

		},

		/**
		 * preloads an image for smoother animations
		 * @param {string} sURL the URL of the image to be loaded
		 * @param {function} fnSuccess called when the image is loaded
		 * @param {function} fnError called when the image could not be loaded
		 */
		loadImage: function (sURL, fnSuccess, fnError) {
			jQuery("<img />")
				.load(fnSuccess)
				.error(fnError)
				.attr("src", sURL);
		},

		/**
		 * loads the image and animates it relative to its own height
		 * @param {Array} aImages holds all images of the current showcase
		 * @param {Integer} iIndex id of the current image (going to be animated)
		 * @param {function} fnCallback is executed after the animation ended
		 */
		animateImage: function (aImages, iIndex, fnCallback) {
			var $img = aImages[iIndex].$(),
				sURL = aImages[iIndex].getSrc();

			this.loadImage(sURL, function(oEvent) {
				// calculate how far the image should be animated
				var sAnimationPosition = Math.min(100, Math.round(window.innerHeight / (window.innerWidth / oEvent.target.width * oEvent.target.height) * 100)) + "%";

				//calculate whether the image is from a mobile device or from a desktop
				if(oEvent.target.width / oEvent.target.height > 1) {
					$img.animate({
						'background-position-y': sAnimationPosition,
						'background-size': '120%'
					}, this._iCarouselLoopTime, 'swing', function () {
					fnCallback()
					});
				} else {
					$img.animate({
						'background-position-y': sAnimationPosition,
						'background-size': '100%'
					}, this._iCarouselLoopTime, 'swing', function () {
					fnCallback()
					});
				}
			}.bind(this), fnCallback.bind(this));
		},

		/**
		* animates the current image, fads in the next one and at the ending restart it self for the next image or goes to the next showcase
		* @param {Integer} iOriginalPageId id of the original page to detect if the user navigated away meanwhile
		* @param {Integer} iImageId id of the current image
		*/
		startImageAnimation: function (iOriginalPageId, iImageId) {
			//get objects
			var oCarouselPresentation = this.getCarouselPresentation();
			var iPageId = this.getActivePageId();
			var aImages = oCarouselPresentation.getPages()[iPageId].getItems()[0].getItems();

			// only do this if the presentation is still on and hasn't been stopped
			if(this.bIsPresenting && iPageId === iOriginalPageId) {
				// zoom in to the show image
				var iCurrentIndex = iImageId;
				var $currentImg = aImages[iCurrentIndex].$();
				this.animateImage(aImages, iCurrentIndex, function () {
					// again: only do this if the presentation is still on and hasn't been stopped
					if(this.bIsPresenting && iPageId === iOriginalPageId) {
						// fade next image in
						var iNextIndex = iImageId + 1;
						if(iNextIndex < aImages.length) {
						var $nextImg = aImages[iNextIndex].$();
						$nextImg.fadeIn(this._iCarouselLoopTime / 2, function () {
							//set the previous image back to its origin position
							this.resetImagePosition(aImages[iCurrentIndex]);
							// again: only do this if the presentation is still on and hasn't been stopped
							if(this.bIsPresenting && iPageId === iOriginalPageId) {
								// start animation for next image
								this.startImageAnimation(iOriginalPageId, iNextIndex);
							}
						}.bind(this));
						// parallel to the fade in, fade the old image out
						$currentImg.fadeOut({
							duration: this._iCarouselLoopTime,
							queue: false
						})
						} else {
						// goto next showcase
						oCarouselPresentation.next();
						}
					}
				}.bind(this));
			}
		},

		/**
		* resets all images to their starting position
		*/
		resetPositionsOfImages: function () {
			var oPresCar = this.getCarouselPresentation();
			var aProjects = oPresCar.getPages();
			for(var i = 0; i < aProjects.length; i++) {
				var aImages = aProjects[i].getItems()[0].getItems();
				for(var j = 0; j < aImages.length; j++) {
					this.resetImagePosition(aImages[j]);
				}
			}
		},

		/**
		* resets an image to its starting position
		* @param {Object} oImage is the image which will be resetted
		*/
		resetImagePosition: function(oImage) {
			oImage.setBackgroundPosition("center 0%");
			oImage.$().context.style['background-position-y'] = "0%";
			oImage.$().context.style.opacity = "1";

			//calculate wheter the image is from a mobile device or from a desktop
			this.loadImage(oImage.getSrc(), function(oEvent) {
				if(oEvent.target.width / oEvent.target.height > 1) {
					oImage.setBackgroundSize("100%");
					oImage.$().context.style['background-size'] = "100%";
				} else {
					oImage.setBackgroundSize("66%");
					oImage.$().context.style['background-size'] = "66%";
				}
			}.bind(this));
		},

		setOnlyFirstImageOfEachShowcaseVisible: function() {
			//set focus on carousel => enable arrow keys to navigate
			var oPresCar = this.getCarouselPresentation();
			setTimeout(function () {
				oPresCar.focus();
			}, 0);

			var aProjects = oPresCar.getPages();
			for(var i = 0; i < aProjects.length; i++) {
				var oImages = aProjects[i].getItems()[0].getItems();
				for(var j = 0; j < oImages.length; j++) {
					oImages[j].$().context.style.display = "none";
				}
				oImages[0].$().context.style.display = "inline-block";
			}
		},

		/**
		* goes through all images to make sure that no animation is running anymore
		*/
		endPresentationAndAnimations: function () {
			this.bIsPresenting = false;
			var oPresCar = this.getCarouselPresentation();
			var aProjects = oPresCar.getPages();
			for(var i = 0; i < aProjects.length; i++) {
				var oImages = aProjects[i].getItems()[0].getItems();
				this.resetImagePosition(oImages[0]);
				for(var j = 0; j < oImages.length; j++) {
					oImages[j].$().stop();
				}
			}
		},

		getActivePageId: function() {
			var aPageId = this.getCarouselPresentation().getActivePage().split("-");
			var iPageId = aPageId[aPageId.length - 1];
			return parseInt(iPageId, 10);
		},

		getCarouselPresentation: function () {
			if(this.oCarouselPresentation) {
				return this.oCarouselPresentation;
			} else {
				this.oCarouselPresentation = this.getView().byId("carouselPresentation");
				return this.oCarouselPresentation;
			}
		}

	});
});
