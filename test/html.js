module = QUnit.module;

var Html = testObject;
var HtmlString = require("../lib/htmlstring.js");

module("Html");

test("test html.js functions", function() {
	expect(14);

	var string = "<string>";
	var htmlstring = Html.Raw(string);
	ok(htmlstring instanceof HtmlString, "Html.Raw returns HtmlString");

	equal(Html.Raw(), "", "Html.Raw returns empty string for null/undefined values");

	equal(Html.Encode(string), "&lt;string>", "Html.Encode(html) returns encoded HTML");

	equal(Html.toString(string), "&lt;string>", "Html.toString(html) returns escaped HTML");

	equal(Html.toString(htmlstring), string, "Html.toString(HtmlString) returns raw HTML");

	equal(Html.toString(undefined), "", "Html.toString(undefined) returns an empty string");

	equal( Html.Encode( 1.234 ), "1.234", "Html.Encode converts Numbers to strings correctly" );

	equal( Html.Encode( true ), "true", "Html.Encode converts Booleans to strings correctly" );

	equal( Html.Encode( {} ), "[object Object]", "Html.Encode converts Objects to strings correctly" );
	equal( Html.Encode( {"foo":"bar"} ), "[object Object]", "Html.Encode converts Objects to strings correctly" );

	equal( Html.Encode( [] ), "", "Html.Encode converts Arrays to strings correctly" );

	equal( Html.Encode( ["uno","dos"] ), "uno,dos", "Html.Encode converts Arrays to strings correctly" );

	equal( Html.encodeURI( "https://www.example.com/path?query=Thyme &time=again" ).toString(),
		"https://www.example.com/path?query=Thyme%20&time=again",
		"Html.encodeURI works as expected"
	);

	equal( Html.encodeURIComponent( "Thyme &time=again" ).toString(),
		"Thyme%20%26time%3Dagain",
		"Html.encodeURIComponent works as expected"
	);
});