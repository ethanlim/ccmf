/**
 *    Test the Data module
 */

var test = require('tap').test,
	ccmf = require('ccmf'),
	fs = require('fs'),
	winston = require('winston'),
	firebase = require('firebase');

/**
 * 	Network Latency for Storing Text Content
 */

/**
 * 	Testing Parameters
 */
var n = 1,
	testFileName = '/tests/data.js',
	sampleFile = '../samples/reuters/reut2-000.sgm',
	outputFileName = '../logs/tests/data-storelsh.txt';

/**
 *  Logger
 */
winston.profile('test');

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({filename: outputFileName })
    ]
});

/**
 *  Prepare Test Situation 
 */

var	startTime = null,
	endTime = null,
	elapsedTime = null,
	recvAck = 0;
	
var testAsync = function(error){
	if (error) {
	    console.log('Data could not be saved.' + error);
	 } else {
	    console.log('Data saved successfully.');
	    
	    endTime = new Date().getTime();
		
		elapsedTime = endTime - startTime;
		
		logger.log('info',
				{
					testFile:testFileName,
					purpose:'networklatency-ack',
					description:'Received Band Stored Ack',
					textId:recvAck,
					connectionType:'recv',
					elapsedTime:elapsedTime,
					timeType:'ms'
				}
			);
		
	 }
};

/**
 *  Generate Test Results  
 */
test('Network Latency for Saving '+n+' Text Content',function(t){
	
	fs.exists(outputFileName, function(exists) {
		  if (exists) {
			  fs.unlink();
		  } 
	});	
	
	fs.readFile(sampleFile,function read(err,data){
		if(err){
			console.log('Error Reading File : '+err);
		}
		else{
			var content = data,
			textContent = content.toString(),
			registeringText = '',
			bodyIdx = 0,
			max = 0,
		
			bodyTextArr  = textContent.match(/<\s*BODY[^>]*>([^<]*)<\s*\/\s*BODY\s*>/g);
			
			if(bodyTextArr!==null){
				
				max=bodyTextArr.length;
				if(n<max){
					max = n;
				}
				
				for(bodyIdx=0;bodyIdx<max;bodyIdx++){
					
					registeringText = bodyTextArr[bodyIdx].replace(/(<([^>]+)>)/ig,"");
					
					var textMod = ccmf.ccmf.Text.create();
					var dataMod = ccmf.ccmf.Data.create();
					
					var registeringTextShingles = textMod.removedStopWordShingles(registeringText,9);
					
					var registerShinglesFing = textMod.shinglesFingerprintConv(registeringTextShingles);
					
					var minHashSignatures = textMod.minHashSignaturesGen(registerShinglesFing);
					
					/* Register the Signature into the Registry*/
					startTime = new Date().getTime();
					
					dataMod.storeLsh(minHashSignatures[0],testAsync);
				}
			}else{
				console.log("No String Found");
			}
		}
	});
	
	fs.exists(outputFileName, function(exists) {
		  if (exists) {
			  fs.close(outputFileName);
		  } 
	});
	
	t.end();
});


/**
 *  Time to Received Search Queries
 */

/**
 * 	Testing Parameters
 */
var n = 10,
	testFileName = '/tests/data.js',
	sampleFile = '../samples/reuters/reut2-000.sgm',
	outputFileName = '../logs/tests/data-searchlsh.txt';

/**
 *  Logger
 */
winston.profile('test');

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({filename: outputFileName })
    ]
});

/**
 *  Prepare Test Situation 
 */

var	startTime = null,
	elapsedTime = null;
	
var testSearch = function(snapshot){
	
	/* Search through each band */
	if(snapshot.val()!=null){ 
		
		elapsedTime = process.hrtime(startTime);
		
		logger.log('info',
				{
					testFile:testFileName,
					purpose:'lsh-search',
					description:'Search Article Content',
					connectionType:'none',
					elapsedTime:elapsedTime[1],
					timeType:'ns'
				}
		);
	}
};

test('Network Latency Searching Signatures',function(t){

	fs.exists(outputFileName, function(exists) {
		  if (exists) {
			  fs.unlink();
		  } 
		});
	
	fs.readFile(sampleFile,function read(err,data){
		if(err){
			console.log('Error Reading File : '+err);
		}
		else{
			var content = data,
			textContent = content.toString(),
			registeringText = '',
			bodyIdx = 0,
			max = 0,
		
			bodyTextArr  = textContent.match(/<\s*BODY[^>]*>([^<]*)<\s*\/\s*BODY\s*>/g);
			
			if(bodyTextArr!==null){
				
				max=bodyTextArr.length;
				if(n<max){
					max = n;
				}
				
				for(bodyIdx=0;bodyIdx<max;bodyIdx++){
					
					registeringText = bodyTextArr[bodyIdx].replace(/(<([^>]+)>)/ig,"");
					
					var textMod = ccmf.ccmf.Text.create();
					var dataMod = ccmf.ccmf.Data.create();
					
					var registeringTextShingles = textMod.removedStopWordShingles(registeringText,9);
					
					var registerShinglesFing = textMod.shinglesFingerprintConv(registeringTextShingles);
					
					var minHashSignatures = textMod.minHashSignaturesGen(registerShinglesFing);
					
					startTime = process.hrtime();
					
					dataMod.conductLsh(minHashSignatures[0],testSearch);
				}
			}else{
				console.log("No String Found");
			}
		}
	});
		
	fs.exists(outputFileName, function(exists) {
		  if (exists) {
			  fs.close(outputFileName);
		  } 
	});
	
	t.end();
});
