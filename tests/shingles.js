var test = require('tap').test,
	ccmf = require('ccmf'),
	fs = require('fs'),
	winston = require('winston');

/**
 * 	Testing Parameters
 */
var n = 1000,
	testFileName = '/tests/shingles.js',
	sampleFile = '../samples/reuters/reut2-000.sgm',
	outputFileName = '../logs/tests/shingles.txt';

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
test('Time taken for extracting shingles',function(t){
	
	fs.unlink(outputFileName);	
	
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
					
					var articleNo = Math.floor((Math.random()*(max-1))+0);
					
					var articleWordCount = registeringText.split('').length;
					
					startTime = process.hrtime();
					
					textMod.removedStopWordShingles(registeringText,9);				
											
					elapsedTime = process.hrtime(startTime);
						
					logger.log('info',
							{
								testFile:testFileName,
								purpose:'shingles-extraction-speed',
								description:'Shingles Extraction Speed',
								textId:articleNo,
								connectionType:'none',
								elapsedTime:elapsedTime[1],
								timeType:'ns',
								textLen:articleWordCount
							}
					);
					
				}
				console.log("Number of Articles : "+max);
			}else{
				console.log("No String Found");
			}
			t.end();
		}
	});
});