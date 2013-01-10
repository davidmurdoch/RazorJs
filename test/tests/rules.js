module = QUnit.module;

var rules = testObject;

test("test rules.js functions", function() {
	expect(15);
	
	var value = rules.isReserved("continue");
	strictEqual(value, true, "isReserved");
	
	value = rules.isValidName("0");
	strictEqual(value, false, "0 is not a valid name");
	
	value = rules.isValidName("ಠ_ಠ");
	ok(value, true, "ಠ_ಠ is a valid name");
	
	value = rules.isValidName("$");
	ok(value, "$ is a valid name");
	
	value = rules.isValidName("test");
	ok(value, "test is a valid name");
	
	value = rules.isValidName("π");
	ok(value, "π is a valid name");
	
	value = rules.isValidName("ლ_ಠ益ಠ_ლ");
	ok(value, "ლ_ಠ益ಠ_ლ is a valid name");
	
	value = rules.isValidName("λ");
	ok(value, "λ is a valid name");
	
	value = rules.isValidName("\u006c\u006f\u006c\u0077\u0061\u0074");
	ok(value, "\\u006c\\u006f\\u006c\\u0077\\u0061\\u0074 is a valid name");
	
	value = rules.isValidName("ൽↈⴱ");
	ok(value, "ൽↈⴱ is a valid name");
	
	value = rules.isValidName("ൽↈⴱ");
	ok(value, "ൽↈⴱ is a valid name");
	
	value = rules.isValidName("ൽↈⴱ");
	ok(value, "ൽↈⴱ is a valid name");
	
	value = rules.isValidName("ൽↈⴱ");
	ok(value, "ൽↈⴱ is a valid name");
	
	value = rules.isValidName("ൽↈⴱ");
	ok(value, "ൽↈⴱ is a valid name");
	
	value = rules.isValidName("Hͫ̆̒̐ͣ̊̄ͯ͗͏̵̗̻̰̠̬͝ͅE̴̷̬͎̱̘͇͍̾ͦ͊͒͊̓̓̐_̫̠̱̩̭̤͈̑̎̋ͮͩ̒͑̾͋͘Ç̳͕̯̭̱̲̣̠̜͋̍O̴̦̗̯̹̼ͭ̐ͨ̊̈͘͠M̶̝̠̭̭̤̻͓͑̓̊ͣͤ̎͟͠E̢̞̮̹͍̞̳̣ͣͪ͐̈T̡̯̳̭̜̠͕͌̈́̽̿ͤ̿̅̑Ḧ̱̱̺̰̳̹̘̰́̏ͪ̂̽͂̀͠");
	ok(value, "Hͫ̆̒̐ͣ̊̄ͯ͗͏̵̗̻̰̠̬͝ͅE̴̷̬͎̱̘͇͍̾ͦ͊͒͊̓̓̐_̫̠̱̩̭̤͈̑̎̋ͮͩ̒͑̾͋͘Ç̳͕̯̭̱̲̣̠̜͋̍O̴̦̗̯̹̼ͭ̐ͨ̊̈͘͠M̶̝̠̭̭̤̻͓͑̓̊ͣͤ̎͟͠E̢̞̮̹͍̞̳̣ͣͪ͐̈T̡̯̳̭̜̠͕͌̈́̽̿ͤ̿̅̑Ḧ̱̱̺̰̳̹̘̰́̏ͪ̂̽͂̀͠is a valid name");

});