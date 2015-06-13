(function () {

	var GlobalName = 'TestModule1';

	var defaults = {
		name: 'TESTING',
		other: 'TESTING_AGAIN',
		dependencies: [
			{name: 'jquery', reference: 'jQuery'},
			{name: 'handlebars', reference: 'Handlebars'},
			{name: 'castles', reference: 'castles'}
		]
	};


	return UMD(GlobalName, defaults, function (options, $, handlebars, castles) {

		var module = {};

		module.jquery = $;
		module.castles = castles;
		module.settings = options;
		module.handlebars = handlebars;

		return module;

	});

}());