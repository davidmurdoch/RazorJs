/*!
 * Razor
 * Copyright(c) 2012 David Murdoch <david@davidmurdoch.com>
 * MIT Licensed
 */

/**
 * Merge the contents of two or more objects together into the first object.
 * Pass boolean true as the first argument for deep extend.
 * 
 * @param {Object|Boolean} If true, the merge becomes recursive (aka. deep copy), otherwise an object that will receive the new properties if additional objects are passed in or that will extend the jQuery namespace if it is the sole argument.
 * @param {Object} [source1, source2, ...] An object containing additional properties to merge in.
 * @returns {Object} Returns the destination object.
 * @example
 *
 * Utils.extend({ 'name': 'moe' }, { 'age': 40 });
 * // => { 'name': 'moe', 'age': 40 }
 */
var extend = exports.extend = function() {
	// Most of extend is borrowed from jQuery.
	
	var options, name, src, copy, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false,
		objectProto= {}.__proto__,
		arrayProto = [].__proto__,
		fnProto = function(){}.__proto__,
		proto;
		
	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	
	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && target.__proto__ !== fnProto ) {
		target = {};
	}
		
	for (; i < length; i++ ) {
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];
				
				// Prevent never-ending loop
				if ( target === copy ) { continue; }
				
				if ( deep && copy && ( proto = copy.__proto__ ) && ( proto === objectProto || proto === arrayProto ) ) {
					clone = src && src.__proto__ === proto ? src : new proto.constructor;;

					// Never move original objects, clone them
					target[ name ] = extend( deep, clone, copy );
				}
				// Don't bring in undefined values
				else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}
	return target;
};

/**
 * Escapes a string for insertion into HTML, replacing `&`, `<`, `"`, `'`,
 * and `/` characters.
 *
 * @param {String} string The string to escape.
 * @returns {String} Returns the escaped string.
 * @example
 *
 * Utils.escapeHTML('Curly, Larry & Moe');
 * // => "Curly, Larry &amp; Moe"
 */
exports.escapeHTML = function( string ){
	//escapeHTML is borrowed from Lo-Dash v0.2.0 <http://lodash.com>
	
    // the `>` character doesn't require escaping in HTML and has no special
    // meaning unless it's part of a tag or an unquoted attribute value
    // http://mathiasbynens.be/notes/ambiguous-ampersands (semi-related fun fact)
	return ( string + '' )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#x27;' )
		.replace( /\//g, '&#x2F;' );
};

/**
 * Escapes values in a regular expression for use as a JS string for eval later
 * 
 * @param {String} regex The regular expression to escape.
 * @returns {String} Returns the escaped regular express
 */
exports.RegExpEscape = (function(){
	var rescape = /[\/.?*+^$[\]\\(){}|-]/g;
	return function( regex ){
		return ( regex + '' )
			.replace( rescape, '\\$&' );
	};
}());