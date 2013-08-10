var ccmf = require('ccmf'),
	fs = require('fs'),
	winston = require('winston');

/**
 * 	Testing Parameters
 */
var n = 1,
	testFileName = '/tests/data/data-performance.js',
	sampleFile = '../../samples/reuters/reut2-000.sgm',
	outputFileName = '../../logs/tests/data-storelsh.txt',
	startTime = null,
	elapsedTime = null,
	recvAck = 0;

var testAsync = function(error){
	if (error) {
	    console.log('Data could not be saved.' + error);
	 } else {
	    console.log('Data saved successfully.');
	    
	    elapsedTime = process.hrtime(startTime);
		
		logger.log('info',
				{
					testFile:testFileName,
					purpose:'networklatency-ack',
					description:'Received Band Stored Ack',
					textId:recvAck,
					connectionType:'recv',
					elapsedTime:elapsedTime[1],
					timeType:'ms'
				}
			);
		
	 }
};

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

module.exports.data = {
		 setUp: function (callback) {
				fs.exists(outputFileName, function(exists) {
					  if (exists) {
						  fs.unlink(outputFileName);
					  } 
				});	
		        callback();
		 },
		 store:function (test){
			 fs.readFile(sampleFile,function read(err,data){
					if(err){
						console.log('Error Reading File : '+err);
					}
					else{
						var content = data,
						textContent = content.toString(),
						registeringText = '',
						bodyIdx = 0,
						max = 0;
					
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
								startTime = process.hrtime();
								
								dataMod.storeLsh(minHashSignatures[0],testAsync);
							}
						}else{
							console.log("No String Found");
						}
					}
				});
			 	test.done();
		 },
		 search:function(test){
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
		 }
};