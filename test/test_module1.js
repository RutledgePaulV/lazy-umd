/**
 * Creates a universal module definition using lazy-umd.
 */
(function () {

	var GlobalName = 'TestModule1';

	var Defaults = {
		name: 'TESTING',
		other: 'TESTING_AGAIN',
		dependencies: [
			{name: 'jquery', reference: 'jQuery'},
			{name: 'handlebars', reference: 'Handlebars'},
			{name: 'castles', reference: 'castles'}
		]
	};

	var Module = function (settings, $, handlebars, castles) {
		var module = {};

		module.jquery = $;
		module.castles = castles;
		module.settings = settings;
		module.handlebars = handlebars;

		return module;
	};

	return Universal(GlobalName, Defaults, Module);

}());