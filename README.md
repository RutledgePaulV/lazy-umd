[![Build Status](https://travis-ci.org/RutledgePaulV/lazy-umd.svg)](https://travis-ci.org/RutledgePaulV/lazy-umd)

## Lazy UMD
This is a javascript universal module definition wrapper. It allows you to specify
just three straightforward things and automatically get a wrapped up module that can
be used either in the browser or with requirejs all while maintaining the ability to
override dependencies with custom versions or aliased versions and also maintaining the
ability to specify settings (via a plain object when using as a global and as requirejs
module configuration when using requirejs.)


## How does it look?
```JavaScript
// ColorModule.js
(function() {

	// if we were doing browser globals, it's init function would be: window.ColorItBuilder
	var BrowserGlobalName = "ColorItBuilder";

	// the default settings for the initialization. can be overriden with an object passed it
	// when using global initialization, or can be defined as module config when using requirejs
	var defaults = {
		color: 'red'
		dependencies: [
			{name: 'jquery', reference: 'jQuery'}
		]
	}

	return Universal(BrowserGlobalName, defaults, function(settings, jquery) {

		var ColorIt = function(thingToColor) {
			$(thingToColor).style({'color': settings.color);
		};

		return ColorIt;
	})

}());


// require config for my tests
require.config({
	paths: {
		promise: '../bower_components/requirejs-promise/requirejs-promise',
		myAliasedJquery: '../bower_components/jquery/jquery.amd',
		MyLazyUmdModule: 'scripts/ColorModule'
	},
	config: {
		MyLazyUmdModule: {
			color: 'blue',
			dependencies: {
				'jquery': 'myAliasedJquery'
			}
		}
	}
});


// inside some test
require(['myAliasedJquery', 'promise!MyLazyUmdModule'], function ($, colorIt) {
	var myDiv = $('<div>some-blue-text</div>');
	$('body').append(myDiv);
	colorIt(myDiv);
	expect(myDiv.style('color')).to.equal('blue');
});
```



## How does the global option work?
It just does some checks to see what the environment it is running is like and then it
mixes in whatever configuration is passed to the init function in order to determine what
dependencies to use. This is the simpler of the two.


## How does the requirejs piece work?
Well, the definition returns a promise and is intended to be used with the mighty requirejs-promise
plugin. This allows you to specify your own resolutions for its dependencies in your requirejs config
for whatever modules you define with it and they'll be picked up. First it gets the module config then
it determines its real dependency list and then does a call to grab them. Once its got everything it
determined it needs it will resolve the promise. So, if you're using the requirejs-promise plugin it
will act just like a normal requirejs dependency and won't return control to the module that's using it
until it has loaded.

