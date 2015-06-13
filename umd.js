var UMD = function (name, defaults, callback, root) {

	root = root || window || this;

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
		delete options.dependencies;
		delete defaults.dependencies;
		var results = {};

		for (var key in defaults) {
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

			return new Promise(getCallback(mergeSettings(config)));
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
	 * return the loadable definitions for either AMD or globals
	 */
	return (function () {
		if ((typeof define === 'function' && define.amd)) {
			return defineViaAmd();
		} else {
			root[name] = loadViaGlobals();
		}
	}());

};