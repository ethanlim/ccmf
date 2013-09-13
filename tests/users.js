var ccmf = require('../index.js'),	//Reference the exported ccmf library
	fs = require('fs'),
	cheerio = require('cheerio'),
	http = require('http');

var testingText = "Testing Text";

module.exports.articles = {
		setUp: function (callback) {
			callback();
		},
		register:function(test){
			var textMod = ccmf.ccmf.Text.create();
			var dataMod = ccmf.ccmf.Data.create(); 
			
			/* Obtained the articles */
			var wikiArticlePaths = [];
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
			
			for(var article=0;article<wikiArticlePaths.length;article++){
				
				var content = '';
				
				var req = http.request(
						{
						    host: "en.wikipedia.org",
						    port: 80,
						    path: wikiArticlePaths[article]
						}, 
						function(res) {
						    res.setEncoding("utf8");
						    
						    res.on("data", function (chunk) {
						    	content += chunk;
						    });
		
						    res.on("end", function () {
						    	
						    	$ = cheerio.load(content);
						    	
						    	console.log(res.req.path);
						    	
						    	var registeringText = $('#toc').text();

								var registeringTextShingles = textMod.removedStopWordShingles(registeringText,9);
								var registerShinglesFing = textMod.shinglesFingerprintConv(registeringTextShingles);
								
								/* Extract the Signature */
								var signature = [];
								signature[0] = registerShinglesFing; 
								var minHashSignatures = textMod.minHashSignaturesGen(signature);
								
								dataMod.storeLsh(minHashSignatures,
										function(error){
											if(error===null){
											}
											else{
												console.log(error);
											}
										}
										,
										{
										 author:
											{
												first:"Ethan",
												last:"Lim",
												email:"mail@ethanlim.net"
											}
									    }
								);
								

						    	delete content;
						    	delete signature;
						    	delete registeringText;
						    	delete registeringTextShingles;
						    	delete registerShinglesFing;
						    	delete minHashSignatures;
						    });
				});
	
				req.end();
			}
			
			test.done();
		},
		search:function(test){
			
			test.done();
		},
		tearDown:function(callback){
			
			/* Remove all the minhash signatures that was registered */ 
			
			var textMod = ccmf.ccmf.Text.create();
			var dataMod = ccmf.ccmf.Data.create(); 
			var registeringTextShingles = textMod.removedStopWordShingles(testingText,9);
			var registerShinglesFing = textMod.shinglesFingerprintConv(registeringTextShingles);
			
			/* Extract the Signature */
			var signature = [];
			signature[0] = registerShinglesFing; 
			var minHashSignature = textMod.minHashSignaturesGen(signature);
			
			dataMod.deleteLsh(minHashSignature,
					{
					 author:
						{
							first:"Ethan",
							last:"Lim",
							email:"mail@ethanlim.net"
						}
			});
			
			callback();
		}
};
