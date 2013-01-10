var testrunner = require("qunit"),
	walk = require("walk");

var testFile = process.argv[2],
	tests = []

if (testFile){
	tests.push({
	    "code" : {
    		"path" : "./lib/" + testFile,
    		"namespace": "testObject"
		},
	    "tests": "./test/tests/" + testFile
	});
	run();
}
else {

	var walker = walk.walk("./test/tests", {followLinks: false});
	walker.on("file", function(root, fileStats, next){

		tests.push({
		    "code" : {
	    		"path" : "./lib/" + fileStats.name,
	    		"namespace": "testObject"
			},
		    "tests": "./test/tests/" + fileStats.name
		});

		next();
	});

	walker.on("end", function(){
		run();
	});
}

function run(){
	testrunner.run(tests, function(err, report){
		if(err){
			console.error(err);
			console.dir(report);
		}
		else{
			console.log("DONE");
			console.dir(report);
		}
	});
}