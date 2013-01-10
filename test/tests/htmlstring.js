module = QUnit.module;

var HtmlString = testObject;

module("HtmlString");

test("test htmlstring.js functions", function() {
	expect(2);
	var string = "<string>";
	var htmlString = HtmlString(string);
	strictEqual(true, htmlString instanceof HtmlString, "HtmlString initialized without `new` returns a new HtmlString");
	strictEqual(true, string === htmlString.toString(), "toString() returns original value");
});