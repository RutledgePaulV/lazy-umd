describe("umd global tests", function () {


	it('should properly resolve browser globals and passed in settings', function () {

		window.castles = 3;

		var loaded = TestModule1({other: 'TESTING_OTHER'});

		expect(loaded.settings).to.deep.equal({name: 'TESTING', other: 'TESTING_OTHER'});
		expect(loaded.jquery).to.be.defined;
		expect(loaded.handlebars).to.be.defined;
		expect(loaded.castles).to.equal(3);

	});


});