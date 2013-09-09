var ccmf = require('ccmf'),
	fs = require('fs'),
	logFiles = new Array(),
	readline = require('readline'),
	analyzer = new Analyzer(),
	pathToLogFiles = '../logs/tests/';


var logFilesName = fs.readdir(pathToLogFiles,analyzer.processFiles);

function Analyzer(){
	
	this.processFiles = function(err,files){
		
		var indexOfEmptyFile = files.indexOf('empty');
		
		files.splice(indexOfEmptyFile,1);
		
		for(logFileNum in files){
			
			fs.readFile(pathToLogFiles+files[logFileNum], function(err, data) {
			    
				if(err) throw err;
			    
			    var textArray = data.toString().split("\n"),
			    numOfText = textArray.length,
			    jsonEntry = null,
			    totalTimeTaken = 0;
			    
			    for(line in textArray) {
			    	if(textArray[line]!==""){
				        jsonEntry = JSON.parse(textArray[line]);
				        totalTimeTaken += jsonEntry.elapsedTime;
			    	}
			    }
			    
			    console.log('Analysis Type : '+jsonEntry.purpose);
			    console.log('Num of Text : '+numOfText);
			    console.log('Total Time : '+totalTimeTaken);
			    console.log('Mean Time (ns) :'+(totalTimeTaken/numOfText));
			    console.log('Mean Time (ms) :'+(totalTimeTaken/numOfText)/1000000);
			    console.log('Mean Time (s) :'+(totalTimeTaken/numOfText)/1000000000);
			});
		}
	};
};

