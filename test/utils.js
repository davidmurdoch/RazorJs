module = QUnit.module;

var Utils = testObject;

test("Utils.extend(Object, Object)", function() {
	expect(26);
	
	function isArray(obj){
		return toString.call(obj) === "[object Array]";
	}

	var settings = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
		options = { xnumber2: 1, xstring2: "x", xxx: "newstring" },
		optionsCopy = { xnumber2: 1, xstring2: "x", xxx: "newstring" },
		merged = { xnumber1: 5, xnumber2: 1, xstring1: "peter", xstring2: "x", xxx: "newstring" },
		deep1 = { foo: { bar: true } },
		deep1copy = { foo: { bar: true } },
		deep2 = { foo: { baz: true }, foo2: deep1 },
		deep2copy = { foo: { baz: true }, foo2: deep1 },
		deepmerged = { foo: { bar: true, baz: true }, foo2: deep1 },
		arr = [1, 2, 3],
		nestedarray = { arr: arr };

	Utils.extend(settings, options);
	deepEqual( settings, merged, "Check if extended: settings must be extended" );
	deepEqual( options, optionsCopy, "Check if not modified: options must not be modified" );

	Utils.extend(settings, null, options);
	deepEqual( settings, merged, "Check if extended: settings must be extended" );
	deepEqual( options, optionsCopy, "Check if not modified: options must not be modified" );

	Utils.extend(true, deep1, deep2);
	deepEqual( deep1.foo, deepmerged.foo, "Check if foo: settings must be extended" );
	deepEqual( deep2.foo, deep2copy.foo, "Check if not deep2: options must not be modified" );

	ok( Utils.extend(true, {}, nestedarray).arr !== arr, "Deep extend of object must clone child array" );

	ok( isArray( Utils.extend(true, { arr: {} }, nestedarray).arr ), "Cloned array heve to be an Array" );

	var empty = {};
	var optionsWithLength = { foo: { length: -1 } };
	Utils.extend(true, empty, optionsWithLength);
	deepEqual( empty.foo, optionsWithLength.foo, "The length property must copy correctly" );

	empty = {};
	var optionsWithDate = { foo: { date: new Date } };
	Utils.extend(true, empty, optionsWithDate);
	deepEqual( empty.foo, optionsWithDate.foo, "Dates copy correctly" );

	var myKlass = function() {};
	var customObject = new myKlass();
	var optionsWithCustomObject = { foo: { date: customObject } };
	empty = {};
	Utils.extend(true, empty, optionsWithCustomObject);
	ok( empty.foo && empty.foo.date === customObject, "Custom objects copy correctly (no methods)" );

	// Makes the class a little more realistic
	myKlass.prototype = { someMethod: function(){} };
	empty = {};
	Utils.extend(true, empty, optionsWithCustomObject);
	ok( empty.foo && empty.foo.date === customObject, "Custom objects copy correctly" );

	var ret = Utils.extend(true, { foo: 4 }, { foo: new Number(5) } );
	ok( ret.foo == 5, "Wrapped numbers copy correctly" );

	var nullUndef;
	nullUndef = Utils.extend({}, options, { xnumber2: null });
	ok( nullUndef.xnumber2 === null, "Check to make sure null values are copied");

	nullUndef = Utils.extend({}, options, { xnumber2: undefined });
	ok( nullUndef.xnumber2 === options.xnumber2, "Check to make sure undefined values are not copied");

	nullUndef = Utils.extend({}, options, { xnumber0: null });
	ok( nullUndef.xnumber0 === null, "Check to make sure null values are inserted");

	var target = {};
	var recursive = { foo:target, bar:5 };
	Utils.extend(true, target, recursive);
	deepEqual( target, { bar:5 }, "Check to make sure a recursive obj doesn't go never-ending loop by not copying it over" );

	var ret = Utils.extend(true, { foo: [] }, { foo: [0] } ); // 1907
	equal( ret.foo.length, 1, "Check to make sure a value with coersion 'false' copies over when necessary to fix #1907" );

	var ret = Utils.extend(true, { foo: "1,2,3" }, { foo: [1, 2, 3] } );
	ok( typeof ret.foo != "string", "Check to make sure values equal with coersion (but not actually equal) overwrite correctly" );

	var ret = Utils.extend(true, { foo:"bar" }, { foo:null } );
	ok( typeof ret.foo !== "undefined", "Make sure a null value doesn't crash with deep extend, for #1908" );

	var obj = { foo:null };
	Utils.extend(true, obj, { foo:"notnull" } );
	equal( obj.foo, "notnull", "Make sure a null value can be overwritten" );

	function func() {}
	Utils.extend(func, { key: "value" } );
	equal( func.key, "value", "Verify a function can be extended" );

	var defaults = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
		defaultsCopy = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
		options1 = { xnumber2: 1, xstring2: "x" },
		options1Copy = { xnumber2: 1, xstring2: "x" },
		options2 = { xstring2: "xx", xxx: "newstringx" },
		options2Copy = { xstring2: "xx", xxx: "newstringx" },
		merged2 = { xnumber1: 5, xnumber2: 1, xstring1: "peter", xstring2: "xx", xxx: "newstringx" };

	var settings = Utils.extend({}, defaults, options1, options2);
	deepEqual( settings, merged2, "Check if extended: settings must be extended" );
	deepEqual( defaults, defaultsCopy, "Check if not modified: options1 must not be modified" );
	deepEqual( options1, options1Copy, "Check if not modified: options1 must not be modified" );
	deepEqual( options2, options2Copy, "Check if not modified: options2 must not be modified" );
});


test("Utils.escapeHTML", function() {
	expect(1);
	var string = "<string attribute=\"This is a 'test'\" />";
	equals(Utils.escapeHTML(string), "&lt;string attribute=&quot;This is a &#x27;test&#x27;&quot; &#x2F;>", "Utils.escapeHTML works");
});

test("Utils.RegExpEscape", function(){
	expect(1);
	equals(Utils.RegExpEscape("/([te|st]).+?.{0,2}/"), "\\/\\(\\[te\\|st\\]\\)\\.\\+\\?\\.\\{0,2\\}\\/", "Regex string escaped successfully");
});