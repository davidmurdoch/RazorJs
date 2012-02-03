/*!
 * Razor
 * Copyright(c) 2012 David Murdoch <david@vervestudios.co>
 * MIT Licensed
 */

// Most of extend is borrowed from jQuery.
var extend = exports.extend = function() {
	var target = arguments[0] || {},
		length = arguments.length,
		deep = false,
		i = 1, props,
		objectProto= {}.__proto__,
		arrayProto = [].__proto__;
		
	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
		
	for (; i < length; i++ ) {
		if ( (from = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in from ) {
				var src = target[ name ],
					copy = from[ name ],
					proto, copyIsArray, clone;
				
				// Prevent never-ending loop
				if ( target === copy ) { return; }
				
				if ( deep && copy ) {
					proto = copy.__proto__;
					if( proto === objectProto || (copyIsArray = proto === arrayProto) ) {
						if ( copyIsArray ) {
							copyIsArray = false;
						}
						clone = src && src.__proto__ === proto ? src : new proto.constructor

						// Never move original objects, clone them
						target[ name ] = extend( deep, clone, copy );
					}
				}
				// Don't bring in undefined values
				if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}
	return target;
};

exports.escapeHTML = (function(){
	var escapeMap = {
			"&": "&#38;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&#34;",
			"'": "&#39;"
		},
		rescapeHTML = /&(?!\w+;)|[<>"'\\]/g;
	return function(string){
		return String(string).replace(rescapeHTML, function (s) {
			return escapeMap[s] || s;
		});
	};
}());

exports.RegExpEscape = (function(){
	var rescape = /[-[\]{}()*+?.,\\^$|#\s]/g;
	return function(str){
		return str.replace(rescape, "\\$&");
	};
}());