/*!
 * Razor
 * Copyright(c) 2012 David Murdoch <david@davidmurdoch.com>
 * MIT Licensed
 */


var rreserved = new RegExp("^(?:" + [
	"break",
	"case",
	"catch",
	"continue",
	"debugger",
	"default",
	"delete",
	"do",
	"else",
	"finally",
	"for",
	"function",
	"if",
	"in",
	"instanceof",
	"new",
	"return",
	"switch",
	"this",
	"throw",
	"try",
	"typeof",
	"var",
	"void",
	"while",
	"with",
	"class",
	"enum",
	"export",
	"extends",
	"import",
	"super",
	"implements",
	"interface",
	"let",
	"package",
	"private",
	"protected",
	"public",
	"static",
	"yield",
	"null",
	"true",
	"false"
].join("|") + ")$");

var isReserved = exports.isReserved = function(name){
	return rreserved.test(name);
}

// regex to get a valid JS name from a long string.
exports.rGetJSName = /^[a-z_$][a-z0-9_$]*/i;

// regex to check if a string is a valid JS name
var rJSValidName = /^[a-z_$][a-z0-9_$]*$/i;

exports.isValidName = function(str){
	return rJsNames.test(str) && !isReserved(str);
};