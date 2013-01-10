/*!
 * Razor
 * Copyright(c) 2012 David Murdoch <david@davidmurdoch.com>
 * MIT Licensed
 */

var HtmlString = function( str ) {
	if ( str instanceof HtmlString ) {
		return str;
	}
	if( !(this instanceof HtmlString) ){
		return new HtmlString( str );
	}
	this.str = str;
	return this;
}
HtmlString.prototype.toString = function() {
	return this.str;
};

exports = module.exports = HtmlString;