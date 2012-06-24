/*
	Wraps touch events and presents them as mouse events: you register for standard mouse events such as 
	click, mousedown, mouseup and mousemove, and the touch adapter will automatically register corresponding
	touch events for each of these.  note that 'click' is achieved through setting a timer on touchstart and
	firing an event on touchend if the timer has not yet expired. The delay for this timer can be set on 
	the touchadapter's constructor (clickDelay); the default is 150ms.

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

	var isIOS = ((/iphone|ipad/gi).test(navigator.appVersion)),
		isAndroid = false,
		click = "click", mousedown = "mousedown", mouseup = "mouseup", mousemove = "mousemove",
		touchstart = "touchstart", touchend = "touchend", touchmove = "touchmove",
		contextmenu = "contextmenu", ta_is_down = "__touchAdaptorIsDown", ta_timeout = "__touchAdaptorTimeout",
		ta_down = "__touchAdapterDown", ta_up = "__touchAdapterUp", 
		ta_context_down = "__touchAdapterContextDown", ta_context_up = "__touchAdapterContextUp",
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
		var _bind = params.bind || addEvent,
			_unbind = params.unbind || removeEvent,
			_unwrap = params.unwrap || function(e) { return e; },
			wrapClick = params.wrapClick !== false,
			clickDelay = params.clickDelay || 150,
			wrapContextMenu = params.wrapContextMenu !== false,
			wrapDown = params.wrapDown !== false,
			wrapUp = params.wrapUp !== false,
			wrapMove = params.wrapMove !== false,
			_getTouchCount = function(e) {
				var t = 1;
				if (e.touches) {
					t = e.touches.length;	  // what about android? and other mobile browsers?
				}				
				return t;
			},
			_addClickWrapper = function(obj, fn, touchCount, downId, upId) {
				var down = function(e) {						
					var ee = _unwrap(e), self = this, tc = _getTouchCount(ee);					
					if (tc == touchCount) {
						self.originalEvent = ee;											
						obj[ta_is_down] = true;										
						obj[ta_timeout] = window.setTimeout(function() {									
							obj[ta_is_down] = null;
						}, clickDelay);
					}
				};
				fn[downId] = down;
				_bind(obj, touchstart, down);	
				var up = function(e) {					
					var ee =  _unwrap(e);
					if (obj[ta_is_down]) fn(fn[downId].originalEvent);						
					obj[ta_is_down] = null;
					window.clearTimeout(obj[ta_timeout]);						
				};				
				fn[upId] = up;	
				_bind(obj, touchend, up);
			};
		
		this.bind = function(obj, evt, fn) {
			if (isIOS) {			
				if (evt === click && wrapClick) {
					_addClickWrapper(obj, fn, 1, ta_down, ta_up);
				}
				else if (evt === contextmenu && wrapContextMenu) {
					_addClickWrapper(obj, fn, 2, ta_context_down, ta_context_up);
				}
				else if (evt === mousedown && wrapDown) {
					_bind(obj, touchstart, fn);	
				}
				else if (evt === mouseup && wrapUp) {
					_bind(obj, touchend, fn);
				}			
				else if (evt === mousemove && wrapMove) {
					_bind(obj, touchmove, fn);
				}
				else
					_bind(obj, evt, fn);
			}
			else 
				_bind(obj, evt, fn);
		};

		this.unbind = function(obj, evt, fn) {
			if (isIOS) {
				if (evt === click && wrapClick) {					
					_unbind(obj, touchstart, fn[ta_down]);
					fn[ta_down] = null;
					_unbind(obj, touchend, fn[ta_up]);
					fn[ta_up] = null;
				}
				else if (evt === click && wrapContextMenu) {
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
			}
			_unbind(obj, evt, fn);
		};
	};

})();
