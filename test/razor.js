module = QUnit.module;

var Razor = testObject;

module("Razor");

test("test razor.js functions", function() {

	expect(24);

	compile = Razor.compile("<div>@message</div>");
	object = {"message":"hello world"};
	equal(compile(object), "<div>hello world</div>", "Test simple compilation");

	compile = Razor.compile("@if(true){\n if(true){\n  <span>true</span>\n }\n}");
	equal(compile({}), "  <span>true</span>", "Nested blocks");

	compile = Razor.compile("@{\n if(true){\n  <span>true</span>\n }\n}");
	equal(compile({}), "  <span>true</span>", "Nested blocks 2");

	compile = Razor.compile("<ul>@for(var name in obj){<li>@obj[name]</li>}</ul>");
	object = {"obj":{"foo":"foo", "bar":"bar"}};
	equal(compile(object), "<ul><li>foo</li><li>bar</li></ul>", "Test for name in obj");

	compile = Razor.compile(
		'<div>\n' +
		'	@if(true){\n' +
		'		<div>\n' +
		'			@if(true){\n' +
		'				<div>@value</div>\n' +
		'			}' +
		'		</div>\n' +
		'	}\n' +
		'</div>');
	object = {"value":"true"};
	equal(compile(object),
		'<div>\n' +
		'			<div>\n' +
		'							<div>true</div>' +
		'		</div>\n' +
		'</div>'
	, "Test nested templates w/ HTML");


	compile = Razor.compile("<div>@if(bool){<span>true</span>}</div>");
	object = {"bool":true};
	equal(compile(object), "<div><span>true</span></div>", "Test if(true)");


	object.bool = false;
	equal(compile(object), "<div></div>", "Test if(false)");


	compile = Razor.compile("<div>@Html.Raw(message)</div>");
	object = {"message": "<goodbye cruel='world!'>\"Hi\""};
	equal(compile(object), "<div><goodbye cruel='world!'>\"Hi\"</div>", "Test Html.Raw");


	compile = Razor.compile("<ul>@while(--i){<li>@i}</ul>");
	object = {"i": 6};
	equal(compile(object), "<ul><li>5<li>4<li>3<li>2<li>1</ul>", "Test while()");


	compile = Razor.compile("<div>\n" +
	"@{\n" +
		"<div>@message</div>\n" +
	"}\n" +
	"</div>");
	object = {"message": "test"};
	equal(compile(object), "<div>\n<div>test</div>\n</div>", "Test code block");


	compile = Razor.compile("<div>\n" +
	"@{\n" +
		"<img src='@Html.Raw(src)' />\n" +
	"}\n" +
	"</div>");
	object = {"src": "//localhost/img.png"};
	equal(compile(object), "<div>\n<img src='//localhost/img.png' />\n</div>", "Test template with self-closing tag");


	compile = Razor.compile("@@escaped");
	object = {};
	equal(compile(object), "@escaped", "Simple @ escape");


	compile = Razor.compile("@@@escaped");
	object = {"escaped":"works"};
	equal(compile(object), "@works", "Complex @ escape");


	compile = Razor.compile("@@@@@@@@escaped");
	object = {};
	equal(compile(object), "@@@@escaped", "Multiple @ escapes");


	compile = Razor.compile("@if(true){<span>@@@@escaped</span>}");
	object = {};
	equal(compile(object), "<span>@@escaped</span>", "Nested @ escapes in blocks");

	compile = Razor.compile("email@@escaped.com value='@foo'");
	object = {"foo":"b@r"};
	equal(compile(object), "email@escaped.com value='b@r'", "Simple @ escape with additional vars");


	compile = Razor.compile("@Html.Raw( JSON.stringify(obj) )");
	object = {"obj": {"foo":"bar"}};
	equal(compile(object), "{\"foo\":\"bar\"}", "Can we use the JSON global?");

	compile = Razor.compile();
	object = {"obj": {"foo":"bar"}};
	equal(compile(object), "", "Handle undefined template");

	compile = Razor.compile("");
	object = {"obj": {"foo":"bar"}};
	equal(compile(object), "", "Handle empty template");

	compile = Razor.compile(" ");
	object = {"obj": {"foo":"bar"}};
	equal(compile(object), " ", "Handle empty template 2");

	compile = Razor.compile("@nothing");
	object = {"obj": {"foo":"bar"}};
	equal(compile(object), "", "Proxy and undefined");

	compile = Razor.compile("<span>@Html.Raw(num/2)</span>");
	equal(compile({"num":8}), "<span>4</span>", "Division Sign");

	compile = Razor.compile("<span>@Html.Raw(/test/.test('test'))</span>");
	equal(compile(), "<span>true</span>", "Regex works");

	compile = Razor.compile("<span>@replace.replace('replace','bueno')</span>");
	equal(compile({"replace":"replace"}), "<span>bueno</span>", "Regex works");

});