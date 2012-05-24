/*!
 * Razor
 * Copyright(c) 2012 David Murdoch <david@davidmurdoch.com>
 * MIT Licensed
 */

var Utils = require( "./utils" ),
	HtmlString = require( "./htmlstring" ),
	Html = function(){};

function throwIfNotString( obj ){
	if( toString.call( obj ) !== "[object String]" ){
		throw new Error("Function only accepts Strings");
	}
}

Html = {
	/**
	 * Creates an HtmlString (Html.toString does *not* escape the HTML in this type Object)
	 * 
	 * @param {String} string The HTML string. 
	 * @return {HtmlString} a new HtmlString 
	 */
	"Raw": function( string ) {
		string = string || "";
		throwIfNotString( string );
		return new HtmlString( string );
	},
	
	/**
	 * Converts a string to an HTML encoded string: 
	 * 
	 * @param {String} string The string to encode into HTML.
	 * #return {String} The HTML encoded string 
	 */
	"Encode": function( string ) {
		throwIfNotString( string );
		return Utils.escapeHTML( string );
	},
	
	/**
	 * Converts objects to an HTML encoded string with some exceptions:
	 *  * if the object === undefined return an empty string
	 *  * if the object is an instance of HtmlString, return its raw toString() value
	 * 
	 * @param {Object} value The object to convert to a string.
	 */
	"toString": function( value ) {
		if ( value instanceof HtmlString ) {
			return value.toString();
		}
		else {
			return value === undefined ? "" : Html.Encode( value+""  );
		}
	}
	
};

exports = module.exports = Html;