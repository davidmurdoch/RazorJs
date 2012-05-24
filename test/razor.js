module = QUnit.module;

var Razor = testObject;

module("Razor");

test("test razor.js functions", function() {
	expect(8);
	
	var compile, object = {};
	
	try{
		
	compile = Razor.compile("<div>@message</div>");
		object = {"message":"hello world"};
		equal(compile(object), "<div>hello world</div>", "Test simple compilation");
		
		
		compile = Razor.compile("<ul>@for(var name in obj){<li>@obj[name]</li>}</ul>");
		object = {"obj":{"foo":"foo", "bar":"bar"}};
		equal(compile(object), "<ul><li>foo</li><li>bar</li></ul>", "Test for name in obj");
		
		
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
	}
	catch(e){
		console.log(compile.fn);
	}
	
});