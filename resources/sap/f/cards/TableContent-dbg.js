/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
		"sap/f/library",
		"sap/ui/base/ManagedObject",
		"sap/m/Table",
		"sap/f/cards/BaseContent",
		"sap/m/Column",
		"sap/m/ColumnListItem",
		"sap/m/Text",
		"sap/m/Link",
		"sap/m/ProgressIndicator",
		"sap/m/ObjectIdentifier",
		"sap/m/ObjectStatus",
		"sap/f/Avatar",
		"sap/f/cards/ActionEnablement",
		"sap/ui/core/VerticalAlign",
		"sap/m/ListSeparators",
		"sap/m/ListType",
		"sap/f/cards/BindingResolver"
	], function (
		library,
		ManagedObject,
		ResponsiveTable,
		BaseContent,
		Column,
		ColumnListItem,
		Text,
		Link,
		ProgressIndicator,
		ObjectIdentifier,
		ObjectStatus,
		Avatar,
		ActionEnablement,
		VerticalAlign,
		ListSeparators,
		ListType,
		BindingResolver
	) {
		"use strict";

		// shortcut for sap.f.AvatarSize
		var AvatarSize = library.AvatarSize;

		/**
		 * Constructor for a new <code>TableContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 *
		 * <h3>Overview</h3>
		 *
		 *
		 * <h3>Usage</h3>
		 *
		 * <h3>Responsive Behavior</h3>
		 *
		 * @extends sap.f.cards.BaseContent
		 *
		 * @author SAP SE
		 * @version 1.68.1
		 *
		 * @constructor
		 * @private
		 * @since 1.65
		 * @alias sap.f.cards.TableContent
		 */
		var TableContent = BaseContent.extend("sap.f.cards.TableContent", {
			renderer: {}
		});

		TableContent.prototype.exit = function () {
			BaseContent.prototype.exit.apply(this, arguments);

			if (this._oItemTemplate) {
				this._oItemTemplate.destroy();
				this._oItemTemplate = null;
			}
		};

		TableContent.prototype._getTable = function () {

			if (this._bIsBeingDestroyed) {
				return null;
			}

			var oTable = this.getAggregation("_content");

			if (!oTable) {
				oTable = new ResponsiveTable({
					id: this.getId() + "-Table",
					showSeparators: ListSeparators.None
				});
				this.setAggregation("_content", oTable);
			}

			return oTable;
		};

		/**
		 * Setter for configuring a <code>sap.f.cards.TableContent</code>.
		 *
		 * @public
		 * @param {Object} oConfiguration Configuration object used to create the internal table.
		 * @returns {sap.f.cards.TableContent} Pointer to the control instance to allow method chaining.
		 */
		TableContent.prototype.setConfiguration = function (oConfiguration) {
			BaseContent.prototype.setConfiguration.apply(this, arguments);

			if (!oConfiguration) {
				return this;
			}

			if (oConfiguration.rows && oConfiguration.columns) {
				this._setStaticColumns(oConfiguration.rows, oConfiguration.columns);
				return this;
			}

			if (oConfiguration.row && oConfiguration.row.columns) {
				this._setColumns(oConfiguration.row);
			}

			return this;
		};

		TableContent.prototype._setColumns = function (oRow) {
			var aCells = [],
				oTable = this._getTable(),
				aColumns = oRow.columns;

			aColumns.forEach(function (oColumn) {
				this._getTable().addColumn(new Column({
					header: new Text({ text: oColumn.title }),
					width: oColumn.width
				}));
				aCells.push(this._createCell(oColumn));
			}.bind(this));

			this._oItemTemplate = new ColumnListItem({
				cells: aCells,
				vAlign: VerticalAlign.Middle
			});

			this._attachActions(oRow, this._oItemTemplate);

			var oBindingInfo = {
				template: this._oItemTemplate
			};
			this._bindAggregation("items", oTable, oBindingInfo);
		};

		TableContent.prototype._setStaticColumns = function (aRows, aColumns) {
			var oTable = this._getTable();

			aColumns.forEach(function (oColumn) {
				oTable.addColumn(new Column({
					header: new Text({ text: oColumn.title }),
					width: oColumn.width
				}));
			});

			aRows.forEach(function (oRow) {
				var oItem = new ColumnListItem({
					vAlign: VerticalAlign.Middle
				});


				if (oRow.cells && Array.isArray(oRow.cells)) {
					for (var j = 0; j < oRow.cells.length; j++) {
						oItem.addCell(this._createCell(oRow.cells[j]));
					}
				}

				// TO DO: move this part to ActionEnablement
				if (oRow.actions && Array.isArray(oRow.actions)) {
					// for now allow only 1 action of type navigation
					var oAction = oRow.actions[0];

					if (oAction.type === ListType.Navigation) {
						oItem.setType(ListType.Navigation);
					}

					if (oAction.url) {
						oItem.attachPress(function () {
							window.open(oAction.url, oAction.target || "_blank");
						});
					}
				}
				oTable.addItem(oItem);
			}.bind(this));

			//workaround until actions refactor
			this.fireEvent("_actionContentReady");
		};

		/**
		 * Factory method that returns a control from the correct type for each column.
		 *
		 * @param {Object} oColumn Object with settings from the schema.
		 * @returns {sap.ui.core.Control} The control of the proper type.
		 * @private
		 */
		TableContent.prototype._createCell = function (oColumn) {

			if (oColumn.url) {
				return new Link({
					text: oColumn.value,
					href: oColumn.url,
					target: oColumn.target || "_blank"
				});
			}

			if (oColumn.identifier) {
				var oIdentifier = new ObjectIdentifier({
					title: oColumn.value
				});

				if (oColumn.identifier.url) {
					var oBindingInfo = ManagedObject.bindingParser(oColumn.identifier.url);

					if (oBindingInfo) {
						oBindingInfo.formatter = function (vValue) {
							if (typeof vValue === "string") {
								return true;
							}

							return false;
						};
						oIdentifier.bindProperty("titleActive", oBindingInfo);
					} else {
						oIdentifier.setTitleActive(!!oColumn.identifier.url);
					}

					// TO DO: move this part to ActionEnablement
					oIdentifier.attachTitlePress(function (oEvent) {

						var oSource = oEvent.getSource(),
							oBindingContext = oSource.getBindingContext(),
							oModel = oSource.getModel(),
							sPath,
							sUrl,
							sTarget;

						if (oBindingContext) {
							sPath = oBindingContext.getPath();
						}

						sUrl = BindingResolver.resolveValue(oColumn.identifier.url, oModel, sPath);
						sTarget = BindingResolver.resolveValue(oColumn.identifier.target, oModel, sPath);

						if (sUrl) {
							window.open(sUrl, sTarget || "_blank");
						}
					});
				}

				return oIdentifier;
			}

			if (oColumn.state) {
				return new ObjectStatus({
					text: oColumn.value,
					state: oColumn.state
				});
			}

			if (oColumn.value) {
				return new Text({
					text: oColumn.value
				});
			}

			if (oColumn.icon) {
				return new Avatar({
					src: oColumn.icon.src,
					displayShape: oColumn.icon.shape,
					displaySize: AvatarSize.XS
				});
			}

			if (oColumn.progressIndicator) {
				return new ProgressIndicator({
					percentValue: oColumn.progressIndicator.percent,
					displayValue: oColumn.progressIndicator.text,
					state: oColumn.progressIndicator.state
				});
			}
		};

		/**
		 * @overwrite
		 * @returns {sap.m.Table} The inner table.
		 */
		TableContent.prototype.getInnerList = function () {
			return this._getTable();
		};

		ActionEnablement.enrich(TableContent);

		return TableContent;
});
