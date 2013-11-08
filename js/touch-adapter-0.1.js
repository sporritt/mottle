/*
	Wraps touch events and presents them as mouse events: you register for standard mouse events such as 
	click, mousedown, mouseup and mousemove, and the touch adapter will automatically register corresponding
	touch events for each of these.  note that 'click' is achieved through setting a timer on touchstart and
	firing an event on touchend if the timer has not yet expired. The delay for this timer can be set on 
	the touchadapter's constructor (clickThreshold); the default is 150ms.

	Note that TouchAdapter can run without any supporting library - it contains event bind and unbind
	functions internally, which operate on DOM nodes - but is also designed to support any library of
	your choice. It does this by allowing you to provide 'bind' and 'unbind' functions to the constructor. 
	This arrangement gives us the flexibility to create wrappers that provide different implementations of
	bind and unbind: for instance, we could create a jQuery 'on', delegate' or 'live' version, as well as one
	that uses the standard 'bind' and 'unbind' functions.

	An additional function that is required if you wrap the basic DOM functionality is an 'unwrap' function,
	which is used to get the original browser event from some event wrapped by the library.

*/
;(function() {

	var isIOS = (function() { ((/iphone|ipad/gi).test(navigator.appVersion)) })(),
		isTouchDevice = "ontouchstart" in document.documentElement,
		click = "click", dblclick = "dblclick", mousedown = "mousedown", mouseup = "mouseup", mousemove = "mousemove",
		touchstart = "touchstart", touchend = "touchend", touchmove = "touchmove", contextmenu = "contextmenu",
		downEvent = isTouchDevice ? touchstart : mousedown,
		upEvent = isTouchDevice ? touchend : mouseup,
		moveEvent = isTouchDevice ? touchmove : mousemove,
		ta_is_down = "__touchAdaptorIsDown", ta_click_timeout = "__touchAdaptorClickTimeout",
		ta_context_menu_timeout = "__touchAdaptorContextMenuTimeout",
		ta_down = "__touchAdapterDown", ta_up = "__touchAdapterUp", 
		ta_context_down = "__touchAdapterContextDown", ta_context_up = "__touchAdapterContextUp",
		_pageLocation = function(e) {
			if (e.pageX && e.pageY)
				return [e.pageX, e.pageY];
			else {
				var ts = _touches(e),
					t = _getTouch(ts, 0);
				// this is for iPad. may not fly for Android.
				// NOTE this is a browser event here. you
				// must first have passed the library event through the current event unwrap function.
				return [t.pageX, t.pageY];
			}        	
		},
		// 
		// extracts the touch with the given index from the list of touches
		//
		_getTouch = function(touches, idx) {
			return touches.item ? touches.item(idx) : touches[idx];
		},
		//
		// gets the touches from the given event, if they exist. NOTE this is a browser event here. you
		// must first have passed the library event through the current event unwrap function.
		//
		_touches = function(e) {	
			return e.touches || [];
		},
		_touchCount = function(e) {
			return _touches(e).length || 1;
		},
		//http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
		addEvent = function( obj, type, fn ) {
			if (obj.addEventListener)
				obj.addEventListener( type, fn, false );
			else if (obj.attachEvent)
			{
				obj["e"+type+fn] = fn;
				obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
				obj.attachEvent( "on"+type, obj[type+fn] );
			}
		},
		removeEvent = function( obj, type, fn ) {
			if (obj.removeEventListener)
				obj.removeEventListener( type, fn, false );
			else if (obj.detachEvent)
			{
				obj.detachEvent( "on"+type, obj[type+fn] );
				obj[type+fn] = null;
				obj["e"+type+fn] = null;
			}
		};	

	window.TouchAdapter = function(params) {
		params = params || {};
		var self = this, _bind = params.bind || addEvent,
			_unbind = params.unbind || removeEvent,
			_unwrap = params.unwrap || function(e) { return e; },
			wrapClick = params.wrapClick !== false,
			clickThreshold = params.clickThreshold || 150,
			wrapDblClick = params.wrapDblClick !== false,
			doubleClickThreshold = params.doubleClickThreshold || 250,
			wrapContextMenu = params.wrapContextMenu !== false,
			wrapDown = params.wrapDown !== false,
			wrapUp = params.wrapUp !== false,
			wrapMove = params.wrapMove !== false,
			_smartClicks = params.smartClicks,			
			_smartClickDown = function(e, obj) {
				console.log("smart click down");				
				obj.__tad = _pageLocation(_unwrap(e));
				return true;
			},
			_smartClickUp = function(e, obj) {
				console.log("smart click up");
				obj.__tau = _pageLocation(_unwrap(e));
				return true;
			},
			_smartClickClick = function(e, obj) {
				if (obj.__tad && obj.__tau) {
					return obj.__tad[0] == obj.__tau[0] && obj.__tad[1] == obj.__tau[1];
				}
				return true;
			},
			_smartClickHandlers = {
				"mousedown":_smartClickDown,
				"mouseup":_smartClickUp,
				"touchstart":_smartClickDown,
				"touchend":_smartClickUp,
				"click":_smartClickClick
			},
			// wrap bind function to provide "smart" click functionality, which prevents click events if
			// the mouse has moved between up and down.
			__bind = function(obj, evt, fn) {
				if (_smartClicks) {
					var _fn = fn;
					fn = function(e) {																
						var cont = true;
						if (_smartClickHandlers[evt])
							cont = _smartClickHandlers[evt](e, obj);

						if (cont) _fn.apply(this, arguments);
					};
				}
				
				_bind(obj, evt, fn);
				
			},
			_addClickWrapper = function(obj, fn, touchCount, downId, upId, supportDoubleClick) {
				var handler = {
					down:false,
					touches:0,
					originalEvent:null,
					lastClick:null,
					timeout:null
				};
				var down = function(e) {						
					var ee = _unwrap(e), self = this, tc = _touchCount(ee);					
					if (tc == touchCount) {				
						handler.originalEvent = ee;	
						handler.touches = tc;										
						handler.down = true;							
						handler.timeout = window.setTimeout(function() {														
							handler.down = null;
						}, clickThreshold);
					}
				};
				fn[downId] = down;
				__bind(obj, touchstart, down);	
				var up = function(e) {										
					var ee =  _unwrap(e);					
					if (handler.down) {
						// if supporting double click, check if their is a timestamp for a recent click
						if (supportDoubleClick) {
							var t = new Date().getTime();
							if (handler.lastClick) {							
								if (t - handler.lastClick < doubleClickThreshold)
									fn(handler.originalEvent);
							}

							handler.lastClick = t;
						}					
						else 	
							fn(handler.originalEvent);						
					}
					handler.down = null;
					window.clearTimeout(handler.timeout);						
				};				
				fn[upId] = up;	
				__bind(obj, touchend, up);
			};

		
		this.bind = function(obj, evt, fn) {
			if (isTouchDevice) {			
				if (evt === click && wrapClick) {
					_addClickWrapper(obj, fn, 1, ta_down, ta_up);
				}
				else if (evt === dblclick && wrapDblClick) {
					_addClickWrapper(obj, fn, 1, ta_down, ta_up, true);
				}
				else if (evt === contextmenu && wrapContextMenu) {
					_addClickWrapper(obj, fn, 2, ta_context_down, ta_context_up);
				}
				else if (evt === mousedown && wrapDown) {
					__bind(obj, touchstart, fn);	
				}
				else if (evt === mouseup && wrapUp) {
					__bind(obj, touchend, fn);
				}			
				else if (evt === mousemove && wrapMove) {
					__bind(obj, touchmove, fn);
				}
				else
					__bind(obj, evt, fn);
			}
			else 
				__bind(obj, evt, fn);

			return self;
		};

		this.unbind = function(obj, evt, fn) {
			if (isIOS) {
				if (evt === click && wrapClick) {					
					_unbind(obj, touchstart, fn[ta_down]);
					fn[ta_down] = null;
					_unbind(obj, touchend, fn[ta_up]);
					fn[ta_up] = null;
				}
				else if (evt === contextmenu && wrapContextMenu) {
					_unbind(obj, touchstart, fn[ta_context_down]);
					fn[ta_context_down] = null;
					_unbind(obj, touchend, fn[ta_context_up]);
					fn[ta_context_up] = null;
				}
				else if (evt == mousedown && wrapDown) {
					_unbind(obj, touchstart, fn);	
				}
				else if (evt == mouseup && wrapUp) {
					_unbind(obj, touchend, fn);
				}	
				else if (evt == mousemove && wrapMove) {
					_unbind(obj, touchmove, fn);
				}
				else
					_unbind(obj, evt, fn);
			}
			_unbind(obj, evt, fn);

			return self;
		};
	};

})();
