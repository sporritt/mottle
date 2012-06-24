#touch-adapter
=============

touch-adapter is a simple wrapper that allows you to register event listeners for mouse events and have those listeners respond to the corresponding touch devices.  Support for click/dblclick/contextmenu is also included. I created this because I wanted a simple way to normalise a UI I was building across desktop and mobile, and I didn't need a mobile framework; just touch events.

##Browser Support

Currently, all desktop browsers and iOS devices are supported.  Support for Android will be coming shortly.

##Requirements

touch-adapter can run completely stand alone, operating directly on the DOM, or you can use a library-specific wrapper version. Currently there is only jQuery 1.7.x, but MooTools and YUI, possibly RightJS, Zepto and Prototype are coming soon.   Oh and the 1.7.x dependency on jQuery is nothing that could not be changed easily enough.

##Event Mapping

The three basic touch events are mapped in this way:

- __touchstart__ -> __mousedown__
- __touchend__ -> __mouseup__
- __touchmove__ -> __mousemove__

In addition, touch-adapter support click, dblclick and contextmenu, by starting a timer on touchstart and 

##Usage


###Standalone

To use the standalone touch-adapter, you first create one:

	var touchAdapter = new TouchAdapter();

..and you then make calls to `bind` and `unbind`:

	touchAdapter.bind(someElement, "click", aFunction);
	touchAdapter.unbind(someOtherElement, "dblclick", anotherFunction);

Note that `bind` and `unbind` are chainable:

	touchAdapter.bind(someElement, "click", aFunction).unbind(someOtherElement, "dblclick", anotherFunction);

Your event callbacks, when using the standalone touch-adapter, will be passed native browser events.

TouchAdapter's constructor can take a params object, with five possible values (all are optional):

- __bind__ a function to use for binding event listeners. if this is not provided, touch-adapter uses its own default method.
- __unbind__ a function to use for unbinding event listeners. Same deal as for bind if not provided.
- __unwrap__ a function to use for unwrapping an event to its original event. Not required if you are using native DOM events, but the library specific subclasses of touch-adapter all provide an unwrap function.
- __clickThreshold__ number of milliseconds within which the user must release a touch in order for us to register a click. Defaults to 150.
- __doubleClickThreshold__ number of milliseconds within which two consecutive clicks must be registered in order for us to register a double click. Defaults to 250.

###jQuery

The jQuery touch-adapter can be used either as a JS object that you instantiate, but it also registers itself as a plugin.

####jQuery Standalone

Using the jQuery touch-adapter standalone is a lot like using the native standalone version:

	var touchAdapter = new jQueryTouchAdapter();

..and you then make calls to `bind` and `unbind`:

	touchAdapter.bind(someElement, "click", aFunction);
	touchAdapter.unbind(someOtherElement, "dblclick", anotherFunction);

(when I say a lot like it, I mean __the same__).  The only difference is that your callbacks will be passed jQuery event objects.

####jQuery Plugin

For lovers of selector soup, touch-adapter registers two handy methods on the jQuery function object:

	$("#someElement").taBind("click", someFunction);
	$("#someElement").taUnbind("dblclick", someOtherFunction);

These are, of course, chainable:

	$("#someElement").taBind("click", someFunction).taBind("dblclick", someOtherFunction);

What about `delegate`, `live` and `on` ?  I'll add these if someone asks for them.  Seems like they would be a nice to have.

###MooTools

Coming shortly.

###YUI3

Thinking about doing this too. But YUI3 seems to have pretty decent touch event support already.





