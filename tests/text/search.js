var ccmf = require('../../index.js'),	//Reference the exported ccmf library
	fs = require('fs'),
	cheerio = require('cheerio'),
	request = require('request'),
	http = require('http');

var deletingTexts = [],
	domain = "http://www.wikipedia.org",
	wikiArticlePaths = [],
	articlesCount=0,
	storedArticlesCount = 0,
	metadata = {
		author:{first:'test',last:'test',email:'test@test.com'}
	},
	storeCallback = function(error){
		if(error===null){
		}
		else{
			console.log(error);
		}
	},
	resultCallback = function(results){
		
		if(results.count!=0){
			
			var resultSets = results['sets'],
			metadata = null,
			author = null,
			set = null;
		
			for(var result=0;result<results.count;result++){
				
				set = JSON.parse(resultSets[result]);
				
				metadata = set['metadata'];
				author = metadata['author'];
				
				console.log('Sig :'+set['sig'].toString().substring(0,30)+' Author : '+author['first']);
			}
		}
		else{
				console.log('No Similar Signature Found');
		}
	};

module.exports.articles = {
		
		setUp: function (callback) {
			//Load Articles URL
			wikiArticlePaths[0] = "/wiki/Harry_Potter_and_the_Order_of_the_Phoenix";
			wikiArticlePaths[1] = "/wiki/Wiki";
			wikiArticlePaths[2] = "/wiki/Web_application";
			wikiArticlePaths[3] = "/wiki/BBC_Worldwide";
			wikiArticlePaths[4] = "/wiki/BBC";
			wikiArticlePaths[5] = "/wiki/United_states";
			wikiArticlePaths[6] = "/wiki/Hadoop";
			wikiArticlePaths[7] = "/wiki/Node.js";
			wikiArticlePaths[8] = "/wiki/Ruby_(programming_language)";
			wikiArticlePaths[9] = "/wiki/Lonely_planet";
			wikiArticlePaths[10] = "/wiki/wiki/Von_Neumann";
			articlesCount = wikiArticlePaths.length;
			callback();
		},
		register:function(test){
			var textMod = ccmf.ccmf.Text.create();
			
			console.log("Storing Articles Signature Begin.");
			
			for(var article=0;article<wikiArticlePaths.length;article++){
		
				request(domain+wikiArticlePaths[article],function(error, response, body) {
					
					if(error!=null){
						console.log(error);
					}
					else{
						$ = cheerio.load(body);
				    	
				    	var registeringText = $('#mw-content-text').text().replace(/(<([^>]+)>)/ig,"");
				    	
				    	deletingTexts.push(registeringText);
				    	
				    	if(storedArticlesCount<articlesCount-1){
				    		
				    		textMod.register(	
				    							registeringText,
				    							{k:9},
				    							metadata,
				    							storeCallback
	    									);
				    	}
				    	
						console.log("Stored Articles :" + storedArticlesCount);
						
						storedArticlesCount++;
						if(storedArticlesCount==articlesCount){
							test.done();
						}
					}
				});
			}
		},
		search:function(test){
			
			var textMod = ccmf.ccmf.Text.create();
			
			var randomNum=Math.floor(Math.random()*(deletingTexts.length));
			
			console.log("Search a random article from registered articles : Article No. "+randomNum);
			
			textMod.search(deletingTexts[randomNum],{k:9},null,resultCallback);
			
			console.log("Search non-registered article");
			
			textMod.search(
							deletingTexts[articlesCount-1],
							{k:9},
							null,
							resultCallback
						  );
						
			test.done();
		},
		deletion:function(test){

			/* Remove all the minhash signatures that was registered */ 
			
			var storedArticles = deletingTexts.length;
			
			for(var articles=0;articles<storedArticles;articles++){
				
				var textMod = ccmf.ccmf.Text.create();
				var dataMod = ccmf.ccmf.Data.create(); 
				var registeringTextShingles = textMod.removedStopWordShingles(deletingTexts.pop(),9);
				var registerShinglesFing = textMod.shinglesFingerprintConv(registeringTextShingles);
				
				var signature = [];
				signature[0] = registerShinglesFing; 
				var minHashSignature = textMod.minHashSignaturesGen(signature);
				
				dataMod.deleteLsh(
									minHashSignature,
									metadata
								 );
				
				registeringTextShingles=null;
				registerShinglesFing=null;
				signature=null;
				minHashSignature=null;
			}

			test.done();
		},
		tearDown:function(callback){
			console.log("Wait for Async Results");
			callback();
		}
};
