/*!
 * Razor
 * Copyright(c) 2012 David Murdoch <david@davidmurdoch.com>
 * MIT Licensed
 */

var Utils = require( "./utils" ),
	HtmlString = require( "./htmlstring" ),
	Html = function(){},
	Razor = require("./razor.js");

Html = {
	/**
	 * Creates an HtmlString (Html.toString does *not* escape the HTML in this type Object)
	 *
	 * @param {String} string The HTML string.
	 * @return {HtmlString} a new HtmlString
	 */
	"Raw": function( string ) {
		string = string || "";
		return new HtmlString( string+"" );
	},

	/**
	 * Converts a string to an HTML encoded string:
	 *
	 * @param {String} string The string to encode into HEncodeTML.
	 * @return {String} The HTML encoded string
	 */
	"Encode": function( string ) {
		return Utils.escapeHTML( string+"" );
	},

	/**
	 * Renders the specified partial view as an HTML-encoded string.
	 *
	 * @param {String} The name of the partial view to render.
	 * @param {Object} The mode for the partial view (optional).
	 * @return {HtmlString} The partial view that is rendered as an HTML-encoded string.
	 */
	"Partial": function( partialViewName, model ) {
		var html = undefined;
		// this looks async, but it isn't.
		Razor.renderFile( partialViewName, model || {}, function( _, _html ){
			html = _html;
		});
		return new HtmlString( html );
	},

	/**
	 * Creates an encoded URL component HtmlString
	 *
	 * @param {String} string The URL component
	 * @return {HtmlString} a new HtmlString
	 */
	"encodeURIComponent": function( string ){
		string = string || "";
		string = encodeURIComponent( string+"" ).replace(/%5B/g, '[').replace(/%5D/g, ']');
		return new HtmlString( string );
	},

	/**
	 * Creates a encoded URL HtmlString
	 *
	 * @param {String} string The full URL
	 * @return {HtmlString} a new HtmlString
	 */
	"encodeURI": function( string ){
		string = string || "";
		string = encodeURI( string+"" ).replace(/[!'()*]/g, escape);
		return new HtmlString( string );
	},

	/**
	 * Converts objects to an HTML encoded string with some exceptions:
	 *  * if the object === undefined return an empty string
	 *  * if the object is an instance of HtmlString, return its raw toString() value
	 *
	 * @param {Object} value The object to convert to a string.
	 * @return {String} the Html encoded string.
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