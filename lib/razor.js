/*!
 * Razor
 * Copyright(c) 2012 David Murdoch <david@davidmurdoch.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Utils = require( "./utils" ),
	Parser = require( "./parser" ),
	Html = require( "./html" ),
	_ = require( "lodash" ),
	fs = require( "fs" );


/**
 * Library version.
 */

exports.version = "0.1.1alpha1";

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
 * when a preoprty === `undefined`.
 *
 * @param {Object} obj The object we need to run through our proxy
 * @return {Object} The handler
 */
var handlerMaker = function(obj) {
	return {
		/*fix: function() {
			if(Object.isFrozen(obj)) {
				return Object.getOwnPropertyNames(obj).map(function(name) {
					return Object.getOwnPropertyDescriptor(obj, name);
				});
			}
			// As long as obj is not frozen, the proxy won't allow itself to be fixed
			return undefined;
			// will cause a TypeError to be thrown
		},
		// derived traps
		has: function(name) {
			return name in obj;
		},*/
		"hasOwn": function(name) {
			return true;
			//return Object.prototype.hasOwnProperty.call(obj, name);
		},
		"get": function(receiver, name) {
			return obj[name];
		},
		"set": function(receiver, name, val) {
			obj[name] = val;
			return true;
		}/*,
		// bad behavior when set fails in non-strict mode
		enumerate: function() {
			var result = [];
			for(name in obj) {
				result.push(name);
			};
			return result;
		},
		keys: function() {
			return Object.keys(obj)
		}*/
	};
};

var getProxy = function( obj ){
	var Proxy = require("node-proxy");

	return Proxy.create( handlerMaker( obj ), Object.prototype );
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
			fn, razor = {};

		args.push( fnStr );

		fn = Function.apply( null, args );

		razor.Model = locals;
		_.extend( razor, global, locals );

		// expose our Html functions
		razor.Html = Html;

		// expose our JSON object
		razor.JSON = JSON;

		// add a RenderBody function
		razor.RenderBody = function (){
			return locals && locals.body !== undefined ? Html.Raw( locals.body ) : "";
		};

		razor.console = console;

		return fn.apply( getProxy( razor ), _.values(locals) );
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
  if ('function' == typeof options) {
    fn = options, options = {};
  }

  // cache requires .filename
  if (options.cache && !options.filename) {
    return fn(new Error('the "filename" option is required for caching'));
  }

  try {
    var path = options.filename;
    var tmpl = options.cache
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

  if ('function' == typeof options) {
    fn = options, options = {};
  }

  try {
    options.filename = path;
    var str = options.cache
      ? exports.cache[key] || (exports.cache[key] = fs.readFileSync(path, 'utf8'))
      : fs.readFileSync(path, 'utf8');
    exports.render(str, options, fn);
  } catch (err) {
    fn(err);
  }
};

/**
 * Express support.
 */

exports.__express = exports.renderFile;