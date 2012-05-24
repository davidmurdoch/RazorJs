module = QUnit.module;

var rules = testObject;

test("test rules.js functions", function() {
	expect(3);
	var value = rules.isReserved("continue");
	strictEqual(true, value, "isReserved");
	value = rules.isValidName("0");
	strictEqual(false, value, "0 is not a valid name");
	value = rules.isValidName("?_?");
	strictEqual(true, value, "?_? is a valid name");
});