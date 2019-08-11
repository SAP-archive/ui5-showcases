sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"showcaseslib/shared/data/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"showcaseslib/thirdparty/jsZipLibrary/jszip",
	"showcaseslib/thirdparty/jsZipLibrary/FileSaver",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/unified/FileUploader"
], function (Controller, formatter, JSONModel, MessageToast, jszip, FilesSaver, Button, ButtonType, HorizontalLayout, FileUploader) {
	"use strict";
	var oMainImage = new Image();
	const FIXED_WIDTH_SMALL = 500; //image uploads will be resized (CURRENT CONSTANTS JUST FOR TESTING!)
	return Controller.extend("showcaseslib.contributionPage.controller.Contribute", {
		formatter: formatter,
		onInit: function () {
			//Instantiate Wizard
			this._oWizard = this.byId("contributeWizard");
			this._oNavContainer = this.getView().byId("wizardNavContainer");

			//Instantiate Model with default data
			var oDefaultData = {
				"title": "Start filling in the form below...",
				"teaser": "",
				"author": "",
				"classification": "public",
				"description": "",
				"usage": "",
				"image": {"url": "resources/showcaseslib/shared/data/mainImage_default.png", "text": "", "device": "desktop"},
				"devices": ["desktop", "tablet", "phone"],
				"imageURL": [{"url": "", "text": "..."}, {"url": "", "text": "..."}, {"url": "", "text": "..."}],
				"website": []
			};
			var oModel = new JSONModel(oDefaultData);
			this.getView().setModel(oModel);

			// Add external UI5Lab Library ImageViewer
			sap.ui.getCore().loadLibrary("ui5lab.wl.img", "resources/showcaseslib/thirdparty/imageViewerLibrary/ui5lab/wl/img");

			// Create all Fileuploaders
			this.createFileUploader("mainImageUploader", "mainImageLayout");
			for (var i = 0; i <= 2; i++) {
				this.createFileUploader("additionalUploader_" + (i + 1), "addImages_Layout_" + (i + 1), i);
			}
			this.selectTitleText();
		},
		onAfterRendering: function () { // Select Title text
			this.selectTitleText();
		},
		selectTitleText: function () {
			this.byId("title_Input").focus();
			this.byId("title_Input").$().find("input").select();
		},
		createFileUploader: function (uploader_id, control_add_id, counter) {
			var oUploader = new FileUploader(this.getView().createId(uploader_id), {
				change: function (oEvent) {
					var oReader = new FileReader();

					oReader.onload = function (oEvent) {
						MessageToast.show("Checking file...");
						var bImageOnloaded = false; //Needed for image validation. If the onload function isn't called, the file was not a valid image.
						var oUploaderImage = new Image();
						oUploaderImage.src = oEvent.target.result;
						oUploaderImage.onload = function () {
							bImageOnloaded = true;
							if (uploader_id === "mainImageUploader") { // Main FileUploader
								oMainImage = oUploaderImage;
								var oImage = this.getView().getModel().getProperty("/image");
								oImage.url = oMainImage.src;
								this.getView().getModel().setProperty("/image", oImage);
								this._oWizard.validateStep(this.byId("imagesStep"));
							}
							else { // Additional Images FileUploader
								var aURLLinks = this.getView().getModel().getProperty("/imageURL");
								aURLLinks[counter].url = oUploaderImage.src;
								this.getView().getModel().setProperty("/imageURL", aURLLinks);
							}
							MessageToast.show("Upload successful!");
							if (uploader_id === "mainImageUploader" && (oUploaderImage.width < 1280 || oUploaderImage.height < 720)) { // Main Image Resolution Warning
								this.getView().byId("resolution_MessageStrip").setVisible(true);
							}
							else if (uploader_id === "mainImageUploader") { // If a better Resolution is uploaded, hide Messagestrip
								this.getView().byId("resolution_MessageStrip").setVisible(false);
							}
						}.bind(this);
						setTimeout(function () { // If after 2 seconds the onload function still hasn't been called, declare the file as invalid
							if (bImageOnloaded === false) {
								MessageToast.show("The uploaded file is either not an image or corrupted");
								if (uploader_id === "mainImageUploader") {
									this._oWizard.invalidateStep(this.byId("imagesStep"));
								}
							}
						}, 2000);
					}.bind(this);
					try {
						oReader.readAsDataURL(oEvent.getParameter("files")[0]);
					}
					catch (e) { //When the user closes the browser without choosing a file
					}
				}.bind(this)
			});
			// Add Fileuplaoder to View
			var oDeleteButton = new Button(uploader_id + "_deleteButton",
				{
					icon: "sap-icon://delete",
					type: ButtonType.Transparent,
					press: function () {
						if (uploader_id === "mainImageUploader") {
							this.getView().getModel().setProperty("/image/url", "");
							this.byId("mainImageUploader").setValue("");
							this._oWizard.invalidateStep(this.byId("imagesStep"));
							this.getView().byId("resolution_MessageStrip").setVisible(false);
						}
						else { // Swapping logic
							var newImageURL = this.getView().getModel().getProperty("/imageURL");
							if (counter + 1 === 2) {
								newImageURL[1].url = newImageURL[2].url;
								this.byId("additionalUploader_2").setValue(this.byId("additionalUploader_3").getValue());
							}
							if (counter + 1 === 1) {
								newImageURL[0].url = newImageURL[1].url;
								newImageURL[1].url = newImageURL[2].url;
								newImageURL[2].url = "";
								this.byId("additionalUploader_1").setValue(this.byId("additionalUploader_2").getValue());
								this.byId("additionalUploader_2").setValue(this.byId("additionalUploader_3").getValue());
							}
							// After everything is set and done, delete the last uploader (in the row) that is visible
							if (this.getView().byId("addImages_Layout_3").getVisible()) {
								this.getView().byId("addImages_Layout_3").setVisible(false);
							}
							else if (this.getView().byId("addImages_Layout_2").getVisible()) {
								this.getView().byId("addImages_Layout_2").setVisible(false);
							}
							else {
								this.getView().byId("addImages_Layout_1").setVisible(false);
							}
							newImageURL[2].url = "";
							this.byId("additionalUploader_3").setValue("");
							this.getView().byId("addImages_Layout_3").setVisible(false);

							this.getView().getModel().setProperty("/imageURL", newImageURL);
							this.getView().byId("plusImage_Button").setEnabled(true);
						}
					}.bind(this)
				});
			var oHorizontalBox = new HorizontalLayout({content: [oUploader, oDeleteButton]});
			this.getView().byId(control_add_id).addContent(oHorizontalBox);
		},
		_validateInput: function (oInput) { //Input validation
			var oBinding = oInput.getBinding("value");
			var sValueState = "None";
			var bInputError = false;
			try {
				oBinding.getType().validateValue(oInput.getValue());
			} catch (oException) {
				sValueState = "Error";
				bInputError = true;
			}

			oInput.setValueState(sValueState);

			return bInputError;
		},
		onClassificationSelected: function () {
			var oClassification = (this.getView().byId("RB_Public").getSelected() ? "public" : "internal");
			this.getView().getModel().setProperty("/classification", oClassification);
		},
		onCheckBoxSelected: function () {
			var newModelData = this.getView().getModel().getData();
			newModelData.devices = [];
			if (this.byId("supportedDevicesDesktop_Checkbox").getSelected()) { //Add Supported Devices
				newModelData.devices.push("desktop");
			}
			if (this.byId("supportedDevicesTablet_Checkbox").getSelected()) {
				newModelData.devices.push("tablet");
			}
			if (this.byId("supportedDevicesPhone_Checkbox").getSelected()) {
				newModelData.devices.push("phone");
			}
			this.getView().getModel().setData(newModelData);
		},
		onDeviceSelected: function () {
			var newModelData = this.getView().getModel().getData();
			newModelData.image.device = (this.byId("imageDevice_Desktop").getSelected() ? "desktop" : this.byId("imageDevice_Tablet").getSelected() ? "tablet" : "laptop");
			this.getView().getModel().setData(newModelData);
		},
		onChange: function (oEvent) { // onChange update valueState of input
			var oInput = oEvent.getSource();
			this._validateInput(oInput);
		},
		onChangeURL: function (oEvent) {
			var oInput = oEvent.getSource();
			this._validateInput(oInput);
			var urlRegex = new RegExp("^http[s]?:\\/\\/.*\\..+");
			if (urlRegex.exec(oInput.getValue()) === null) {
				oInput.setValueState("Error");
			}
		},
		resetValueState(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		onPressInfo: function (sValue) { //fragment redirection, currently not visible/needed
			sap.m.URLHelper.redirect(sValue, true);

		},
		insertFirstLink: function () { //Called when "Step 4" is pressed
			var aWebsite = this.getView().getModel().getProperty("/website");
			aWebsite.push({"url": "", "text": ""});
			this.getView().getModel().setProperty("/website", aWebsite);
		},
		onImagePlusClicked: function () { // Allow only max. 3 pictures!
			if (!this.byId("addImages_Layout_1").getVisible()) {
				this.getView().byId("addImages_Layout_1").setVisible(true);
			}
			else if (!this.byId("addImages_Layout_2").getVisible()) {
				this.getView().byId("addImages_Layout_2").setVisible(true);
			}
			else {
				this.getView().byId("addImages_Layout_3").setVisible(true);
				this.getView().byId("minusImage_Button").setEnabled(true);
			}
			if (this.byId("addImages_Layout_1").getVisible() && this.byId("addImages_Layout_2").getVisible() && this.byId("addImages_Layout_3").getVisible()) {
				this.getView().byId("plusImage_Button").setEnabled(false);
			}
		},
		onDeleteLink: function (oEvent) {
			var oContext = oEvent.getSource().getCustomData()[0].getBindingContext();
			var buttonIndex = oContext.getPath().split("/").pop();
			var aWebsites = this.getView().getModel().getProperty("/website");
			aWebsites.splice(buttonIndex, 1);
			this.getView().getModel().setProperty("/website", aWebsites);
			this.getView().byId("plus_Button").setEnabled(true);
		},
		onPlusClicked: function () {
			var oModel = this.getView().getModel();
			var aLinks = oModel.getProperty("/website");
			aLinks.push({
				url: "",
				text: "",
				type: ""
			});
			if (aLinks.length === 3) {
				this.getView().byId("plus_Button").setEnabled(false);
			}

			oModel.setProperty("/website", aLinks);
		},
		onExit: function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},
		showLinkPopover: function (oEvent) {
			// create popover
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("showcaseslib/contributionPage/view/Contribution_LinkInfo", this);
				this.getView().addDependent(this._oPopover);
			}

			this._oPopover.openBy(oEvent.getSource());
		},
		checkRequiredFields: function () { //Called when downloading. The user might have invalidated Inputs that had been validated before
			var oView = this.getView();
			if (this._validateInput(oView.byId("title_Input")) || this._validateInput(oView.byId("author_Input")) || this._validateInput(oView.byId("description_TextArea"))) {
				MessageToast.show("Please fill in all required fields");
				return false;
			}
			else if (oView.getModel().getProperty("/image").url === "") {
				MessageToast.show("Please upload a preview image");
				return false;
			}
			return true;
		},

		onDownload: function (oEvent) {
			if (this.checkRequiredFields()) {
				this.downloadZIP();
				this.getView().byId("thankYou_Text").setVisible(true);
			}
		},
		escapeToFilename: function (anyString) {// Filenames depend on the Showcase title. Escaping needs to be done here as otherwise invalid filenames are possible
			return anyString.replace(/[^a-z0-9]/gi, '_').toLowerCase();
		},
		generateJSON: function () {
			var oModelData = this.getView().getModel();
			// Generating a new model by hand, because some values have to be tweaked for the download (For example: The URLs shouldn't be DataURLs, but simple filenames).
			var genModel = new JSONModel();
			genModel = [];
			genModel.push({
				title: oModelData.getProperty("/title"),
				teaser: oModelData.getProperty("/teaser"),
				author: oModelData.getProperty("/author"),
				// classification: (this.byId("RB_Public").getSelected() ? "public" : "internal"),
				description: oModelData.getProperty("/description"),
				usage: oModelData.getProperty("/usage"),
				image: {
					url: this.escapeToFilename((oModelData.getProperty("/title"))) + "_mainImage.png",
					text: "...",
					device: (this.byId("imageDevice_Desktop").getSelected() ? "desktop" : this.byId("imageDevice_Tablet").getSelected() ? "tablet" : "laptop")
				},
				devices: oModelData.getProperty("/devices"),
				imageURL: [],
				website: oModelData.getProperty("/website")

			});
			var aImageURLs = oModelData.getProperty("/imageURL");
			for (var i = 0; i < aImageURLs.length; i++) {
				if (oModelData.getProperty("/imageURL")[i].url.length > 0) {
					genModel[0].imageURL.push({
						url: this.escapeToFilename(oModelData.getProperty("/title") + "_" + (i + 1)) + ".png",
						text: "..."
					});
				}
			}
			return genModel;
		},
		downloadZIP: function () {
			var zip = new JSZip();
			var largeFolder = zip.folder("large");
			var smallFolder = zip.folder("small");
			var title = this.escapeToFilename(this.getView().getModel().getData().title);
			// First add mainImage to zip file
			this.addImageToZip(largeFolder, (title + "_mainImage.png"), oMainImage, oMainImage.width, oMainImage.height);
			this.addImageToZip(smallFolder, (title + "_mainImage.png"), oMainImage, FIXED_WIDTH_SMALL, (FIXED_WIDTH_SMALL / oMainImage.width) * oMainImage.height);
			// Then add additional images to zip file
			var currentImage = new Image();
			var additionalImagesArray = this.getView().getModel().getData().imageURL;
			for (var i = 0; i < additionalImagesArray.length; i++) {
				currentImage.src = additionalImagesArray[i].url;
				if (additionalImagesArray[i].url !== "") {
					this.addImageToZip(largeFolder, (title + "_additionalImage_" + (i + 1) + ".png"), currentImage, currentImage.width, currentImage.height);
					this.addImageToZip(smallFolder, (title + "_additionalImage_" + (i + 1) + ".png"), currentImage, FIXED_WIDTH_SMALL, (FIXED_WIDTH_SMALL / oMainImage.width) * oMainImage.height)
				}
			}
			// Add JSON to ZIP file
			zip.file("myShowcase.json", JSON.stringify(this.generateJSON()[0]));
			zip.generateAsync({type: "blob"}).then(function (content) {
				saveAs(content, "Your_Showcase.zip");
			});
		},
		addImageToZip: function (zip, filename, image, x, y) {
			var dataURL = this.getResizedURL(image, x, y);
			var base64String = dataURL.replace("data:image/png;base64,", "");
			zip.file(filename, base64String, {base64: true});
		},
		getResizedURL: function (image, x, y) {
			// When the image is loaded, resize it in canvas
			var canvas = document.createElement("canvas"),
				ctx = canvas.getContext("2d");

			canvas.width = x;
			canvas.height = y;

			// Draw the image into canvas
			ctx.drawImage(image, 0, 0, x, y);

			var imgData = canvas.toDataURL({
				format: 'png',
				multiplier: 4
			});
			return imgData;
		},
		onPressPullRequestLink: function () {
			sap.m.URLHelper.redirect("https://github.com/SAP/ui5-showcases/blob/master/CONTRIBUTING.md", true);
		},
		additionalInfoValidation: function (oEvent) {
			// Validate Input
			this._validateInput(oEvent.getSource());
			// Wizard validation
			var title = this.byId("title_Input").getValue();
			var author = this.byId("author_Input").getValue();
			var description = this.byId("description_TextArea").getValue();
			if (author.length < 1 || author.length > 70 || description.length < 1 || description.length > 500 || title.length < 1 || title.length > 70) {
				this._oWizard.invalidateStep(this.byId("ShowcaseInfoStep"));
			} else {
				this._oWizard.validateStep(this.byId("ShowcaseInfoStep"));
			}
		},
		dataURLtoBlob: function (dataurl) {
			var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
				bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}
			return new Blob([u8arr], {type: mime});
		}
	});
});