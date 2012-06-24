#touch-adapter
=============

touch-adapter is a simple wrapper that allows you to register event listeners for mouse events and have those listeners respond to the corresponding touch devices.  Support for click/dblclick/contextmenu is also included.

##Browser Support

Currently, all desktop browsers and iOS devices are supported.  Support for Android will be coming shortly.

##Requirements

touch-adapter can run completely stand alone, operating directly on the DOM, or you can use a library-specific wrapper version (currently only jQuery; MooTools and YUI, possibly RightJS, Zepto and Prototype coming soon).  

##Usage


###Standalone

To use the standalone touch-adapter, you first create one:

	var touchAdapter = new TouchAdapter();

..and you then make calls to __bind__ and __unbind__:

	touchAdapter.bind(someElement, "click", aFunction);
	touchAdapter.unbind(someOtherElement, "dblclick", anotherFunction);

Note that `bind` and `unbind` are chainable:

	touchAdapter.bind(someElement, "click", aFunction).unbind(someOtherElement, "dblclick", anotherFunction);

TouchAdapter's constructor can take a params object, with three possible value:

	- __bind__ a function to use for binding event listeners. if this is not provided, touch-adapter uses its own default method.
	- __unbind__ a function to use for unbinding event listeners. Same deal as for bind if not provided.
	- __unwrap__ a function to use for unwrapping an event to its original event. Not required if you are using native DOM events, but the library specific subclasses of touch-adapter all provide an unwrap function.

###jQuery

The jQuery touch-adapter can be used either as a JS object that you instantiate, but it also registers itself as a plugin.





