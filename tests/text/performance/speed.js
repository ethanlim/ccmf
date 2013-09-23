var ccmf = require('../../../index.js'),	//Reference the exported ccmf library
	fs = require('fs'),
	winston = require('winston');

/**
 * 	Testing Parameters
 */
var	startTime = null,
	elapsedTime = null,
	testFileName = __filename;

/**
 *  Logger
 */
winston.profile('test');

module.exports.shingles = {
		 setUp: function (callback) {
				this.sampleFile = '../samples/reuters/reut2-000.sgm';
				var outputFileName = '../logs/tests/shingles.log';

			    this.logger = new (winston.Logger)({
			        transports: [
			                  	new (winston.transports.Console)(),
			                  	new (winston.transports.File)(
			                  		{
			                  		 filename:outputFileName,
			                  		 handleExceptions: true
			                  		}
			                  	)
			                  ]
			    });
			    
				fs.exists(outputFileName, function(exists) {
					  if (exists) {
						  fs.unlink(outputFileName);
						  console.log("Removed previous test output file");
					  }
				});	
				
		        callback();
		 },
		 extractionSpeed: function (test) {
			 /* Remove the console logger */
			 var logger = this.logger;
			 logger.remove(winston.transports.Console);
			 			 
			 fs.readFile(this.sampleFile,function read(err,data){
					if(err){
						console.log('Error Reading File : '+err);
					}
					else{
						var content = data,
						textContent = content.toString(),
						registeringText = '',
						bodyIdx = 0,
						numOfArticles = 0,
						textMod = null,
						articleWordCount = 0;
					
						bodyTextArr  = textContent.match(/<\s*BODY[^>]*>([^<]*)<\s*\/\s*BODY\s*>/g);
						
						if(bodyTextArr!==null){
							
							numOfArticles=bodyTextArr.length;
							
							for(bodyIdx=0;bodyIdx<numOfArticles;bodyIdx++){
								
								registeringText = bodyTextArr[bodyIdx].replace(/(<([^>]+)>)/ig,"");
								
								textMod = ccmf.ccmf.Text.create();
								
								articleWordCount = registeringText.split('').length;
								
								startTime = process.hrtime();
								
								textMod.removedStopWordShingles(registeringText,9);				
														
								elapsedTime = process.hrtime(startTime);
								
								logger.log('info',
										{
											testFile:testFileName,
											purpose:'shingles-extraction-speed',
											description:'Shingles Extraction Speed',
											textId:bodyIdx,
											connectionType:'none',
											elapsedTime:elapsedTime[1],
											timeType:'ns',
											textLen:articleWordCount
										}
								);
							}
						}else{
							console.log("No String Found");
						}
						// Call the teardown callback
				        test.done();
					}
			 });
		 },
		 tearDown: function (callback) {
		        console.log("Shingles Extraction Test Completed");
			 	// clean up
		        callback();
		 }
};

