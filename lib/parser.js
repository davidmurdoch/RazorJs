/*!
 * Razor
 * Copyright(c) 2012 David Murdoch <david@davidmurdoch.com>
 * MIT Licensed
 */


/**
 * Module dependencies.
 */

var Rules = require( './rules' ),
	HtmlString = require( './htmlstring' ),
	Html = require( './html' ),
	Utils = require( './utils' );

var Parser = function( str, options ) {
	this.options = options = options || {};

	this.input = this.future = str;

	this.end = str.length;
	this.position = 0;
	this.output = [];

	// allow regex characters to be tags by escaping them.
	this.rawTag = options.tag || Parser.defaultTag;
	var tag = this.tag = Utils.RegExpEscape( this.rawTag );
	this.rtag = new RegExp( "(^|(" + tag + "+?)|[^" + tag + "])" + tag + "(?:[^" + tag + "]|$)" );
};

Parser.defaultTag = "@";

Parser.rtemplate = /[\.\[\(]/;
Parser.rregExp = /(^|[\[(&<>~\^|=%*\/+\-]\s*)$/;

Parser.findClosing = function( open, close, str, checkForHtml ) {
	var i = 0,
		length = str.length,
		inRegex = false,
		inComment = false,
		inString = false,
		inAposString = false,
		inQuoteString = false,
		inHtml = false,
		nestLevel = 0,
		prev = null,
		cur = null,
		prevs = [],
		escapeLevel = 0,
		next = null,
		peek = function() {
			return str[ i+1 ];
		},
		nextLine = function() {
			var line = str.slice( i ).indexOf( "\n" );
			if( ~line ) {
				i += line;
			}
		};

	for (; i < length; i++ ){
		// keep track of all previous characters
		if ( prev ){
			prevs.push( prev );
		}
		prev = cur;
		cur = str[i];
		next = peek();

		// keep track of escape characters
		if ( prev === "\\" ) {
			escapeLevel++;
		}
		else {
			escapeLevel = 0;
		}

		var isEscaping = escapeLevel % 2 === 1;

		// if the next character is our closing character
		if ( close === cur ) {
			// and we are just floating about
			if( !inString && !inRegex && !inComment ){
				nestLevel--;
				if( nestLevel === 0 ){
					return i;
				}
				continue;
			}
		}
		// if the next character is another opening character (but not the first)
		else if ( open === cur ) {

			if ( !inString && !inRegex && !inComment ) {
				nestLevel++;
				continue;
			}
		}
		else {
			if ( checkForHtml ) {
				if ( cur === "<" ) {
					if ( !inRegex && !inString && !inComment ) {
						if ( inHtml ) {
							if( next === "/" ) {
								i++;
								inHtml = false;
							}
						}
						else {
							inHtml = true;
						}
						continue;
					}
				}
				if( inHtml ) { continue; }
			}

			// comments and regexes start and end with "/"
			// but only if the previous characters don't imply division, e.g., 1 / 2 ).
			if ( cur === "/" ) {
				/*********** COMMENTS ***************/
				// Check for comment: we can't have a comment in a regex or string
				if ( !inRegex && !inString ) {
					// see if we are opening a comment
					if ( !inComment ) {

						// if the next character would open a comment skip to the next line.
						if ( next === "/" ) {
							nextLine();
							continue;
						}
						else if ( next === "*" ) {
							i++;
							// we are in a multi-line comment now.
							inComment = true;
							continue;
						}
					}
					else {
						// since we are in multi-line comment see if we can close the comment now:
						if ( prev === "*" ) {
							inComment = false;
						}
						continue;
					}
				}
				/*********** /COMMENTS **************/

				/*********** Regex ***************/
				// if we are not in a string
				if ( !inString ) {
					// and already in a regex
					if ( inRegex ) {
						// and the precending escapeCharacters pattern isn't cancelling us out
						//    if we have 4 "\" characters in a row preceding our "/" then `escapeLevel = 4;`
						//        4 % 2 === 1. However, any odd number of consecutive "\"s cancels our "\" character.
						// TODO: Take care of character sets in regexes. /[/]/ is a valid regex.
						if ( !isEscaping ) {
							// the "/" character that got us here just closed this regex.
							inRegex = false;
						}
						// since we ARE in a regex and nothing has closed us, keep on trucking.
					}
					else {
						// TODO: a regex can't just appear out of the blue like this.
						//       It is only valid in certain contexts. Need to figure out
						//       a way to detect those cases more thoroughly than this.
						// Valid previous non-whitespace chars are: [, (, &, <, >, ~, ^, |, =, %, *, /, +, and -
						if ( Parser.rregExp.test( prevs.join( "" ) ) ) {
							inRegex = true;
						}
					}
				}
				/*********** /Regex **************/
				// we don't care if we are in a string or not at this point.
				continue;
			}

			/*********** String ***************/
			// if we are in a regex or comment there is no point in being here.
			if ( !inRegex && !inComment ) {
				if ( inString ) {
					if ( !isEscaping ) {
						if ( inAposString && cur === "'" ) {
							inAposString = inString = false;
						}
						else if ( inQuoteString && cur === '"' ) {
							inQuoteString = inString = false;
						}
					}
				}
				else {
					if ( cur === "'" ) {
						inAposString = inString = true;
					}
					else if ( cur === '"' ) {
						inQuoteString = inString = true;
					}
				}
			}
			/*********** /String **************/
		}
	}
	return -1;
};

Parser.prototype = {
	"parse": function() {
		while ( this.more() ) {
			this.next();
		}
		return this.output.join( "\n" );
	},
	"more": function() {
		return this.position < this.end;
	},
	"peek": function() {
		return this.lookahead( 1 );
	},
	"lookahead": function( length ) {
		return this.slice( this.position, this.position + length );
	},
	"slice": function( start, end ){
		return this.input.slice( start, end );
	},
	"push": function( str, toBuffer ) {
		if ( toBuffer ) {
			this.output.push( "buffer.push(" + str + ");" );
		}
		else {
			this.output.push( str );
		}
	},
	"advance": function() {
		// if we are marked as a block we need to parse this section as a block
		if(this.options.isBlock){
			this.options.isBlock = false;
			return;
		}
		else{
			// advance up to the next @ sign
			var sliced = this.input.slice( this.position ),
				match = this.rtag.exec( sliced ),
				pos, str, future,
				advance = false;

			// if we have a match, and the number of this.tags preceding it does not escape the match
			// we have a real match!
			if( match ){
				if((match[2] === undefined || match[2].length % 2 === 0)){
					// our regex can match the end of the string
					pos = match.index + (match[1]==="" ? 0 : 1);

					// append any characters we are skipping over to the output
					str = sliced.slice( 0, pos );
					pos++;

					future = sliced.slice( pos );
				}
				else{
					// that @ was a false alarm. tell this function to advance again.
					advance = true;

					pos = match.index + match[0].length;

					// we are at the end of the input so we add
					// the remaining text to the output
					str = sliced.slice( 0, pos ).replace(new RegExp(this.tag + this.tag, "g"), this.tag);

					future = sliced.slice( pos );
				}
			}
			else {
				// we are at the end of the input so we add
				// the remaining text to the output
				str = sliced.replace(new RegExp(this.tag + this.tag, "g"), this.tag);

				// then move our position to the end.
				pos = this.end;
				future = "";
			}
		}

		this.position += pos;
		this.push( "'" + str.replace(/\n/g, "\\n").replace(/'/g, "\\'") + "'", true );
		this.future = future;

		if(advance){
			this.advance();
		}
	},
	"next": function() {
		// go to the next position
		this.advance();

		// append
		var val =
				this.is( "block" )
			||	this.is( "parentheticalStatement" )
			// TODO: implement do and else
			//|| this.is( "do" )
			//|| this.is( "else" )
			||	this.is( "var" );

		// Html.toString converts a string to an HTML encoded string and HtmlStrings don't change.
		if ( val ) {
			this.push( "\nHtml.toString(" + val + ")\n", true );
		}
	},
	// execute the corresponding function, if possible
	"is": function( type ) {
		return this[ type ] ? this[ type ]() : false;
	},

	"buildTemplate": function( name, future ) {
		var length = name.length,
			sliced = future.slice( length ),
			next = sliced[0],
			tmpl = "";

		// test for things like `obj.name`, obj["name"], obj ("calling");
		if ( Parser.rtemplate.test( next ) ) {
			// Looks like we are a function call or property lookup, probably.
			if( next === "(" || next === "[" ) {
				var closingTag = next === "(" ? ")" : "]",
					closingIndex = Parser.findClosing( next, closingTag, sliced );

				// uh oh, we don't have a closing character!
				if ( closingIndex === -1 ) {
					throw "Syntax Error: An opening \"" + next + "\" is missing the corresponding closing \"" + closingTag + "\".";
				}
				else {
					tmpl = future.slice( 0, closingIndex + length + 1 );

					// keep on truckin:
					tmpl = this.buildTemplate( tmpl, future );
				}
			}
			// dot syntax
			else if ( next === "." ) {
				this.future = sliced.slice(1);
				var postDot = this["var"]();
				tmpl = name + "." + postDot;

				// this.var fast-forwards too far.
				this.position -= postDot.length;
			}
		}
		else {
			// this variable is all we got.
			tmpl = name;
		}
		return tmpl;
	},
	"parentheticalStatement": function( ){
		var ropeners = /^(if|else\s+if|while|for|switch)\s*/,
			future = this.future;

		if ( ropeners.test(future) ) {
			// we are in an parenthetical statement!

			// the {} block starts here:
			var openingBlockIndex = Parser.findClosing( "(", ")", this.future ),
				blockAndFuture = this.future.slice( openingBlockIndex + 1 ),

				// and ends here:
				closingBlockIndex = Parser.findClosing( "{", "}", blockAndFuture, true )

				var block = blockAndFuture.slice( 0, closingBlockIndex + 1 );

				var options = Utils.extend( true, {}, this.options, { "isBlock": true } );
				var parser = new Parser( block.trim(), options );

				var js = parser.parse();

			js = "\nHtml.Raw(function(){\nvar buffer = [];\n" + this.future.slice( 0, openingBlockIndex + 1 ) + "{\n" + js + "\n}\nreturn buffer.join('');\n"  + "}())\n";

			this.position += openingBlockIndex + 1 + closingBlockIndex + 1;
			return js;
		}

		return false;
	},
	"block": function( ){
		var future = this.future;

		if ( future[0] === "{" ) {
			var closingIndex = Parser.findClosing( "{", "}", future, true ),
				block = future.slice( 1, closingIndex ),
				lines = block.split("\n"),
				length = lines.length,
				i = 0, line,
				js = [],
				startHtml = /^(?:[^<]*;\s*<|\s*<)[^\/]/,
				endHtml = /^.*?(?:\/>|<\/)/,
				inHtml = 0,
				matchStart,
				matchEnd,
				bufferedLines = [];
			js.push( "/* closing index: " + closingIndex + "*/" );
			for (; i < length; i++ ) {
				line = lines[i];

				if ( line.trim() === "" ){ continue; }

				matchStart = startHtml.exec( line );
				matchEnd = endHtml.exec( line );

				if ( matchStart ) {
					inHtml++;
				}

				if ( inHtml > 0 ) {
					bufferedLines.push(line);
				}
				else {
					if(bufferedLines.length){
						js.push( new Parser( bufferedLines.join("\n"), this.options ).parse() );
						bufferedLines = [];
					}
					js.push( line );
				}

				if ( matchEnd ) {
					inHtml = Math.max(0, inHtml - 1);
				}
			}
			if(bufferedLines.length){
				js.push( new Parser( bufferedLines.join("\n"), this.options ).parse() );
			}

			this.position += block.length + 2;

			this.push( js.join("\n"), false );
		}
		return false;
	},
	"var": function() {
		var future = this.future,
			match = Rules.rGetJSName.exec( future ),
			name;
		if ( match ) {
			name = match[0];
			if ( !Rules.isReserved( name ) ) {
				// so we are officially a valid variable. :-)

				var tmpl = this.buildTemplate( name, future );

				this.position += tmpl.length;

				return tmpl;
			}
			else {
				throw "Razor SyntaxError: Unexpected token " + name;
			}
		}
		return false;
	}
};

exports = module.exports = Parser;