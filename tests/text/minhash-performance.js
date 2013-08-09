var test = require('tap').test,
	ccmf = require('ccmf'),
	fs = require('fs'),
	winston = require('winston');

/**
 * 	Testing Parameters
 */
var n = 10,
	testFileName = '/tests/minhash-performance.js',
	sampleFile = '../../samples/reuters/reut2-000.sgm',
	outputFileName = '../../logs/tests/minhash-performance.txt';

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

/**
 *  Generate Test Cases 
 */
test('Time taken for minhash generation from shingles',function(t){
	
	fs.exists(outputFileName, function(exists) {
		  if (exists) {
			  fs.unlink(outputFileName);
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
			numOfArticles = 0,
			bodyTextArr = textContent.match(/<\s*BODY[^>]*>([^<]*)<\s*\/\s*BODY\s*>/g),
			textMod = null,
			articleNo = 0,
			articleWordCount = 0,
			registeringTextShingles = null,
			registerShinglesFing = null;
			
			if(bodyTextArr!==null){
				
				numOfArticles=bodyTextArr.length;
					
				for(bodyIdx=0;bodyIdx<n;bodyIdx++){
					
					registeringText = bodyTextArr[bodyIdx].replace(/(<([^>]+)>)/ig,"");
					
					textMod = ccmf.ccmf.Text.create();
					
					articleNo = Math.floor((Math.random()*(numOfArticles-1))+0);
					
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
								textId:articleNo,
								connectionType:'none',
								elapsedTime:elapsedTime[1],
								timeType:'ns',
								textLen:articleWordCount
							}
					);
					
				}
				console.log("Number of Articles : "+n);
			}else{
				console.log("No String Found");
			}
		}
	});
	
	t.end();
});