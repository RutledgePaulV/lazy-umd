/**
 * This module is for building the universal module defining function.
 *
 */
(function (global) {

	/**
	 * Defines a function that converts the arguments into a universal module
	 * definition that supports dependency overriding and settings overriding
	 * in both the global browser context and requirejs module configuration
	 * contexts.
	 *
	 * @param name {string} The name that the module should assume on the browser if loaded without an amd loader.
	 *
	 * @param defaults {{?:?, dependencies:{name:string, reference:string}[]}} An object containing the
	 *                 default values that the loader should use when instantiating the module.
	 *
	 * @param callback {function} The loader function. This will receive a settings object as the first parameter
	 *                            and will receive the dependencies as the following parameters in the order that
	 *                            they are defined in the defaults.
	 *
	 * @param [root=window] {{}} The object on which the global should be defined when there is no amd loader.
	 *
	 * @returns {*} In the case of an AMD loader, a module will simply be defined. In the case of a browser global
	 *              or the likes, it will set the module definition on the root with the provided name. In order
	 *              to actually instantiate the module you must call that function with an options object.
	 *
	 *
	 */
	global.Universal = function (name, defaults, callback, root) {

		root = root || global;

		/**
		 * Dirty check to see if they provided a reference to an object
		 * or just a string.
		 *
		 * @param val
		 * @returns {boolean}
		 */
		var isString = function (val) {
			return typeof val == 'string' || val.constructor === String;
		};


		/**
		 * Determines the final list of dependencies to be required in order
		 * for the loader to initialize properly. Merges defaults and any
		 * overrides provided by the require config.
		 *
		 * @param overrides
		 * @returns {Array}
		 */
		var mergeDependencyDefinitionsForRequire = function (overrides) {
			var mergedDependencies = [];
			var dependencies = defaults.dependencies || [];

			dependencies.forEach(function (dep) {
				var name = dep.name;
				if (overrides.hasOwnProperty(name)) {
					mergedDependencies.push(overrides[name]);
				} else {
					mergedDependencies.push(dep.reference);
				}
			});

			return mergedDependencies;
		};


		/**
		 * Determines the final list of dependencies to be passed to
		 * the loader in order for it to initialize properly. Merges
		 * defaults and any overrides provided by the initialization
		 * settings.
		 *
		 * @param overrides
		 * @returns {Array}
		 */
		var mergeDependencyDefinitionsForGlobals = function (overrides) {
			var mergedDependencies = [];
			var dependencies = defaults.dependencies || [];

			dependencies.forEach(function (dep) {
				var name = dep.name;
				if (overrides.hasOwnProperty(name)) {
					var overrideReference = overrides[name];
					if (isString(overrideReference)) {
						overrideReference = root[overrideReference];
					}
					mergedDependencies.push(overrideReference);
				} else {
					if (root.hasOwnProperty(dep.reference)) {
						mergedDependencies.push(root[dep.reference]);
					} else {
						throw new Error('Could not load dependency.');
					}
				}
			});

			return mergedDependencies;
		};


		/**
		 * Merges settings provided to the initializer with the defaults for injection
		 * into the loader.
		 *
		 * @param options
		 * @returns {*}
		 */
		var mergeSettings = function (options) {
			var results = {};

			for (var key in defaults) {
				if(key === 'dependencies') {
					continue;
				}

				if (defaults.hasOwnProperty(key) && options.hasOwnProperty(key)) {
					results[key] = options[key];
				} else if (defaults.hasOwnProperty(key)) {
					results[key] = defaults[key];
				}

			}

			return results;
		};


		/**
		 * Defines an AMD module with the appropriate dependencies allowing
		 * for overriding of the dependencies inside the require configuration.
		 *
		 * @returns {*}
		 */
		var defineViaAmd = function () {

			return define(['module'], function (module) {
				var config = module.config();

				var overrides = config.dependencies || [];
				var actualDeps = mergeDependencyDefinitionsForRequire(overrides);

				var getCallback = function (config) {
					return function (resolve, reject) {
						try {
							require(actualDeps, function () {
								var args = Array.prototype.slice.call(arguments);
								args.unshift(config);
								resolve(callback.apply({}, args));
							});
						} catch (e) {
							reject(e);
						}
					};
				};

				if(window && window.Promise) {
					return new Promise(getCallback(mergeSettings(config)));
				} else if(jQuery && jQuery.Deferred) {
					var promise = new jQuery.Deferred();
					getCallback(mergeSettings(config))(promise.resolve, promise.reject);
					return promise.promise();
				} else {
					throw new Error('Promises are not supported in this environment.');
				}
			});

		};


		/**
		 * A function that receives settings and optional dependency overrides
		 * and uses them to load the wrapped module.
		 *
		 * @returns {*}
		 */
		var loadViaGlobals = function () {
			return function (settings) {
				var overrides = settings.dependencies || [];
				var args = mergeDependencyDefinitionsForGlobals(overrides);
				args.unshift(mergeSettings(settings));
				return callback.apply({}, args);
			};
		};


		/**
		 * return the definition for AMD otherwise set the module definition
		 * as a function on the root with the provided name.
		 */
		if ((typeof define === 'function' && define.amd)) {
			return defineViaAmd();
		} else {
			root[name] = loadViaGlobals();
		}

	};

	return global;

}(window || this));