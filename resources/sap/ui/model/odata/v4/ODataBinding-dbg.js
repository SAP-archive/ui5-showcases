/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
//Provides mixin sap.ui.model.odata.v4.ODataBinding for classes extending sap.ui.model.Binding
sap.ui.define([
	"./lib/_Helper",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/thirdparty/jquery"
], function (_Helper, SyncPromise, ChangeReason, OperationMode, Context, jQuery) {
	"use strict";

	var aChangeReasonPrecedence = [ChangeReason.Change, ChangeReason.Refresh, ChangeReason.Sort,
			ChangeReason.Filter],
		sClassName = "sap.ui.model.odata.v4.ODataBinding",
		// Whether a path segment is an index or contains a transient predicate
		rIndexOrTransientPredicate = /\/\d|\(\$uid=/;

	/**
	 * A mixin for all OData V4 bindings.
	 *
	 * @alias sap.ui.model.odata.v4.ODataBinding
	 * @mixin
	 */
	function ODataBinding() {
		// maps a canonical path of a quasi-absolute or relative binding to a cache object that may
		// be reused
		this.mCacheByResourcePath = undefined;
		this.oCachePromise = SyncPromise.resolve();
		this.mCacheQueryOptions = undefined;
		// used to create cache only for the latest call to #fetchCache
		this.oFetchCacheCallToken = undefined;
		// change reason to be used when the binding is resumed
		this.sResumeChangeReason = ChangeReason.Change;
	}

	/**
	 * Checks binding-specific parameters from the given map. "Binding-specific" parameters are
	 * those with a key starting with '$$', i.e. OData query options provided as binding parameters
	 * are ignored. The following parameters are supported, if the parameter name is contained in
	 * the given 'aAllowed' parameter:
	 * <ul>
	 * <li> '$$aggregation' with allowed values as specified in
	 *      {@link sap.ui.model.odata.v4.ODataListBinding#updateAnalyticalInfo} (but without
	 *      validation here)
	 * <li> '$$canonicalPath' with value <code>true</code>
	 * <li> '$$groupId' with allowed values as specified in {@link #checkGroupId}
	 * <li> '$$updateGroupId' with allowed values as specified in {@link #checkGroupId}
	 * <li> '$$inheritExpandSelect' with allowed values <code>false</code> and <code>true</code>
	 * <li> '$$operationMode' with value {@link sap.ui.model.odata.OperationMode.Server}
	 * <li> '$$ownRequest' with value <code>true</code>
	 * <li> '$$patchWithoutSideEffects' with value <code>true</code>
	 * </ul>
	 *
	 * @param {object} mParameters
	 *   The map of binding parameters
	 * @param {string[]} aAllowed
	 *   The array of allowed binding parameter names
	 * @throws {Error}
	 *   For unsupported parameter names or parameter values
	 *
	 * @private
	 */
	ODataBinding.prototype.checkBindingParameters = function (mParameters, aAllowed) {
		var that = this;

		Object.keys(mParameters).forEach(function (sKey) {
			var vValue = mParameters[sKey];

			if (sKey.indexOf("$$") !== 0) {
				return;
			}
			if (aAllowed.indexOf(sKey) < 0) {
				throw new Error("Unsupported binding parameter: " + sKey);
			}

			switch (sKey) {
				case "$$aggregation":
					// no validation here
					break;
				case "$$groupId":
				case "$$updateGroupId":
					that.oModel.checkGroupId(vValue, false,
						"Unsupported value for binding parameter '" + sKey + "': ");
					break;
				case "$$inheritExpandSelect":
					if (vValue !== true && vValue !== false) {
						throw new Error("Unsupported value for binding parameter "
							+ "'$$inheritExpandSelect': " + vValue);
					}
					if (!that.oOperation) {
						throw new Error("Unsupported binding parameter $$inheritExpandSelect: "
							+ "binding is not an operation binding");
					}
					if (mParameters.$expand || mParameters.$select) {
						throw new Error("Must not set parameter $$inheritExpandSelect on a binding "
							+ "which has a $expand or $select binding parameter");
					}
					break;
				case "$$operationMode":
					if (vValue !== OperationMode.Server) {
						throw new Error("Unsupported operation mode: " + vValue);
					}
					break;
				case "$$canonicalPath":
				case "$$ownRequest":
				case "$$patchWithoutSideEffects":
					if (vValue !== true) {
						throw new Error("Unsupported value for binding parameter '" + sKey + "': "
							+ vValue);
					}
					break;
				default:
					throw new Error("Unknown binding-specific parameter: " + sKey);
			}
		});
	};

	/**
	 * Throws an Error if the binding's root binding is suspended.
	 *
	 * @throws {Error} If the binding's root binding is suspended
	 *
	 * @private
	 */
	ODataBinding.prototype.checkSuspended = function () {
		var oRootBinding = this.getRootBinding();

		if (oRootBinding && oRootBinding.isSuspended()) {
			throw new Error("Must not call method when the binding's root binding is suspended: "
				+ this);
		}
	};

	/**
	 * Calls {@link #checkUpdateInternal}.
	 *
	 * @param {boolean} [bForceUpdate]
	 *   Whether the change event is fired in any case
	 * @throws {Error}
	 *   If there are unexpected parameters
	 *
	 * @private
	 */
	// @override sap.ui.model.Binding#checkUpdate
	ODataBinding.prototype.checkUpdate = function (bForceUpdate) {
		var that = this;

		if (arguments.length > 1) {
			throw new Error("Only the parameter bForceUpdate is supported");
		}

		this.checkUpdateInternal(bForceUpdate).catch(function (oError) {
			that.oModel.reportError("Failed to update " + that, sClassName, oError);
		});
	};

	/**
	 * A property binding re-fetches its value and fires a change event if the value has changed. A
	 * parent binding checks dependent bindings for updates or refreshes the binding if the resource
	 * path of its parent context changed.
	 *
	 * @param {boolean} [bForceUpdate]
	 *   Whether the change event is fired in any case (only allowed for property bindings)
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result when the check is finished, or rejecting in
	 *   case of an error (e.g. thrown by the change event handler of a control)
	 * @throws {Error} If called with illegal parameters
	 *
	 * @abstract
	 * @name sap.ui.model.odata.v4.ODataBinding#checkUpdateInternal
	 * @private
	 */

	/**
	 * Destroys the object. The object must not be used anymore after this function was called.
	 *
	 * @public
	 * @since 1.66
	 */
	ODataBinding.prototype.destroy = function () {
		this.mCacheByResourcePath = undefined;
		this.oCachePromise.then(function (oOldCache) {
			if (oOldCache) {
				oOldCache.setActive(false);
			}
		}, function () {});
		this.oCachePromise = SyncPromise.resolve(); // be nice to #withCache
		this.mCacheQueryOptions = undefined;
		// resolving functions e.g. for oReadPromise in #checkUpdateInternal may run after destroy
		// of this binding and must not access the context
		this.oContext = undefined;
		this.oFetchCacheCallToken = undefined;
	};


	/**
	 * Hook method for {@link sap.ui.model.odata.v4.ODataBinding#fetchCache} to create a cache for
	 * this binding with the given resource path and query options.
	 *
	 * @param {string} sResourcePath
	 *   The resource path, for example "EMPLOYEES"
	 * @param {object} mQueryOptions
	 *   The query options
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context instance to be used, must be <code>undefined</code> for absolute bindings
	 * @param {string} [sDeepResourcePath=sResourcePath]
	 *   The deep resource path to be used to build the target path for bound messages
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The new cache instance
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#doCreateCache
	 * @private
	 */

	/**
	 * Creates a cache for this binding if a cache is needed and updates <code>oCachePromise</code>.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context instance to be used, may be undefined for absolute bindings
	 *
	 * @private
	 */
	ODataBinding.prototype.fetchCache = function (oContext) {
		var oCachePromise,
			oCallToken = {},
			oCurrentCache,
			aPromises,
			that = this;

		if (!this.bRelative) {
			oContext = undefined;
		}
		if (this.oCachePromise.isFulfilled()) {
			oCurrentCache = this.oCachePromise.getResult();
			if (oCurrentCache) {
				oCurrentCache.setActive(false);
			}
		}
		aPromises = [this.fetchQueryOptionsForOwnCache(oContext), this.oModel.oRequestor.ready()];
		this.mCacheQueryOptions = undefined;
		oCachePromise = SyncPromise.all(aPromises).then(function (aResult) {
			var mQueryOptions = aResult[0];

			// Note: do not create a cache for a virtual context
			if (mQueryOptions && !(oContext && oContext.iIndex === Context.VIRTUAL)) {
				return that.fetchResourcePath(oContext).then(function (sResourcePath) {
					var oCache, sDeepResourcePath, oError, iReturnValueContextId;

					// create cache only for the latest call to fetchCache
					if (!oCachePromise || that.oFetchCacheCallToken === oCallToken) {
						that.mCacheQueryOptions = jQuery.extend(true, {},
							that.oModel.mUriParameters, mQueryOptions);
						if (that.bRelative) { // quasi-absolute or relative binding
							// mCacheByResourcePath has to be reset if parameters are changing
							that.mCacheByResourcePath = that.mCacheByResourcePath || {};
							oCache = that.mCacheByResourcePath[sResourcePath];
							iReturnValueContextId = oContext.getReturnValueContextId
								&& oContext.getReturnValueContextId();
							if (oCache && oCache.$returnValueContextId === iReturnValueContextId) {
								oCache.setActive(true);
							} else {
								sDeepResourcePath
									= _Helper.buildPath(oContext.getPath(), that.sPath).slice(1);
								oCache = that.doCreateCache(sResourcePath, that.mCacheQueryOptions,
									oContext, sDeepResourcePath);
								that.mCacheByResourcePath[sResourcePath] = oCache;
								oCache.$deepResourcePath = sDeepResourcePath;
								oCache.$resourcePath = sResourcePath;
								oCache.$returnValueContextId = iReturnValueContextId;
							}
						} else { // absolute binding
							oCache = that.doCreateCache(sResourcePath, that.mCacheQueryOptions,
								oContext);
						}
						return oCache;
					} else {
						oError = new Error("Cache discarded as a new cache has been created");
						oError.canceled = true;
						throw oError;
					}
				});
			}
		});
		oCachePromise.catch(function (oError) {
			//Note: this may also happen if the promise to read data for the canonical path's
			// key predicate is rejected with a canceled error
			that.oModel.reportError("Failed to create cache for binding " + that, sClassName,
				oError);
		});
		this.oCachePromise = oCachePromise;
		this.oFetchCacheCallToken = oCallToken;
	};

	/**
	 * Fetches the query options to create the cache for this binding or <code>undefined</code> if
	 * no cache is to be created.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context instance to be used, must be undefined for absolute bindings
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves with the query options to create the cache for this binding,
	 *   or with <code>undefined</code> if no cache is to be created
	 *
	 * @private
	 */
	ODataBinding.prototype.fetchQueryOptionsForOwnCache = function (oContext) {
		var bHasNonSystemQueryOptions,
			oQueryOptionsPromise,
			that = this;

		if (this.oOperation // operation binding manages its cache on its own
			|| this.bRelative && !oContext // unresolved binding
			|| this.isMeta()) {
			return SyncPromise.resolve(undefined);
		}

		// auto-$expand/$select and binding is a parent binding, so that it needs to wait until all
		// its child bindings know via the corresponding promise in this.aChildCanUseCachePromises
		// if they can use the parent binding's cache
		oQueryOptionsPromise = this.doFetchQueryOptions(oContext);
		if (this.oModel.bAutoExpandSelect && this.aChildCanUseCachePromises) {
			// For auto-$expand/$select, wait for query options of dependent bindings:
			// Promise.resolve() ensures all dependent bindings are created and have sent their
			// query options promise to this binding via fetchIfChildCanUseCache.
			// The aggregated query options of this binding and its dependent bindings are available
			// in that.mAggregatedQueryOptions once all these promises are fulfilled.
			oQueryOptionsPromise = SyncPromise.all([
				oQueryOptionsPromise,
				Promise.resolve().then(function () {
					return SyncPromise.all(that.aChildCanUseCachePromises);
				})
			]).then(function (aResult) {
				that.aChildCanUseCachePromises = [];
				that.updateAggregatedQueryOptions(aResult[0]);
				return that.mAggregatedQueryOptions;
			});
		}

		// (quasi-)absolute binding
		if (!this.bRelative || !oContext.fetchValue) {
			return oQueryOptionsPromise;
		}

		// auto-$expand/$select: Use parent binding's cache if possible
		if (this.oModel.bAutoExpandSelect) {
			bHasNonSystemQueryOptions = this.mParameters
				&& Object.keys(that.mParameters).some(function (sKey) {
					return sKey[0] !== "$" || sKey[1] === "$";
				});
			if (bHasNonSystemQueryOptions) {
				return oQueryOptionsPromise;
			}
			return oContext.getBinding()
				.fetchIfChildCanUseCache(oContext, that.sPath, oQueryOptionsPromise)
				.then(function (bCanUseCache) {
					return bCanUseCache ? undefined : oQueryOptionsPromise;
				});
		}

		// relative list or context binding with parameters which are not query options
		// (such as $$groupId)
		if (this.mParameters && Object.keys(this.mParameters).length) {
			return oQueryOptionsPromise;
		}

		// relative binding which may have query options from UI5 filter or sorter objects
		return oQueryOptionsPromise.then(function (mQueryOptions) {
			return Object.keys(mQueryOptions).length === 0 ? undefined : mQueryOptions;
		});
	};

	/**
	 * Fetches the OData resource path for this binding using the given context.
	 * If '$$canonicalPath' is set or the context's path contains indexes, the resource path uses
	 * the context's canonical path, otherwise it uses the context's path.
	 *
	 * @param {sap.ui.model.Context|sap.ui.model.odata.v4.Context} [oContext=this.oContext]
	 *   A context; if omitted, the binding's context is used
	 * @returns {SyncPromise} A promise resolving with the resource path or <code>undefined</code>
	 *   for an unresolved binding. If computation of the canonical path fails, the promise is
	 *   rejected.
	 *
	 * @private
	 */
	ODataBinding.prototype.fetchResourcePath = function (oContext) {
		var bCanonicalPath,
			sContextPath,
			oContextPathPromise,
			that = this;

		if (!this.bRelative) {
			return SyncPromise.resolve(this.sPath.slice(1));
		}
		oContext = oContext || this.oContext;
		if (!oContext) {
			return SyncPromise.resolve();
		}

		sContextPath = oContext.getPath();
		bCanonicalPath = oContext.fetchCanonicalPath
			&& (this.mParameters && this.mParameters["$$canonicalPath"]
				|| rIndexOrTransientPredicate.test(sContextPath));
		oContextPathPromise = bCanonicalPath
			? oContext.fetchCanonicalPath()
			: SyncPromise.resolve(sContextPath);

		return oContextPathPromise.then(function (sContextResourcePath) {
			return _Helper.buildPath(sContextResourcePath, that.sPath).slice(1);
		});
	};

	/**
	 * Returns all bindings which have this binding as parent binding.
	 *
	 * @returns {sap.ui.model.odata.v4.ODataBinding[]}
	 *   A list of dependent bindings, never <code>null</code>
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#getDependentBindings
	 * @private
	 */

	/**
	 * Returns the group ID of the binding that is used for read requests.
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @private
	 */
	ODataBinding.prototype.getGroupId = function () {
		return this.sGroupId
			|| (this.bRelative && this.oContext && this.oContext.getGroupId
					&& this.oContext.getGroupId())
			|| this.oModel.getGroupId();
	};

	/**
	 * Returns the relative path for a given absolute path by stripping off the binding's resolved
	 * path or the path of the binding's return value context. Returns relative paths unchanged.
	 * Note that the resulting path may start with a key predicate.
	 *
	 * Example: (The binding's resolved path is "/foo/bar"):
	 * baz -> baz
	 * /foo/bar/baz -> baz
	 * /foo/bar('baz') -> ('baz')
	 * /foo -> undefined if the binding is relative
	 *
	 * @param {string} sPath
	 *   A path
	 * @returns {string}
	 *   The path relative to the binding's path or <code>undefined</code> if the path is not a sub
	 *   path and the binding is relative
	 *
	 * @private
	 */
	ODataBinding.prototype.getRelativePath = function (sPath) {
		var sPathPrefix,
			sResolvedPath;

		if (sPath[0] === "/") {
			sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);
			if (sPath.indexOf(sResolvedPath) === 0) {
				sPathPrefix = sResolvedPath;
			} else if (this.oReturnValueContext
					&& sPath.indexOf(this.oReturnValueContext.getPath()) === 0) {
				sPathPrefix = this.oReturnValueContext.getPath();
			} else {
				// A mismatch can only happen when a list binding's context has been parked and is
				// destroyed later. Such a context does no longer have a subpath of the binding's
				// path. The only caller in this case is ODataPropertyBinding#deregisterChange
				// which can safely be ignored.
				return undefined;
			}
			sPath = sPath.slice(sPathPrefix.length);

			if (sPath[0] === "/") {
				sPath = sPath.slice(1);
			}
		}
		return sPath;
	};

	/**
	 * Returns a promise which resolves as soon as this binding is resumed.
	 *
	 * @returns {sap.ui.base.SyncPromise}
	 *   This binding's current promise for {@link sap.ui.model.odata.v4.ODataParentBinding#resume},
	 *   or <code>undefined</code> in case it is not currently suspended.
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#getResumePromise
	 * @private
	 * @see sap.ui.model.Binding#isSuspended
	 */

	/**
	 * Returns the root binding of this binding's hierarchy, see binding
	 * {@link topic:54e0ddf695af4a6c978472cecb01c64d Initialization and Read Requests}.
	 *
	 * @returns {sap.ui.model.odata.v4.ODataContextBinding|sap.ui.model.odata.v4.ODataListBinding|sap.ui.model.odata.v4.ODataPropertyBinding}
	 *   The root binding or <code>undefined</code> if this binding is not yet resolved.
	 *
	 * @public
	 * @since 1.53.0
	 */
	ODataBinding.prototype.getRootBinding = function () {
		if (this.bRelative && this.oContext && this.oContext.getBinding) {
			return this.oContext.getBinding().getRootBinding();
		}
		return this.bRelative && !this.oContext ? undefined : this;
	};

	/**
	 * Returns a promise which resolves as soon as this binding's root binding is resumed.
	 *
	 * @returns {sap.ui.base.SyncPromise}
	 *   The root binding's current promise for {@link #resume}, or
	 *   <code>SyncPromise.resolve()</code> in case we have no root binding or it is not currently
	 *   suspended.
	 *
	 * @private
	 * @see #checkSuspended
	 * @see #getResumePromise
	 * @see #isRootBindingSuspended
	 */
	ODataBinding.prototype.getRootBindingResumePromise = function () {
		var oRootBinding = this.getRootBinding();

		return oRootBinding && oRootBinding.getResumePromise() || SyncPromise.resolve();
	};

	/**
	 * Returns the group ID of the binding that is used for update requests.
	 *
	 * @returns {string}
	 *   The update group ID
	 *
	 * @private
	 */
	ODataBinding.prototype.getUpdateGroupId = function () {
		return this.sUpdateGroupId
			|| (this.bRelative && this.oContext && this.oContext.getUpdateGroupId
					&& this.oContext.getUpdateGroupId())
			|| this.oModel.getUpdateGroupId();
	};

	/**
	 * Returns <code>true</code> if this binding or its dependent bindings have pending changes,
	 * meaning updates that have not yet been successfully sent to the server.
	 *
	 * @returns {boolean}
	 *   <code>true</code> if the binding has pending changes
	 *
	 * @public
	 * @since 1.39.0
	 */
	ODataBinding.prototype.hasPendingChanges = function () {
		return this.hasPendingChangesForPath("") || this.hasPendingChangesInDependents();
	};

	/**
	 * Checks whether there are pending changes for the given path in the binding's cache (which may
	 * be inherited from the parent).
	 *
	 * @param {string} sPath
	 *   The path
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes for the path
	 *
	 * @private
	 */
	ODataBinding.prototype.hasPendingChangesForPath = function (sPath) {
		var that = this,
			oPromise = this.withCache(function (oCache, sCachePath) {
				return oCache.hasPendingChangesForPath(sCachePath);
			}, sPath).catch(function (oError) {
				that.oModel.reportError("Error in hasPendingChangesForPath", sClassName, oError);
				return false;
			});

		// If the cache is still being determined, there can be no changes in it
		return oPromise.isFulfilled() ? oPromise.getResult() : false;
	};

	/**
	 * Checks whether there are pending changes in caches stored by resource path at this binding
	 * which have the given resource path as prefix.
	 *
	 * @param {string} sResourcePathPrefix
	 *   The resource path prefix to identify the relevant caches
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes in caches
	 *
	 * @private
	 */
	ODataBinding.prototype.hasPendingChangesInCaches = function (sResourcePathPrefix) {
		var that = this;

		if (!this.mCacheByResourcePath) {
			return false;
		}
		return Object.keys(this.mCacheByResourcePath).some(function (sResourcePath) {
			var oCache = that.mCacheByResourcePath[sResourcePath];

			return oCache.$deepResourcePath.startsWith(sResourcePathPrefix)
				&& oCache.hasPendingChangesForPath("");
		});
	};

	/**
	 * Returns whether any dependent binding of this binding has pending changes
	 *
	 * @returns {boolean}
	 *   <code>true</code> if this binding has pending changes
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#hasPendingChangesInDependents
	 * @private
	 */

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#isInitial
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#isInitial
	ODataBinding.prototype.isInitial = function () {
		throw new Error("Unsupported operation: isInitial");
	};

	/**
	 * Returns whether the binding points to metadata.
	 *
	 * @returns {boolean} - Whether the binding points to metadata
	 *
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#isMeta
	 * @private
	 */

	/**
	 * Returns whether the binding is absolute or quasi-absolute.
	 *
	 * @returns {boolean} Whether the binding is absolute or quasi-absolute
	 *
	 * @private
	 */
	ODataBinding.prototype.isRoot = function () {
		return !this.bRelative || this.oContext && !this.oContext.getBinding;
	};

	/**
	 * Tells whether the binding's root binding is suspended.
	 *
	 * @returns {boolean} Whether the binding's root binding is suspended
	 *
	 * @private
	 */
	ODataBinding.prototype.isRootBindingSuspended = function () {
		var oRootBinding = this.getRootBinding();

		return oRootBinding && oRootBinding.isSuspended();
	};

	/**
	 * Creates or modifies a lock for a group at the model with this as owner.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID. If not given here, it can be set later on the created lock.
	 * @param {boolean|sap.ui.model.odata.v4.lib._GroupLock} [vLock]
	 *   If vLock is a group lock, it is modified and returned. Otherwise a lock is created which
	 *   locks if vLock is truthy.
	 * @returns {sap.ui.model.odata.v4.lib._GroupLock}
	 *   The group lock
	 *
	 * @private
	 * @see {sap.ui.model.odata.v4.ODataModel#lockGroup}
	 */
	ODataBinding.prototype.lockGroup = function (sGroupId, vLock) {
		return this.oModel.lockGroup(sGroupId, vLock, this);
	};

	/**
	 * Refreshes the binding. Prompts the model to retrieve data from the server using the given
	 * group ID and notifies the control that new data is available.
	 *
	 * Refresh is supported for bindings which are not relative to a
	 * {@link sap.ui.model.odata.v4.Context}.
	 *
	 * Note: When calling {@link #refresh} multiple times, the result of the request triggered by
	 * the last call determines the binding's data; it is <b>independent</b> of the order of calls
	 * to {@link sap.ui.model.odata.v4.ODataModel#submitBatch} with the given group ID.
	 *
	 * If there are pending changes, an error is thrown. Use {@link #hasPendingChanges} to check if
	 * there are pending changes. If there are changes, call
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch} to submit the changes or
	 * {@link sap.ui.model.odata.v4.ODataModel#resetChanges} to reset the changes before calling
	 * {@link #refresh}.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh; if not specified, the binding's group ID is used. For
	 *   suspended bindings, only the binding's group ID is supported because {@link #resume} uses
	 *   the binding's group ID.
	 *
	 *   Valid values are <code>undefined</code>, '$auto', '$auto.*', '$direct' or application group
	 *   IDs as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @throws {Error}
	 *   If the given group ID is invalid, the binding has pending changes, refresh on this
	 *   binding is not supported, or a group ID different from the binding's group ID is specified
	 *   for a suspended binding.
	 *
	 * @public
	 * @see sap.ui.model.Binding#refresh
	 * @see #getRootBinding
	 * @see #hasPendingChanges
	 * @see #resetChanges
	 * @see #suspend
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#refresh
	ODataBinding.prototype.refresh = function (sGroupId) {
		if (!this.isRoot()) {
			throw new Error("Refresh on this binding is not supported");
		}
		if (this.hasPendingChanges()) {
			throw new Error("Cannot refresh due to pending changes");
		}
		this.oModel.checkGroupId(sGroupId);

		// The actual refresh is specific to the binding and is implemented in each binding class.
		this.refreshInternal("", sGroupId, true).catch(function () {
			// Nothing to do here, the error is already logged. The catch however is necessary,
			// because we drop the promise here, so there is no other code to catch it.
		});
	};

	/**
	 * Refreshes the binding. The refresh method itself only performs some validation checks and
	 * forwards to this method doing the actual work. Interaction between contexts also runs via
	 * these internal methods.
	 *
	 * @param {string} sResourcePathPrefix
	 *   The resource path prefix which is used to delete the dependent caches and corresponding
	 *   messages; may be "" but not <code>undefined</code>
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh
	 * @param {boolean} [bCheckUpdate]
	 *   If <code>true</code>, a property binding is expected to check for updates
	 * @param {boolean} [bKeepCacheOnError]
	 *   If <code>true</code>, the binding data remains unchanged if the refresh fails
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result when the refresh is finished; it is rejected
	 *   when the refresh fails; the promise is resolved immediately on a suspended binding
	 * @throws {Error}
	 *   If the binding's root binding is suspended and a group ID different from the binding's
	 *   group ID is given
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#refreshInternal
	 * @private
	 */

	/**
	 * Remove this binding's caches and non-persistent messages. Only caches with a resource path
	 * starting with the given resource path prefix and messages with a target path starting with
	 * the given prefix are removed.
	 *
	 * @param {string} sResourcePathPrefix
	 *   The resource path prefix which is used to delete the dependent caches and corresponding
	 *   messages; may be "" but not <code>undefined</code>
	 *
	 * @private
	 */
	ODataBinding.prototype.removeCachesAndMessages = function (sResourcePathPrefix) {
		var oModel = this.oModel,
			sResolvedPath = oModel.resolve(this.sPath, this.oContext),
			that = this;

		if (sResolvedPath) {
			// The caller of this function replaces the current cache just after this function call;
			// remove only the related messages
			oModel.reportBoundMessages(sResolvedPath.slice(1), {});
		}
		if (this.mCacheByResourcePath) {
			Object.keys(this.mCacheByResourcePath).forEach(function (sResourcePath) {
				var oCache = that.mCacheByResourcePath[sResourcePath];

				if (oCache.$deepResourcePath.startsWith(sResourcePathPrefix)) {
					oModel.reportBoundMessages(oCache.$deepResourcePath, {});
					delete that.mCacheByResourcePath[sResourcePath];
				}
			});
		}
	};

	/**
	 * Resets all pending changes of this binding, see {@link #hasPendingChanges}. Resets also
	 * invalid user input.
	 *
	 * @throws {Error}
	 *   If the binding's root binding is suspended or if there is a change of this binding which
	 *   has been sent to the server and for which there is no response yet.
	 *
	 * @public
	 * @since 1.40.1
	 */
	ODataBinding.prototype.resetChanges = function () {
		this.checkSuspended();
		this.resetChangesForPath("");
		this.resetChangesInDependents();
		this.resetInvalidDataState();
	};

	/**
	 * Resets pending changes for the given path in the binding's cache (which may be inherited from
	 * the parent).
	 *
	 * @param {string} sPath
	 *   The path
	 * @throws {Error}
	 *   If there is a change of this binding which has been sent to the server and for which there
	 *   is no response yet.
	 *
	 * @private
	 */
	ODataBinding.prototype.resetChangesForPath = function (sPath) {
		var oPromise = this.withCache(function (oCache, sCachePath) {
				oCache.resetChangesForPath(sCachePath);
			}, sPath),
			that = this;

		oPromise.catch(function (oError) {
			that.oModel.reportError("Error in resetChangesForPath", sClassName, oError);
		});
		if (oPromise.isRejected()) {
			throw oPromise.getResult();
		}
	};

	/**
	 * Resets pending changes in all dependent bindings.
	 * @throws {Error}
	 *   If there is a change of this binding which has been sent to the server and for which there
	 *   is no response yet.
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#resetChangesInDependents
	 * @private
	 */

	/**
	 * A method to reset invalid data state, to be called by {@link #resetChanges}.
	 * Does nothing, because only property bindings have data state.
	 *
	 * @private
	 */
	ODataBinding.prototype.resetInvalidDataState = function () {
	};

	/**
	 * Sets the change reason that {@link #resume} fires. If there are multiple changes, the
	 * "strongest" change reason wins: Filter > Sort > Refresh > Change.
	 *
	 * @param {sap.ui.model.ChangeReason} sChangeReason
	 *   The change reason
	 *
	 * @private
	 */
	ODataBinding.prototype.setResumeChangeReason = function (sChangeReason) {
		if (aChangeReasonPrecedence.indexOf(sChangeReason) >
				aChangeReasonPrecedence.indexOf(this.sResumeChangeReason)) {
			this.sResumeChangeReason = sChangeReason;
		}
	};

	/**
	 * Returns a string representation of this object including the binding path. If the binding is
	 * relative, the parent path is also given, separated by a '|'.
	 *
	 * @returns {string} A string description of this binding
	 * @public
	 * @since 1.37.0
	 */
	ODataBinding.prototype.toString = function () {
		return this.getMetadata().getName() + ": " + (this.bRelative  ? this.oContext + "|" : "")
			+ this.sPath;
	};

	/**
	 * Recursively visits all dependent bindings of (the given context of) this binding. Bindings
	 * with an own cache will request side effects themselves as applicable. Bindings mentioned
	 * in <code>mNavigationPropertyPaths</code> will refresh themselves.
	 *
	 * @param {string} sGroupId
	 *   The group ID to be used for requesting side effects
	 * @param {string[]} aPaths
	 *   The "14.5.11 Expression edm:NavigationPropertyPath" or
	 *   "14.5.13 Expression edm:PropertyPath" strings describing which properties need to be loaded
	 *   because they may have changed due to side effects of a previous update
	 * @param {sap.ui.model.odata.v4.Context} [oContext]
	 *   The context for which to request side effects; if missing, the whole binding is affected
	 * @param {object} mNavigationPropertyPaths
	 *   Hash set of collection-valued navigation property meta paths (relative to this binding's
	 *   cache root) which need to be refreshed, maps string to <code>true</code>; read-only
	 * @param {Promise[]} aPromises
	 *   List of (sync) promises which is extended for each call to
	 *   {@link sap.ui.model.odata.v4.ODataParentBinding#requestSideEffects} or
	 *   {@link sap.ui.model.odata.v4.ODataBinding#refreshInternal}.
	 * @param {string} [sPrefix=""]
	 *   Prefix for navigation property meta paths; must only be used during recursion
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#visitSideEffects
	 * @private
	 * @see sap.ui.model.odata.v4.Context#requestSideEffects
	 * @see sap.ui.model.odata.v4.ODataParentBinding#requestSideEffects
	 */

	/**
	 * Calls the given processor with the cache containing this binding's data, the path relative
	 * to the cache and the cache-owning binding. Adjusts the path if the cache is owned by a parent
	 * binding.
	 *
	 * @param {function} fnProcessor The processor
	 * @param {string} [sPath=""] The path; either relative to the binding or absolute containing
	 *   the cache's request path (it will become absolute when forwarding the request to the
	 *   parent binding)
	 * @returns {sap.ui.base.SyncPromise} A sync promise that is resolved with either the result of
	 *   the processor or <code>undefined</code> if there is no cache for this binding currently
	 */
	ODataBinding.prototype.withCache = function (fnProcessor, sPath) {
		var sRelativePath,
			that = this;

		sPath = sPath || "";
		return this.oCachePromise.then(function (oCache) {
			if (oCache) {
				sRelativePath = that.getRelativePath(sPath);
				if (sRelativePath !== undefined) {
					return fnProcessor(oCache, sRelativePath, that);
				}
				// the path did not match, try to find it in the parent cache
			} else if (that.oOperation) {
				return undefined; // no cache yet
			}
			if (that.oContext && that.oContext.withCache) {
				return that.oContext.withCache(fnProcessor,
					sPath[0] === "/" ? sPath : _Helper.buildPath(that.sPath, sPath));
			}
			// no context or base context -> no cache (yet)
			return undefined;
		});
	};

	function asODataBinding(oPrototype) {
		if (this) {
			ODataBinding.apply(this, arguments);
		} else {
			jQuery.extend(oPrototype, ODataBinding.prototype);
		}
	}

	asODataBinding.prototype.destroy = ODataBinding.prototype.destroy;

	return asODataBinding;
}, /* bExport= */ false);