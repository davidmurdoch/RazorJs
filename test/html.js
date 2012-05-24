module = QUnit.module;

var Html = testObject;
var HtmlString = require("../lib/htmlstring.js");

module("Html");

test("test html.js functions", function() {
	expect(7);
	
	var string = "<string>";
	var htmlstring = Html.Raw(string);
	ok(htmlstring instanceof HtmlString, "Html.Raw returns HtmlString");
	
	equal(Html.Raw(), "", "Html.Raw returns empty string for null/undefined values");
	
	equal(Html.Encode(string), "&lt;string>", "Html.Encode(html) returns encoded HTML");
	
	equal(Html.toString(string), "&lt;string>", "Html.toString(html) returns escaped HTML");
	
	equal(Html.toString(htmlstring), string, "Html.toString(HtmlString) returns raw HTML");
	
	equal(Html.toString(undefined), "", "Html.toString(undefined) returns an empty string");
	
	raises( function(){ Html.Encode( {} ) }, "Html.Encode throws if non-string is passed in" );
});