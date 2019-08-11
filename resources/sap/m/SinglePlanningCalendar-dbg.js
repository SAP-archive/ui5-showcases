/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.m.SinglePlanningCalendar.
sap.ui.define([
	'./library',
	'./PlanningCalendarHeader',
	'./SegmentedButtonItem',
	"./SinglePlanningCalendarWeekView",
	'./SinglePlanningCalendarGrid',
	'./SinglePlanningCalendarRenderer',
	'sap/base/Log',
	'sap/ui/core/Control',
	'sap/ui/core/Locale',
	'sap/ui/core/LocaleData',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/format/DateFormat',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/DateRange',
	'sap/ui/base/ManagedObjectObserver'
],
function(
	library,
	PlanningCalendarHeader,
	SegmentedButtonItem,
	SinglePlanningCalendarWeekView,
	SinglePlanningCalendarGrid,
	SinglePlanningCalendarRenderer,
	Log,
	Control,
	Locale,
	LocaleData,
	InvisibleText,
	ResizeHandler,
	UniversalDate,
	DateFormat,
	CalendarDate,
	CalendarUtils,
	DateRange,
	ManagedObjectObserver
) {
	"use strict";

	var PlanningCalendarStickyMode = library.PlanningCalendarStickyMode;
	var HEADER_RESIZE_HANDLER_ID = "_sHeaderResizeHandlerId";
	var MAX_NUMBER_OF_VIEWS_IN_SEGMENTED_BUTTON = 4;

	/**
	 * Constructor for a new <code>SinglePlanningCalendar</code>.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * Displays a calendar of a single entity (such as person, resource) for the selected time interval.
	 *
	 * <b>Note:</b> The <code>SinglePlanningCalendar</code> uses parts of the <code>sap.ui.unified</code> library.
	 * This library will be loaded after the <code>SinglePlanningCalendar</code>, if it wasn't previously loaded.
	 * This could lead to a waiting time when a <code>SinglePlanningCalendar</code> is used for the first time.
	 * To prevent this, apps using the <code>SinglePlanningCalendar</code> must also load the
	 * <code>sap.ui.unified</code> library.
	 *
	 * <b>Disclaimer</b>: This control is in a beta state - incompatible API changes may be done before its official public
	 * release. Use at your own discretion.
	 *
	 * <h3>Usage</h3>
	 *
	 * The <code>SinglePlanningCalendar</code> has the following structure:
	 *
	 * <ul>
	 *     <li>A <code>PlanningCalendarHeader</code> at the top. It contains the <code>title</code> set from the
	 *     corresponding property, the <code>SegmentedButton</code>, which facilitates navigation through the views,
	 *     controls, passed to the <code>actions</code> aggregation and the navigation, assisting the user in
	 *     choosing the desired time period. The views, either custom or not, can be configured and passed through the
	 *     <code>views</code> aggregation.
	 *
	 *     To create custom views, extend the <code>SinglePlanningCalendarView</code> basic view class. It defines three
	 *     methods that should be overwritten: <code>getEntityCount</code>, <code>getScrollEntityCount</code> and
	 *     <code>calculateStartDate</code>
	 *     <ul>
	 *         <li><code>getEntityCount</code> - returns number of columns to be displayed</li>
	 *         <li><code>getScrollEntityCount</code> - used when next and previous arrows in the calendar are used.
	 *         For example, in work week view, the <code>getEntityCount</code> returns 5 (5 columns from Monday to
	 *         Friday), but when next arrow is selected, the control navigates 7 days ahead and
	 *         <code>getScrollEntityCount</code> returns 7.</li>
	 *         <li><code>calculateStartDate</code> - calculates the first day displayed in the calendar based on the
	 *         <code>startDate</code> property of the <code>SinglePlanningCalendar</code>. For example, it returns the
	 *         first date of a month or a week to display the first 10 days of the month.</li>
	 *     </ul>
	 *
	 *     <li>A <code>SinglePlanningCalendarGrid</code>, which displays the appointments, set to the visual time range.
	 *     An all-day appointment is an appointment which starts at 00:00 and ends in 00:00 on any day in the future.
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.68.1
	 *
	 * @constructor
	 * @public
	 * @since 1.61
	 * @alias sap.m.SinglePlanningCalendar
	 */

	var SinglePlanningCalendar = Control.extend("sap.m.SinglePlanningCalendar", /** @lends sap.m.SinglePlanningCalendar.prototype */ { metadata : {

		library : "sap.m",

		properties : {

			/**
			 * Determines the title of the <code>SinglePlanningCalendar</code>.
			 */
			title: { type : "string", group : "Appearance", defaultValue : "" },

			/**
			 * Determines the start date of the grid, as a JavaScript date object. It is considered as a local date.
			 * The time part will be ignored. The current date is used as default.
			 */
			startDate: { type : "object", group : "Data" },

			/**
			 * Determines which part of the control will remain fixed at the top of the page during vertical scrolling
			 * as long as the control is in the viewport.
			 *
			 * <b>Note:</b> Limited browser support. Browsers which do not support this feature:
			 * <ul>
			 * 	<li>Microsoft Internet Explorer</li>
			 * 	<li>Microsoft Edge lower than version 41 (EdgeHTML 16)</li>
			 * 	<li>Mozilla Firefox lower than version 59</li>
			 * </ul>
			 *
			 * @since 1.62
			 */
			stickyMode: {type: "sap.m.PlanningCalendarStickyMode", group: "Behavior", defaultValue: PlanningCalendarStickyMode.None},

			/**
			 * Determines whether the appointments in the grid are draggable.
			 *
			 * The drag and drop interaction is visualized by a placeholder highlighting the area where the
			 * appointment can be dropped by the user.
			 *
			 * @since 1.64
			 */
			enableAppointmentsDragAndDrop: { type: "boolean", group: "Misc", defaultValue: false },

			/**
			 * Determines whether the appointments are resizable.
			 *
			 * The resize interaction is visualized by making the appointment transparent.
			 *
			 * The appointment snaps on every interval
			 * of 30 minutes. After the resize is finished, the {@link #event:appointmentResize appointmentResize} event is fired, containing
			 * the new start and end JavaScript date objects.
			 *
			 * @since 1.65
			 */
			enableAppointmentsResize: { type: "boolean", group: "Misc", defaultValue: false },

			/**
			 * Determines whether the appointments can be created by dragging on empty cells.
			 *
			 * See {@link #property:enableAppointmentsResize enableAppointmentsResize} for the specific points for events snapping
			 *
			 * @since 1.65
			 */
			enableAppointmentsCreate: { type: "boolean", group: "Misc", defaultValue: false }
		},

		aggregations : {

			/**
			 * The controls to be passed to the toolbar.
			 */
			actions : {
				type : "sap.ui.core.Control",
				multiple: true,
				singularName: "action",
				forwarding: {
					getter: "_getHeader",
					aggregation: "actions"
				}
			},

			/**
			 * The appointments to be displayed in the grid. Appointments outside the visible time frame are not rendered.
			 * Appointments, longer than a day, will be displayed in all of the affected days.
			 * To display an all-day appointment, the appointment must start at 00:00 and end on any day in the future in 00:00h.
			 */
			appointments : {
				type: "sap.ui.unified.CalendarAppointment",
				multiple: true,
				singularName: "appointment",
				forwarding: {
					getter: "_getGrid",
					aggregation: "appointments"
				}
			},

			/**
			 * Views of the <code>SinglePlanningCalendar</code>.
			 *
			 * <b>Note:</b> If not set, the Week view is available.
			 */
			views : {type : "sap.m.SinglePlanningCalendarView", multiple : true, singularName : "view"},

			/**
			 * Special days in the header visualized as a date range with type.
			 *
			 * <b>Note:</b> If one day is assigned to more than one type, only the first type is used.
			 * @since 1.66
			 */
			specialDates : {type : "sap.ui.unified.DateTypeRange",
							multiple : true,
							singularName : "specialDate",
							forwarding: {
								getter: "_getGrid",
								aggregation: "specialDates"
							}
			},

			/**
			 * Hidden, for internal use only.
			 * The header part of the <code>SinglePlanningCalendar</code>.
			 *
			 * @private
			 */
			_header : { type : "sap.m.PlanningCalendarHeader", multiple : false, visibility : "hidden" },

			/**
			 * Hidden, for internal use only.
			 * The gid part of the <code>SinglePlanningCalendar</code>.
			 *
			 * @private
			 */
			_grid : { type : "sap.m.SinglePlanningCalendarGrid", multiple : false, visibility : "hidden" }

		},

		associations: {

			/**
			 * Corresponds to the currently selected view.
			 */
			selectedView: { type: "sap.m.SinglePlanningCalendarView", multiple: false },

			/**
			 * Association to the <code>PlanningCalendarLegend</code> explaining the colors of the <code>Appointments</code>.
			 *
			 * <b>Note:</b> The legend does not have to be rendered but must exist and all required types must be assigned.
			 * @since 1.65.0
			 */
			legend: { type: "sap.m.PlanningCalendarLegend", multiple: false}

		},

		events: {

			/**
			 * Fired when the selected state of an appointment is changed.
			 */
			appointmentSelect: {
				parameters: {

					/**
					 * The appointment on which the event was triggered.
					 */
					appointment: {type: "sap.ui.unified.CalendarAppointment"},
					/**
					 * All appointments with changed selected state.
					 * @since 1.67.0
					 */
					appointments : {type : "sap.ui.unified.CalendarAppointment[]"}

				}
			},

			/**
			 * Fired if an appointment is dropped.
			 * @since 1.64
			 */
			appointmentDrop : {
				parameters : {
					/**
					 * The dropped appointment.
					 */
					appointment : {type : "sap.ui.unified.CalendarAppointment"},

					/**
					 * Start date of the dropped appointment, as a JavaScript date object.
					 */
					startDate : {type : "object"},

					/**
					 * Dropped appointment end date as a JavaScript date object.
					 */
					endDate : {type : "object"},

					/**
					 * The drop type. If true - it's "Copy", if false - it's "Move".
					 */
					copy : {type : "boolean"}
				}
			},

			/**
			 * Fired when an appointment is resized.
			 * @since 1.65
			 */
			appointmentResize: {
				parameters: {
					/**
					 * The resized appointment.
					 */
					appointment: { type: "sap.ui.unified.CalendarAppointment" },

					/**
					 * Start date of the resized appointment, as a JavaScript date object.
					 */
					startDate: { type: "object" },

					/**
					 * End date of the resized appointment, as a JavaScript date object.
					 */
					endDate: { type: "object" }
				}
			},

			/**
			 * Fired if an appointment is created.
			 * @since 1.65
			 */
			appointmentCreate: {
				parameters: {
					/**
					 * Start date of the created appointment, as a JavaScript date object.
					 */
					startDate: {type: "object"},

					/**
					 * End date of the created appointment, as a JavaScript date object.
					 */
					endDate: {type: "object"}
				}
			},

			/**
			 * Fired if a date is selected in the calendar header.
			 */
			headerDateSelect: {
				parameters: {

					/**
					 * Date of the selected header, as a JavaScript date object. It is considered as a local date.
					 */
					date: {type: "object"}

				}
			},

			/**
			 * <code>startDate</code> is changed while navigating in the <code>SinglePlanningCalendar</code>.
			 */
			startDateChange: {
				parameters: {

					/**
					 * The new start date, as a JavaScript date object. It is considered as a local date.
					 */
					date: {type: "object"}

				}
			},

			/**
			 * Fired when a grid cell is focused.
			 * @since 1.65
			 */
			cellPress: {
				parameters: {
					/**
					 * The start date as a JavaScript date object of the focused grid cell.
					 */
					startDate: {type: "object"},
					/**
					 * The end date as a JavaScript date object of the focused grid cell.
					 */
					endDate: {type: "object"}
				}
			}
		}

	}});

	SinglePlanningCalendar.prototype.init = function() {
		var sOPCId = this.getId();

		this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oDefaultView = new SinglePlanningCalendarWeekView({
			key: "DEFAULT_INNER_WEEK_VIEW_CREATED_FROM_CONTROL",
			title: ""
		});
		this.setAssociation("selectedView", this._oDefaultView);

		this.setAggregation("_header", this._createHeader());
		this.setAggregation("_grid", new SinglePlanningCalendarGrid(sOPCId + "-Grid"));

		this._attachHeaderEvents();
		this._attachGridEvents();
		this._attachDelegates();
		this.setStartDate(new Date());
	};

	/**
	 * Called before rendering starts.
	 *
	 * @private
	 */
	SinglePlanningCalendar.prototype.onBeforeRendering = function () {
		// We can apply/remove sticky classes even before the control is rendered.
		this._toggleStickyClasses();
	};

	/**
	 * Called when rendering is completed.
	 *
	 * @private
	 */
	SinglePlanningCalendar.prototype.onAfterRendering = function () {
		var oHeader = this._getHeader();

		// Adjusting is done after rendering, because otherwise we won't have
		// info about how much offset is actually needed.
		this._adjustColumnHeadersTopOffset();

		// Indicate if the actions toolbar is hidden
		this.toggleStyleClass("sapMSinglePCActionsHidden", !oHeader._getActionsToolbar().getVisible());

		this._registerResizeHandler(HEADER_RESIZE_HANDLER_ID, oHeader, this._onHeaderResize.bind(this));
	};

	SinglePlanningCalendar.prototype.exit = function () {
		if (this._oDefaultView) {
			this._oDefaultView.destroy();
			this._oDefaultView = null;
		}

		if (this._afterRenderFocusCell) {
			this.removeDelegate(this._afterRenderFocusCell);
			this._afterRenderFocusCell = null;
		}

		this._deRegisterResizeHandler(HEADER_RESIZE_HANDLER_ID);
	};

	/**
	 * Called when the navigation toolbar changes its width or height.
	 *
	 * @param oEvent The resize event
	 * @returns {sap.m.SinglePlanningCalendar} <code>this</code> for chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._onHeaderResize = function (oEvent) {
		if (oEvent.oldSize.height === oEvent.size.height) {
			// We need only height changes
			return this;
		}

		// If resizing happened due to the actions toolbar changing its visibility,
		// then update the corresponding class
		this.toggleStyleClass("sapMSinglePCActionsHidden", !this._getHeader()._getActionsToolbar().getVisible());

		// There are 3 reasons why the header's height might have changed and we need to adjust
		// columnHeaders' offset for each of them.
		// - Actions toolbar showed up: columnHeaders need to go lower
		// - Actions toolbar got hidden: columnHeaders need to go higher
		// - Screen width became too small and some of the navigation toolbar's content went
		//   on a second line: second line: columnHeaders need to go lower
		this._adjustColumnHeadersTopOffset();

		return this;
	};

	SinglePlanningCalendar.prototype.setTitle = function (sTitle) {
		this._getHeader().setTitle(sTitle);

		return this.setProperty("title", sTitle, true);
	};

	SinglePlanningCalendar.prototype.setStartDate = function (oDate) {
		this.setProperty("startDate", oDate, true /*Suppressing because _alignColumns will do the rendering.*/ );
		this._alignColumns();

		return this;
	};

	SinglePlanningCalendar.prototype.setEnableAppointmentsDragAndDrop = function (bEnabled) {
		this._getGrid().setEnableAppointmentsDragAndDrop(bEnabled);

		return this.setProperty("enableAppointmentsDragAndDrop", bEnabled, true);
	};

	SinglePlanningCalendar.prototype.setEnableAppointmentsResize = function(bEnabled) {
		this._getGrid().setEnableAppointmentsResize(bEnabled);

		return this.setProperty("enableAppointmentsResize", bEnabled, true);
	};

	SinglePlanningCalendar.prototype.setEnableAppointmentsCreate = function(bEnabled) {
		this._getGrid().setEnableAppointmentsCreate(bEnabled);

		return this.setProperty("enableAppointmentsCreate", bEnabled, true);
	};

	/**
	 * Applies or removes sticky classes based on <code>stickyMode</code>'s value.
	 *
	 * @returns {sap.m.SinglePlanningCalendar} <code>this</code> for chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._toggleStickyClasses = function () {
		var sStickyMode = this.getStickyMode();

		this.toggleStyleClass("sapMSinglePCStickyAll", sStickyMode === PlanningCalendarStickyMode.All);
		this.toggleStyleClass("sapMSinglePCStickyNavBarAndColHeaders", sStickyMode === PlanningCalendarStickyMode.NavBarAndColHeaders);

		return this;
	};

	/**
	 * Makes sure that the column headers are offset in such a way, that they are positioned right
	 * after the navigation toolbar.
	 *
	 * @returns {sap.m.SinglePlanningCalendar} <code>this</code> for chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._adjustColumnHeadersTopOffset = function () {
		var sStickyMode = this.getStickyMode(),
			oGrid = this._getGrid(),
			oColumnHeaders = oGrid && oGrid._getColumnHeaders(),
			iTop;

		// Make sure that the columnHeaders are rendered
		if (!oColumnHeaders || !oColumnHeaders.getDomRef()) {
			return this;
		}

		switch (sStickyMode) {
			case PlanningCalendarStickyMode.All:
				// Since the whole header will be visible, columnHeaders should be offset by its whole height.
				iTop = this._getHeader().$().outerHeight();
				break;
			case PlanningCalendarStickyMode.NavBarAndColHeaders:
				// Since the action toolbar will be hidden, columnHeaders should be
				iTop = this._getHeader()._getNavigationToolbar().$().outerHeight();
				break;
			default:
				// Reset to default, if not in sticky mode
				iTop = "auto";
				break;
		}

		oColumnHeaders.$().css("top", iTop);
		oColumnHeaders._setTopPosition(iTop);

		return this;
	};

	SinglePlanningCalendar.prototype.addView = function (oView) {
		var oViewsButton,
			oHeader = this._getHeader();

		if (!oView) {
			return this;
		}

		if (this._isViewKeyExisting(oView.getKey())) {
			Log.error("There is an existing view with the same key.", this);
			return this;
		}

		this.addAggregation("views", oView);

		oViewsButton = oHeader._getOrCreateViewSwitch();
		oViewsButton.addItem(new SegmentedButtonItem({
			key: oView.getKey(),
			text: oView.getTitle()
		}));
		if (this._getSelectedView().getKey() === this._oDefaultView.getKey()) {
			this.setAssociation("selectedView", oView);
		}
		this._alignView();
		if (this.getViews().length > MAX_NUMBER_OF_VIEWS_IN_SEGMENTED_BUTTON) {
			oHeader._convertViewSwitchToSelect();
		}

		return this;
	};

	SinglePlanningCalendar.prototype.insertView = function (oView, iPos) {
		var oViewsButton,
			oHeader = this._getHeader();

		if (!oView) {
			return this;
		}

		if (this._isViewKeyExisting(oView.getKey())) {
			Log.error("There is an existing view with the same key.", this);
			return this;
		}

		this.insertAggregation("views", oView, iPos);

		oViewsButton = oHeader._getOrCreateViewSwitch();
		oViewsButton.insertItem(new SegmentedButtonItem({
			key: oView.getKey(),
			text: oView.getTitle()
		}), iPos);
		if (this._getSelectedView().getKey() === this._oDefaultView.getKey()) {
			this.setAssociation("selectedView", oView);
		}
		this._alignView();
		if (this.getViews().length > MAX_NUMBER_OF_VIEWS_IN_SEGMENTED_BUTTON) {
			oHeader._convertViewSwitchToSelect();
		}

		return this;
	};

	SinglePlanningCalendar.prototype.removeView = function (oView) {

		if (!oView) {
			return this;
		}

		var oHeader = this._getHeader(),
			oViewsButton = oHeader._getOrCreateViewSwitch(),
			oViewsButtonItems = oViewsButton.getItems(),
			oCurrentlySelectedView = this._getSelectedView(),
			oViewToRemoveKey = oView.getKey(),
			oCurrentItem,
			i;

		for (i = 0; i < oViewsButtonItems.length; i++) {
			oCurrentItem = oViewsButtonItems[i];
			if (oCurrentItem.getKey() === oViewToRemoveKey) {
				oViewsButton.removeItem(oCurrentItem);
				break;
			}
		}

		this.removeAggregation("views", oView);

		// if the removed view is the selected one, either set the first view as selected
		// or if all views are removed point to the _oDefaultView
		if (oViewToRemoveKey === oCurrentlySelectedView.getKey()) {
			this.setAssociation("selectedView", this.getViews()[0] || this._oDefaultView);
		}

		this._alignView();
		if (this.getViews().length <= MAX_NUMBER_OF_VIEWS_IN_SEGMENTED_BUTTON) {
			oHeader._convertViewSwitchToSegmentedButton();
		}

		return this;
	};

	SinglePlanningCalendar.prototype.removeAllViews = function () {
		var oViewsButton = this._getHeader()._getOrCreateViewSwitch();

		oViewsButton.removeAllItems();
		this.setAssociation("selectedView", this._oDefaultView);
		this._alignView();

		return this.removeAllAggregation("views");
	};

	SinglePlanningCalendar.prototype.destroyViews = function () {
		var oViewsButton = this._getHeader()._getOrCreateViewSwitch();

		oViewsButton.destroyItems();
		this.setAssociation("selectedView", this._oDefaultView);
		this._alignView();

		return this.destroyAggregation("views");
	};

	/**
	 * Holds the selected appointments. If no appointments are selected, an empty array is returned.
	 *
	 * @returns {sap.ui.unified.CalendarAppointment[]} All selected appointments
	 * @since 1.62
	 * @public
	 */
	SinglePlanningCalendar.prototype.getSelectedAppointments = function() {
		return this._getGrid().getSelectedAppointments();
	};

	SinglePlanningCalendar.prototype.setLegend = function (vLegend) {
		var oLegendDestroyObserver,
			oLegend;

		this.setAssociation("legend", vLegend);
		this._getGrid().setAssociation("legend", vLegend);

		if (this.getLegend()) {
			this._getGrid()._sLegendId = this.getLegend();
			oLegend = sap.ui.getCore().byId(this.getLegend());
		}

		if (oLegend) { //destroy of the associated legend should rerender the SPC
			oLegendDestroyObserver = new ManagedObjectObserver(function(oChanges) {
				this.invalidate();
			}.bind(this));
			oLegendDestroyObserver.observe(oLegend, {
				destroy: true
			});
		}

		return this;
	};

	/**
	 * Switches the visibility of the SegmentedButton in the _header and aligns the columns in the grid after an
	 * operation (add, insert, remove, removeAll, destroy) with the views is performed.
	 *
	 * @returns {object} this for method chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._alignView = function () {
		this._switchViewButtonVisibility();
		this._alignColumns();

		return this;
	};

	/**
	 * Creates the header and adds proper <code>ariaLabelledBy</code> references on it's toolbars.
	 * @returns {object} The created header
	 * @private
	 */
	SinglePlanningCalendar.prototype._createHeader = function () {
		var oHeader = new PlanningCalendarHeader(this.getId() + "-Header");

		oHeader.getAggregation("_actionsToolbar")
			.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "SPC_ACTIONS_TOOLBAR"));

		oHeader.getAggregation("_navigationToolbar")
			.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "SPC_NAVIGATION_TOOLBAR"));

		return oHeader;
	};

	/**
	 * Checks whether a view with given key already exists in the views aggregation.
	 *
	 * @param {string} sKey the key to be checked
	 * @returns {boolean} true if view with given key exists
	 * @private
	 */
	SinglePlanningCalendar.prototype._isViewKeyExisting = function (sKey) {
		return this.getViews().some(function (oView) {
			return oView.getKey() === sKey;
		});
	};

	/**
	 * Getter for the associated as selectedView view.
	 * @returns {object} The currently selected view object
	 * @private
	 */
	SinglePlanningCalendar.prototype._getSelectedView = function () {
		var oSelectedView,
			aViews = this.getViews(),
			sCurrentViewKey = sap.ui.getCore().byId(this.getAssociation("selectedView")).getKey();

		for (var i = 0; i < aViews.length; i++) {
			if (sCurrentViewKey === aViews[i].getKey()) {
				oSelectedView = aViews[i];
				break;
			}
		}

		return oSelectedView || this._oDefaultView;
	};

	/**
	 * Switches the visibility of the button, controlling the views.
	 * If the SinglePlanningCalendar has only one view added to its view aggregation, the button is not visible.
	 * Otherwise, it is displayed in the _header.
	 *
	 * @returns {object} this for method chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._switchViewButtonVisibility = function () {
		var oSegmentedButton = this._getHeader()._getOrCreateViewSwitch(),
			bVisible = oSegmentedButton.getItems().length > 1;

		oSegmentedButton.setProperty("visible", bVisible);

		return this;
	};

	/**
	 * Attaches handlers to the events in the _header aggregation.
	 *
	 * @returns {object} this for method chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._attachHeaderEvents = function () {
		var oHeader = this._getHeader();

		oHeader.attachEvent("pressPrevious", this._handlePressArrow, this);
		oHeader.attachEvent("pressToday", this._handlePressToday, this);
		oHeader.attachEvent("pressNext", this._handlePressArrow, this);
		oHeader.attachEvent("dateSelect", this._handleCalendarPickerDateSelect, this);
		oHeader._getOrCreateViewSwitch().attachEvent("selectionChange", this._handleViewSwitchChange, this);

		return this;
	};

	/**
	 * Attaches delegates to the events in the _grid aggregation.
	 *
	 * @private
	 */
	SinglePlanningCalendar.prototype._attachDelegates = function() {
			// After the grid renders apply the focus on the cell
			this._afterRenderFocusCell = {
				onAfterRendering: function() {
					if (this._sGridCellFocusSelector) {
						jQuery(this._sGridCellFocusSelector).focus();
						this._sGridCellFocusSelector = null;
					}
				}.bind(this)
			};
			this._getGrid().addDelegate(this._afterRenderFocusCell);
	};

	/**
	 * Attaches handlers to the events in the _grid aggregation.
	 *
	 * @returns {object} this for method chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._attachGridEvents = function () {
		var oGrid = this._getGrid();

		oGrid._getColumnHeaders().attachEvent("select", function (oEvent) {
			this.fireHeaderDateSelect({
				date: oEvent.getSource().getDate()
			});
		}, this);

		oGrid.attachEvent("appointmentSelect", function (oEvent) {
			this.fireAppointmentSelect({
				appointment: oEvent.getParameter("appointment"),
				appointments: oEvent.getParameter("appointments")
			});
		}, this);

		oGrid.attachEvent("appointmentDrop", function (oEvent) {
			this.fireAppointmentDrop({
				appointment: oEvent.getParameter("appointment"),
				startDate: oEvent.getParameter("startDate"),
				endDate: oEvent.getParameter("endDate"),
				copy: oEvent.getParameter("copy")
			});
		}, this);

		oGrid.attachEvent("appointmentResize", function(oEvent) {
			this.fireAppointmentResize({
				appointment: oEvent.getParameter("appointment"),
				startDate: oEvent.getParameter("startDate"),
				endDate: oEvent.getParameter("endDate")
			});
		}, this);

		oGrid.attachEvent("appointmentCreate", function(oEvent) {
			this.fireAppointmentCreate({
				startDate: oEvent.getParameter("startDate"),
				endDate: oEvent.getParameter("endDate")
			});
		}, this);

		oGrid.attachEvent("cellPress", function(oEvent) {
			this.fireEvent("cellPress", {
				startDate: oEvent.getParameter("startDate"),
				endDate: oEvent.getParameter("endDate")
			});
		}, this);

		oGrid.attachEvent("borderReached", function (oEvent) {
			var oGrid = this._getGrid(),
				oFormat = oGrid._getDateFormatter(),
				iNavDelta = this._getSelectedView().getScrollEntityCount() - oGrid._getColumns() + 1,
				oCellStartDate = new Date(oEvent.getParameter("startDate")),
				bFullDay = oEvent.getParameter("fullDay"),
				oNavDate = this.getStartDate();

			if (oEvent.getParameter("next")) {
				oCellStartDate.setDate(oCellStartDate.getDate() + iNavDelta);
				oNavDate = new Date(oNavDate.setDate(oNavDate.getDate() + this._getSelectedView().getScrollEntityCount()));
				this.setStartDate(oNavDate);
			} else {
				oCellStartDate.setDate(oCellStartDate.getDate() - iNavDelta);
				oNavDate = new Date(oNavDate.setDate(oNavDate.getDate() - this._getSelectedView().getScrollEntityCount()));
				this.setStartDate(oNavDate);
			}

			this._sGridCellFocusSelector = bFullDay ?
				"[data-sap-start-date='" + oFormat.format(oCellStartDate) + "'].sapMSinglePCBlockersColumn" :
				"[data-sap-start-date='" + oFormat.format(oCellStartDate) + "'].sapMSinglePCRow";
		}, this);

		return this;
	};

	/**
	 * Handler for the pressPrevious and pressNext events in the _header aggregation.
	 * @param {Date} oEvent The triggered event
	 * @private
	 */
	SinglePlanningCalendar.prototype._handlePressArrow = function (oEvent) {
		this._applyArrowsLogic(oEvent.getId() === "pressPrevious");
		this._adjustColumnHeadersTopOffset();
	};

	/**
	 * Handler for the pressToday event in the _header aggregation.
	 * @private
	 */
	SinglePlanningCalendar.prototype._handlePressToday = function () {
		var oStartDate = this._getSelectedView().calculateStartDate(new Date());

		this.setStartDate(oStartDate);
		this.fireStartDateChange({
			date: oStartDate
		});
		this._adjustColumnHeadersTopOffset();
	};

	/**
	 * Handler for the selectionChange event in the _header aggregation.
	 * @param {Date} oEvent The triggered event
	 * @private
	 */
	SinglePlanningCalendar.prototype._handleViewSwitchChange = function (oEvent) {
		this.setAssociation("selectedView", oEvent.getParameter("item"));
		this._alignColumns();
		this._adjustColumnHeadersTopOffset();
	};

	/**
	 * Handler for the dateSelect event in the _header aggregation.
	 * @private
	 */
	SinglePlanningCalendar.prototype._handleCalendarPickerDateSelect = function () {
		var oStartDate = this._getHeader().getStartDate(),
			oSPCStartDate;

		oSPCStartDate = this._getSelectedView().calculateStartDate(new Date(oStartDate.getTime()));
		this.setStartDate(oSPCStartDate);
		this._getGrid()._getColumnHeaders().setDate(oStartDate);
		this.fireStartDateChange({
			date: oSPCStartDate
		});
		this._adjustColumnHeadersTopOffset();
	};

	/**
	 * Updates the selection in the header's calendarPicker aggregation.
	 * @private
	 */
	SinglePlanningCalendar.prototype._updateCalendarPickerSelection = function() {
		var oRangeDates = this._getFirstAndLastRangeDate(),
			oSelectedRange;

		oSelectedRange = new DateRange({
			startDate: oRangeDates.oStartDate.toLocalJSDate(),
			endDate: oRangeDates.oEndDate.toLocalJSDate()
		});

		this._getHeader().getAggregation("_calendarPicker").removeAllSelectedDates();
		this._getHeader().getAggregation("_calendarPicker").addSelectedDate(oSelectedRange);
	};

	/**
	 * Creates and formats a string to be displayed in the picker button from the _header aggregation.
	 * If no oLastDate is passed, this means that the SinglePlanningCalendar is showing Day view, so the string contains
	 * info about the current date. Otherwise, the result string shows info about a date range.
	 * @returns {string} The concatenated string to displayed
	 * @private
	 */
	SinglePlanningCalendar.prototype._formatPickerText = function () {
		var oRangeDates = this._getFirstAndLastRangeDate(),
			oStartDate = oRangeDates.oStartDate.toLocalJSDate(),
			oEndDate = oRangeDates.oEndDate.toLocalJSDate(),
			oLongDateFormat = DateFormat.getDateInstance({style: "long"}),
			oResult = oLongDateFormat.format(oStartDate);

		if (oStartDate.getTime() !== oEndDate.getTime()) {
			oResult += " - " + oLongDateFormat.format(oEndDate);
		}

		return oResult;
	};

	/**
	 * Logic for moving the selected time range in the control via the navigation arrows.
	 * @param {boolean} bBackwards Whether the left arrow is pressed
	 * @private
	 */
	SinglePlanningCalendar.prototype._applyArrowsLogic = function (bBackwards) {
		var oCalStartDate = CalendarDate.fromLocalJSDate(this.getStartDate() || new Date()),
			iNumberToAdd = this._getSelectedView().getScrollEntityCount(),
			oStartDate;

		if (bBackwards) {
			iNumberToAdd *= -1;
		}

		oCalStartDate.setDate(oCalStartDate.getDate() + iNumberToAdd);
		oStartDate = oCalStartDate.toLocalJSDate();

		this.setStartDate(oStartDate);
		this.fireStartDateChange({
			date: oStartDate
		});
	};

	/**
	 * Calculates the first and the last date of the range to be displayed. The size of the range depends on the
	 * currently selected view.
	 * @returns {object} Two properties containing the first and the last date from the range
	 * @private
	 */
	SinglePlanningCalendar.prototype._getFirstAndLastRangeDate = function () {
		var oSelectedView = this._getSelectedView(),
			oStartDate = this._getHeader().getStartDate() || new Date(),
			iDaysToAdd = oSelectedView.getEntityCount() - 1,
			oCalViewStartDate,
			oCalViewEndDate;

		oCalViewStartDate = CalendarDate.fromLocalJSDate(oSelectedView.calculateStartDate(new Date(oStartDate.getTime())));
		oCalViewEndDate = new CalendarDate(oCalViewStartDate);
		oCalViewEndDate.setDate(oCalViewStartDate.getDate() + iDaysToAdd);

		return {
			oStartDate: oCalViewStartDate,
			oEndDate: oCalViewEndDate
		};
	};

	/**
	 * Responsible for aligning the columns due to startDate or view change.
	 * @private
	 */
	SinglePlanningCalendar.prototype._alignColumns = function () {
		var oHeader = this._getHeader(),
			oGrid = this._getGrid(),
			oView = this._getSelectedView(),
			oDate = this.getStartDate() || new Date(),
			oViewStartDate = oView.calculateStartDate(new Date(oDate.getTime())),
			oCalViewDate = CalendarDate.fromLocalJSDate(oViewStartDate);

		oHeader.setStartDate(oViewStartDate);
		oHeader.setPickerText(this._formatPickerText(oCalViewDate));
		this._updateCalendarPickerSelection();
		oGrid.setStartDate(oViewStartDate);
		oGrid._setColumns(oView.getEntityCount());

		this._setColumnHeaderVisibility();
	};

	/**
	 * Switches the visibility of the column headers in the _grid.
	 * If the selectedView association of the SinglePlanningCalendar is day view, the column headers are not visible.
	 * Otherwise, they are displayed in the _grid.
	 * @private
	 */
	SinglePlanningCalendar.prototype._setColumnHeaderVisibility = function () {
		var bVisible = !this._getSelectedView().isA("sap.m.SinglePlanningCalendarDayView");

		this._getGrid()._getColumnHeaders().setVisible(bVisible);
		this.toggleStyleClass("sapMSinglePCHiddenColHeaders", !bVisible);
	};

	/**
	 * Getter for _header.
	 * @returns {object} The _header object
	 * @private
	 */
	SinglePlanningCalendar.prototype._getHeader = function () {
		return this.getAggregation("_header");
	};

	/**
	 * Getter for _grid.
	 * @returns {object} The _grid object
	 * @private
	 */
	SinglePlanningCalendar.prototype._getGrid = function () {
		return this.getAggregation("_grid");
	};

	/**
	 * Registers resize handler.
	 * @param {string} sHandler the handler ID
	 * @param {Object} oObject
	 * @param {Function} fnHandler
	 * @returns {sap.m.SinglePlanningCalendar} <code>this</code> for chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._registerResizeHandler = function (sHandler, oObject, fnHandler) {
		if (!this[sHandler]) {
			this[sHandler] = ResizeHandler.register(oObject, fnHandler);
		}

		return this;
	};

	/**
	 * De-registers resize handler.
	 * @param {string} sHandler the handler ID
	 * @returns {sap.m.SinglePlanningCalendar} <code>this</code> for chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._deRegisterResizeHandler = function (sHandler) {
		if (this[sHandler]) {
			ResizeHandler.deregister(this[sHandler]);
			this[sHandler] = null;
		}

		return this;
	};

	return SinglePlanningCalendar;

});
