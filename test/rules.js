module = QUnit.module;

var rules = testObject;

test("test rules.js functions", function() {
	expect(5);
	
	var value = rules.isReserved("continue");
	strictEqual(value, true, "isReserved");
	
	value = rules.isValidName("0");
	strictEqual(value, false, "0 is not a valid name");
	
	value = rules.isValidName("ಠ_ಠ");
	strictEqual(value, true, "ಠ_ಠ is a valid name");
	
	value = rules.isValidName("$");
	strictEqual(value, true, "$ is a valid name");
	
	value = rules.isValidName("test");
	strictEqual(value, true, "test is a valid name");
});