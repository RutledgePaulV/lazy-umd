describe("umd require tests", function () {

	it('should properly resolve amd modules and settings from require config', function (done) {

		require.config({
			paths: {
				promise: '../bower_components/requirejs-promise/requirejs-promise',
				TestModule1: 'test_module1'
			},
			config: {
				TestModule1: {
					other: 'TESTING_OTHER',
					dependencies: {
						'handlebars': 'bilbo',
						'castles': 'castles'
					}
				}
			}
		});

		window.castles = 'boom';

		define('castles', function() {
			return window.castles;
		});

		define('bilbo', function() {
			return 3;
		});

		define('jQuery', function () {
			return jQuery;
		});

		require(['promise!TestModule1'], function (loaded) {
			expect(loaded.settings).to.deep.equal({name: 'TESTING', other: 'TESTING_OTHER'});
			expect(loaded.jquery).to.be.defined;
			expect(loaded.handlebars).to.equal(3);
			expect(loaded.castles).to.equal('boom');
			done();
		});

	});


});