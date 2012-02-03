/*!
 * Razor
 * Copyright(c) 2012 David Murdoch <david@vervestudios.co>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Utils = require( "./utils" ),
	Parser = require( "./parser" ),
	Html = require( "./html" ),
	fs = require( "fs" );


/**
 * Library version.
 */

exports.version = '0.1.0';

var parse = function ( str, options ) {
	var filename = options.filename;

	// normalize newlines.
	str = str.replace( /\r\n|\r/g, "\n" )
		// and backslashes
		.replace(/\\/g, "\\\\");
	
	var parser = new Parser( str, options ),
		js = parser.parse(),
		out;

	out = [
		"this.buffer=[];",
		"with(this){",
			js,
		"}",
		"return this.buffer.join('');"
	];
	
	return out.join( "\n" );
}

exports.compile = function( str, options ) {
	options = options || {};
	var fn = parse( String( str ), options ),
		client = options.client,
		razor = {};

	fn = new Function( fn );

	if ( client ){
		return fn;
	}

	return function( locals ) {
		razor.Razor = locals;
		razor.Html = Html;
		// add a RenderBody function
		if( locals && locals.body ){
			var body = Html.Raw( locals.body );
			razor.RenderBody = function (){ return body; };
		}
		
		return fn.call( razor );
	};
}