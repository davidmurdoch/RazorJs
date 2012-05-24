/*!
 * Razor
 * Copyright(c) 2012 David Murdoch <david@davidmurdoch.com>
 * MIT Licensed
 */

var Utils = require( "./utils" ),
	HtmlString = require( "./htmlstring" ),
	Html;

var Html = {
	"Raw": function( str ) {
		return new HtmlString( str );
	},
	
	"Encode": function( value ) {
		return Utils.escapeHTML( value );
	},
	
	"ToString": function( value ) {
		if ( value instanceof HtmlString ) {
			return value.toString();
		}
		else {
			return value === undefined ? "" : Html.Encode( value  );
		}
	}
};

exports = module.exports = Html;