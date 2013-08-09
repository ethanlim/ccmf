var test = require('tap').test,
	ccmf = require('ccmf'),
	fs = require('fs'),
	winston = require('winston');

/**
 * 	Testing Parameters
 */
var n = 1000,
	testFileName = '/tests/data.js',
	outputFileName = '../logs/tests/shingles.txt',
	testName = '';


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
	elapsedTime = null;

/**
 *  Test Cases 
 */
test(testName,function(t){
	
	fs.readFile('../samples/reuters/reut2-000.sgm',function read(err,data){
		if(err){
			console.log('Error Reading File : '+err);
		}
		else{
			var content = data,
			textContent = content.toString(),
			registeringText = '',
			bodyIdx = 0,
			max = 0,
			rand
		
			bodyTextArr  = textContent.match(/<\s*BODY[^>]*>([^<]*)<\s*\/\s*BODY\s*>/g);
			
			if(bodyTextArr!==null){
				
				max=bodyTextArr.length;
								
				for(bodyIdx=0;bodyIdx<max;bodyIdx++){
					
					registeringText = bodyTextArr[bodyIdx].replace(/(<([^>]+)>)/ig,"");
					
					var textMod = ccmf.ccmf.Text.create();
					var dataMod = ccmf.ccmf.Data.create();
					
					var articleNo = Math.floor((Math.random()*(max-1))+0);
					
					logger.log('info','Shingles Extraction for Article No : '+ articleNo);
					
					var articleWordCount = registeringText.split('').length;
					
					startTime = new Date().getTime();
					
					var registeringTextShingles = textMod.removedStopWordShingles(registeringText,9);				
					
					endTime = new Date().getTime();
						
					elapsedTime = endTime - startTime;
						
					logger.log('info',
							testName,
							{
								testFile:testFileName,
								purpose:'shingles-extraction-speed',
								description:'Shingles Extraction Speed',
								textId:articleNo,
								connectionType:'none',
								elapsedTime:elapsedTime,
								timeType:'ms',
								textLen:articleWordCount
							}
					);
				}
			}else{
				console.log("No String Found");
			}
			
			t.end();
		}
	});
});