module.exports.minhash = {
		 setUp: function (callback) {
			this.sampleFile = '../samples/reuters/reut2-000.sgm';
		 	var outputFileName = '../logs/tests/minhash.log';
			
		    this.logger = new (winston.Logger)({
		        transports: [
		                  	new (winston.transports.Console)(),
		                  	new (winston.transports.File)({filename:outputFileName})
		                  ]
		    });
		    
			fs.exists(outputFileName, function(exists) {
				  if (exists) {
					  fs.unlink(outputFileName);
					  console.log("Removed previous test output file");
				  } 
			});	
			
	        callback();
		 },
		 constructingSpeed: function (test) {
			 
			 /* Remove the console logger */
			 var logger = this.logger;
			 logger.remove(winston.transports.Console);
			 
			 fs.readFile(this.sampleFile,function read(err,data){
					if(err){
						console.log('Error Reading File : '+err);
					}
					else{
						var content = data,
						textContent = content.toString(),
						registeringText = '',
						bodyIdx = 0,
						numOfArticles = 0,
						bodyTextArr = textContent.match(/<\s*BODY[^>]*>([^<]*)<\s*\/\s*BODY\s*>/g),
						textMod = null,
						articleWordCount = 0,
						registeringTextShingles = null,
						registerShinglesFing = null;
						
						if(bodyTextArr!==null){
							
							numOfArticles=bodyTextArr.length;
								
							for(bodyIdx=0;bodyIdx<numOfArticles;bodyIdx++){
								
								registeringText = bodyTextArr[bodyIdx].replace(/(<([^>]+)>)/ig,"");
								
								textMod = ccmf.ccmf.Text.create();
								
								articleWordCount = registeringText.split('').length;
									
								registeringTextShingles = textMod.removedStopWordShingles(registeringText,9);	
								
								registerShinglesFing = textMod.shinglesFingerprintConv(registeringTextShingles);
								
								startTime = process.hrtime();
								
								textMod.minHashSignaturesGen(registerShinglesFing);
														
								elapsedTime = process.hrtime(startTime);
									
								logger.log('info',
										{
											testFile:testFileName,
											purpose:'minhash-signature',
											description:'Minhash Signature Generation',
											textId:bodyIdx,
											connectionType:'none',
											elapsedTime:elapsedTime[1],
											timeType:'ns',
											textLen:articleWordCount
										}
								);
								
							}
						}else{
							console.log("No String Found");
						}
						test.done();
					}
				});
			 	
		 },
		 tearDown: function (callback) {
			 console.log("Minhash Computation Test Completed");
			 // clean up
			 callback();
		 },
};

module.exports.lsh = {
		setUp: function (callback) {
			this.sampleFile = '../samples/reuters/reut2-000.sgm';
		 	var outputFileName = '../logs/tests/lsh.log';
			
		    this.logger = new (winston.Logger)({
		        transports: [
		                  	new (winston.transports.Console)(),
		                  	new (winston.transports.File)({filename:outputFileName})
		                  ]
		    });
		    
			fs.exists(outputFileName, function(exists) {
				  if (exists) {
					  fs.unlink(outputFileName);
					  console.log("Removed previous test output file");
				  } 
			});	
			
	        callback();
		 },
		 constructingSpeed: function (test){
			 
			 var logger = this.logger;
			 
			 fs.readFile(this.sampleFile,function read(err,data){
					if(err){
						console.log('Error Reading File : '+err);
					}
					else{
						var content = data,
						textContent = content.toString(),
						registeringText = '',
						bodyIdx = 0,
						numOfArticles = 0,
						textMod = null,
						articleWordCount = 0,
						registeringTextShingles = null,
						registerShinglesFing = null,
						signatures = null;
					
						bodyTextArr  = textContent.match(/<\s*BODY[^>]*>([^<]*)<\s*\/\s*BODY\s*>/g);
						
						if(bodyTextArr!==null){
							
							numOfArticles = bodyTextArr.length;
						
							for(bodyIdx=0;bodyIdx<numOfArticles;bodyIdx++){
								
								registeringText = bodyTextArr[bodyIdx].replace(/(<([^>]+)>)/ig,"");
								
								textMod = ccmf.ccmf.Text.create();
								
								articleWordCount = registeringText.split('').length;
									
								registeringTextShingles = textMod.removedStopWordShingles(registeringText,9);	
								
								registerShinglesFing = textMod.shinglesFingerprintConv(registeringTextShingles);
								
								signatures = textMod.minHashSignaturesGen(registerShinglesFing);
								
								startTime = process.hrtime();
								
								textMod.LSH(signatures[0],5);
														
								elapsedTime = process.hrtime(startTime);
									
								logger.log('info',
										{
											testFile:testFileName,
											purpose:'lsh-time',
											description:'Speed of LSH execution',
											textId:bodyIdx,
											connectionType:'none',
											elapsedTime:elapsedTime[1],
											timeType:'ns',
											textLen:articleWordCount
										}
								);  
							}
							console.log("Number of Articles : "+numOfArticles);
						}else{
							console.log("No String Found");
						}
						test.done();
					}
				});
		 },
		 tearDown: function (callback) {
			 console.log("LSH Computation Test Completed");
		     // clean up
			 callback();
		 }
};