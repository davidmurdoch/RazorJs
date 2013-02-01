/*!
 * Razor
 * Copyright(c) 2012 David Murdoch <david@davidmurdoch.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Utils = require( "./utils" ),
	Proxy = require("node-proxy"),
	Parser = require( "./parser" ),
	Html = require( "./html" ),
	_ = require( "lodash" ),
	fs = require( "fs" ),
	nil = require( "nil" );


/**
 * Library version.
 */

exports.version = "0.1.1alpha4";

var parse = function ( str, options ) {
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

/**
 * We can take an object and watch it for ALL JS access.
 * This mean if we look up a property on the current context without
 * using `this` we can determine if that property exists on the object.
 * Basically, we lie to the V8 runtime when it asks if the property exists:
 * we always say it does.
 *
 * You might think this has severe issues (and it might) but when V8 asks
 * *for* the actual property itself we give it the value `undefined` ...
 * exactly like `this.notDefinedProperty` does.
 *
 * Now our issue is that undefined.toString() === "undefined". To fix that
 * our overridden ToString method in html.js ALWAYS returns an empty string
 * when a property === `undefined`.
 *
 * @param {Object} obj The object we need to run through our proxy
 * @return {Object} The handler
 */
var handlerMaker = function(obj) {
	return {
		"hasOwn": function(name) {
			return true;
			//return Object.prototype.hasOwnProperty.call(obj, name);
		},
		"get": function(receiver, name) {

			var val = obj[ name ];
			if ( (val === undefined || val === null) && val !== nil.nil ) {
				val = nil.nil;
			}
			// not everything can be Proxied, like Streams and JSON. :-(
			// this means that the http `request` and response objects can't be proxied.
			else if ( ( (val.constructor == Object || Object.prototype.toString.call( val ) == "[object Object]") && val.toString() !== "[object JSON]") || val.constructor == Array ) {
				val = getProxy( val );
			}

			return val;
		},
		"set": function(receiver, name, val) {
			obj[name] = val;
			return true;
		},
		/* fixes for(var name in obj) {}*/
		"enumerate": function() {
			var result = [];
			for (var name in obj) { result.push(name); };
			return result;
		},
	};
};

var getProxy = function( obj ){
	var prox = Proxy.create( handlerMaker( obj ), obj.constructor.prototype || Object.prototype );
	// JSON doesn't work on Proxies, so we need to keep a reference to the original.
	Proxy.hidden( prox, "original", obj );
	return prox;
}

// expose our Html functions to whoever is consuming us.
exports.Html = Html;

exports.compile = function( str, options ) {
	options = options || {};
	var fnStr = parse( String( str || "" ), options ),
		client = options.client,
		fn;

	if ( client ){
		fn = new Function( fnStr );
		return fn;
	}

	var compiledFn = function( locals ) {
		var args = _.keys(locals),
			fn, razor = getProxy({});

		args.push( fnStr );

		fn = Function.apply( null, args );

		razor.Model = locals;
		_.extend( razor, global, locals );

		// expose our Html functions
		razor.Html = Html;

		// expose our JSON object
		razor.JSON = {
			"parse": JSON.parse,
			"stringify": function(object){
				return JSON.stringify( Proxy.isProxy( object ) ? Proxy.hidden( object, "original" ) : object );
			}
		}

		// add a RenderBody function
		razor.RenderBody = function (){
			return locals && locals.body !== undefined ? Html.Raw( locals.body ) : "";
		};

		razor.console = console;

		return fn.apply( razor, _.values( locals ) );
	};

	compiledFn.fn = fnStr;
	return compiledFn;
}

/**
 * Render the given `str` of razor and invoke
 * the callback `fn(err, str)`.
 *
 * Options:
 *
 *   - `cache` enable template caching
 *   - `filename` filename required for `include` / `extends` and caching
 *
 * @param {String} str
 * @param {Object|Function} options or fn
 * @param {Function} fn
 * @api public
 */

exports.render = function(str, options, fn){
	// swap args
	if (typeof options === 'function') {
		fn = options, options = {};
	}

	// cache requires .filename
	if (options.cache && !options.filename) {
		return fn(new Error('the "filename" option is required for caching'));
	}

	try {
		var path = options.filename,
    		tmpl = options.cache
				? exports.cache[path] || (exports.cache[path] = exports.compile(str, options))
				: exports.compile(str, options);

		fn(null, tmpl(options));
	} catch (err) {
		fn(err);
	}
};

/**
 * Render a Razor file at the given `path` and callback `fn(err, str)`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function} fn
 * @api public
 */

exports.renderFile = function(path, options, fn){

	var key = path + ':string';

	if ( typeof options === "function" ) {
		fn = options;
		options = {};
	}

	try {
		path = options.filename = path.replace("/", "\\");

		var str = options.cache
			? exports.cache[key] || (exports.cache[key] = fs.readFileSync(path, 'utf8'))
			: fs.readFileSync(path, 'utf8');
		exports.render(str, options, function( _, html ){
			if ( options.layout ) {
				options.body = html;
				var path = options.layout;
				delete options.layout;

				exports.renderFile(path, options, function( _, html ){
					fn( _, html );
				});
			}
			else {
				fn( _, html );
			}
		});
	} catch (err) {
		fn(err);
	}
};

/**
 * Express support.
 */

exports.__express = exports.renderFile;