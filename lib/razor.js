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
	var fnStr = parse( String( str ), options ),
		client = options.client,
		razor = {}, fn;

	if ( client ){
		fn = new Function( fnStr );
		return fn;
	}

	return function( locals ) {
		var args = [],
			localsAsArray = [];
		for(var n in locals){
			args.push(n);
			localsAsArray.push(locals[n]);
		}
		args.push( fnStr );
		var fn = Function.apply( null, args );
		
		razor = locals;
		razor.Razor = locals;
		razor.Html = Html;
		
		// add a RenderBody function
		if( locals && locals.body ){
			var body = Html.Raw( locals.body );
			razor.RenderBody = function (){ return body; };
		}
		
		// Proxy is only available when node is started with:
		// --harmony (v 0.7.8+)
		// or
		// --harmony_proxies (v 0.6.x)
		if(global.Proxy){
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
             */
			function handlerMaker(obj) {
				return {
					// Fundamental traps
					getOwnPropertyDescriptor: function(name) {
						var desc = Object.getOwnPropertyDescriptor(obj, name);
						// a trapping proxy's properties must always be configurable
						if (desc !== undefined) { desc.configurable = true; }
						return desc;
					},
					getPropertyDescriptor:  function(name) {
						// getPropertyDescriptor doesn't work at all; so we check
						// getOwnPropertyDescriptor instead.
						var desc = Object.getOwnPropertyDescriptor(obj, name);
						// a trapping proxy's properties must always be configurable
						if (desc !== undefined) { desc.configurable = true; }
						// we ALWAYS return an object to prevent "property is not defined errors"
						return desc !== undefined ? desc : {};
						
						// old code that doesn't work:
						var desc = Object.getPropertyDescriptor(obj, name); // not in ES5
						// a trapping proxy's properties must always be configurable
						if (desc !== undefined) { desc.configurable = true; }
						return desc;
					},
					getOwnPropertyNames: function() {
						return Object.getOwnPropertyNames(obj);
					},
					getPropertyNames: function() {
						return Object.getPropertyNames(obj); // not in ES5
					},
					defineProperty: function(name, desc) {
						Object.defineProperty(obj, name, desc);
					},
					"delete":function(name) {
						return delete obj[name];
					},
					fix: function() {
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
					},
					hasOwn: function(name) {
						return Object.prototype.hasOwnProperty.call(obj, name);
					},
					get: function(receiver, name) {
						return obj[name];
					},
					set: function(receiver, name, val) {
						obj[name] = val;
						return true;
					},
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
					}
				};
			}
			
			var proxy = Proxy.create(handlerMaker( razor ));
			proxy.console = console;
			return fn.apply( proxy, localsAsArray );
		}
		else{
			return fn.apply( razor, localsAsArray );
		}
	};
}