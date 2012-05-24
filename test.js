var testrunner = require("qunit"),
	walk = require("walk");

var walker = walk.walk("./test", {followLinks: false}),
	tests = [];
walker.on("file", function(root, fileStats, next){

	tests.push({
	    "code" : {
    		"path" : "./lib/" + fileStats.name,
    		"namespace": "testObject"
		},
	    "tests": "./test/" + fileStats.name
	});
	
	next();
});

walker.on("end", function(){

	testrunner.run(tests, function(err, report){
		console.log(err);
		console.dir(report);
	});
	
});