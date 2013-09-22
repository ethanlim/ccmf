/*
 *      Creative Common's Media Fingerprint Library
 *      Copyright (c) 2013, Lim Zhi Hao
 *      All rights reserved.
 *      Redistribution and use in source and binary forms, with or without modification, 
 *      are permitted provided that the following conditions are met:
 *
 *      Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *      Redistributions in binary form must reproduce the above copyright notice, 
 *      this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *      
 *      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 *      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 *      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
 *      IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 *      INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,  
 *      PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) 
 *      HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
 *      (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
 *      EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 */
ccmf.namespace('ccmf.Data');

/**
 * The Data class.
 * @class Data
 * @constructor
 */
ccmf.Data = function () {
    'use strict';
};

/**
 * Data Object Constructor
 * @param none
 * @method create
 * @static
 * @return {ccmf.Data} The newly created vector.
 */
ccmf.Data.create = function () {
    'use strict';
    var newObj = new ccmf.Data();
    return newObj;
};

/**
 * The Data class prototype
 * @class Data
 * @constructor
 */
ccmf.Data.prototype = {
        rootRef:null,
        endpoint: "https://ccmf.firebaseio.com",
        init:function(){
        	'use strict';
        	
        	if(typeof(Firebase)!="undefined"){
        		this.rootRef = new Firebase(this.endpoint);
        	}else{
        		/* Purposefully inject into global namespace for Node.js */
        		Firebase = require('firebase');
        		this.rootRef = new Firebase(this.endpoint);
        	}
        },

        currentDomain:function(){
        	'use strict';
        	
            return window.location.host;
        },

        currentPathURL:function(){
        	'use strict';
        	
            // Returns the base64 hash
            return btoa(window.location.pathname);
        },
        
        /**
         * Helper function for modifying email that is acceptable by firebase
         * @param email
         * @returns email - an email address with . replaced by ::
         */
        escapeEmail:function(email) {
        	'use strict';
			if (!email) return false;
			  
			var replaceDotWith = '::';
			  
			// Replace '.' (not allowed in a Firebase key) with ','
			email = email.toLowerCase();
			email = email.replace(/\./g, replaceDotWith);
			return email;
        },
        
        /**
         * Perform lsh and store their signatures 
         * @param minHashSignatures
         * @param callback - Optional 
         * @param metadata - Addition information about the document
         */
        storeLsh : function(minHashSignatures,callback,metadata){
        	'use strict';
        	this.init();
        	var textMod = ccmf.Text.create(),
        		results = null,
        		bandRef = this.rootRef.child('bands'),
        		userRef = this.rootRef.child('users'),
        		authorRef = null,
        		curBandRef = null,
        		curBand = null,
        		set = null,
        		storedInfo = null,
        		escapedEmail = null;
        	
        	/* Parameters Extraction */
        	if(callback==undefined){
				callback = function(error) {
					if (error) {
					    console.log('Data could not be saved.' + error);
					  } else {
					    console.log('Data saved successfully.');
					  }
				};
			}
        	
        	/* Obtain the Vector Hashes */
        	results = textMod.LSH(minHashSignatures);
        	
        	for(set=0;set<minHashSignatures.length;set++){
        		
        		if(metadata==undefined){
            		metadata = null;
            	}else{
            		/* Store the work into the author */
            		escapedEmail = this.escapeEmail(metadata['author']['email']);
            		authorRef = userRef.child(escapedEmail);
            		authorRef.child('works').push(JSON.stringify(minHashSignatures[set])); //Register Artist Works
            		
            		userRef.child(escapedEmail).once('value', function(ss) {

            		    if(ss.val() === null ) { 
            		    	/* author does not exist */ 
            		    	callback(true);
            		    	throw new Error("storeLSH: author is not registered");
            		    }else { 
            		    	/* author exists */ 
            		    	// TODO: Can't place Register Author works here after Author identity has been verified
            		    	
            		    	for(curBand=0;curBand<textMod.bands;curBand++){
            	        		for(set=0;set<minHashSignatures.length;set++){
            	        			
            	        			curBandRef = bandRef.child(curBand);
            	        			
            	        			/* Stored Data Structure */
            	        			storedInfo = new Object();
            	        			storedInfo['sig'] = minHashSignatures[set];
            	        			storedInfo['metadata'] = metadata;
            	        			
            	        			curBandRef.child(results['hashSet'][curBand][set]).push(JSON.stringify(storedInfo),callback);
            	        		}
            	        	}
            		    }
            		});
            	}
        	}
        },
        
        /**
         * Conduct lsh of a single minhash signature and perform searching at Firebase
         * @param minHashSignatures
         * @param callback
         */
        conductLsh : function(minHashSignatures,resultCallback){
        	'use strict';
        	
        	this.init();
        	var textMod = ccmf.Text.create(),
    		results = null,
    		bandRef = this.rootRef.child('bands'),
    		curBandRef = null,
    		curBand = null,
            bucketRef = null,
    		set = null,
    		noOfReturnsCount=0,
    		foundSets=[],
    		setsSimilarToGiven=[],
    		foundSetsInBand=null;
        	
            /* Obtain the vector hashes */
        	results = textMod.LSH(minHashSignatures);
        	
        	for(curBand=0;curBand<textMod.bands;curBand++){
        		
        		for(set=0;set<minHashSignatures.length;set++){
        			
        			curBandRef = bandRef.child(curBand);
                                
                    bucketRef = curBandRef.child(results['hashSet'][curBand][set]);
        		
        			bucketRef.once('value',
        				function(snapshot){
        				
	        				noOfReturnsCount+=1;
	        				
	        				/*
	        				 * Get each band's result 
	        				 * may be 1 or more signatures 
	        				 * */
	        				if(snapshot.val()!=null){
	        					
	        					var rawResult = snapshot.val(),
	        						keys = Object.keys(rawResult),
	        						key = null,
	        						jsonResult=[];
	        					
	        					/*
	        					 *  There maybe more then 1 signatures returned on each band (similar to the sent signatures)
	        					 */
	        					for(key=0;key<keys.length;key++){
	        						
	        						var jsonString = rawResult[keys[key]],
	        							jsonObj = JSON.parse(jsonString);
	        						
	        						jsonResult.push(jsonObj);
	        						
	        						//Determine if signature should be in most similar candidate list (signatures not encountered before)
	        						if(setsSimilarToGiven.indexOf(jsonString)==-1){
	        							setsSimilarToGiven.push(jsonString);
	        						}
	        					}
	        					
	        					/* Encap all sets found within a band */
	        					foundSetsInBand = {
	        							'ref':snapshot.ref().toString(),
	        							'json':jsonResult,
	        							'raw':snapshot.val()
	        					};
	        					
	        					foundSets.push(foundSetsInBand);
	        				}
	        				
	        				//Only when all bands have return then compile the full results of most likely candidate
	        				if(noOfReturnsCount==textMod.bands){
	        					
	        					var fullResult = {
	        						'count':setsSimilarToGiven.length,
	        						'sets' :setsSimilarToGiven,
	        						'raw'  :foundSets
	        					};
	        					
	        					resultCallback(fullResult);
	        				}
        			});
        		}
        	}
        },
        
        
        /**
         * Deleted all lsh records based on the minhash signatures
         * @param minHashSignatures
         * @param metadata - Addition information about the document
         * TODO: Currently only support one minhash at a time
         */
        deleteLsh : function(minHashSignatures,metadata){
        	'use strict';
        	
        	this.init();
        	var textMod = ccmf.Text.create(),
        	results = null,
        	bandRef = this.rootRef.child('bands'),
    		userRef = this.rootRef.child('users'),
    		curBandRef = null,
    		curBand = null,
            bucketRef = null,
    		set = null,
    		bucketsCallback = function(snapshot){
        		
    			/* Search through each band */
    			if(snapshot.val()!=null){ 
    				/* If found in current band */
    				var foundSignatureSets = snapshot.val(),
    				keys = Object.keys(foundSignatureSets),
    				key = null;
    				
    				// Remove every signatures that meets the current minhash signature in the bucket
    				for(key=0;key<keys.length;key++){
    					var signatureInfo = JSON.parse(foundSignatureSets[keys[key]]);
    					
    					if(arrayCompare(signatureInfo['sig'],minHashSignatures[0]))
    						//Only remove signatures in the bucket that match the minhash signature completely
    						snapshot.child(keys[key]).ref().remove();
    				}
    				
    				authorRef.child('works').once('value',authorsCallback); //Register Artist Works
    			}
        	},
        	authorsCallback = function(snapshot){
        		        		
    			if(snapshot.val()!=null){ 
    				var foundSignatureSets = snapshot.val(),
    				keys = Object.keys(foundSignatureSets),
    				key = null;
    				
    				// Remove every signatures that meets the current minhash signature in the author's work
    				for(key=0;key<keys.length;key++){
    					
    					var signatureInfo = JSON.parse(foundSignatureSets[keys[key]]);
    					//Only remove signatures in the bucket that match the minhash signature completely
    					if(arrayCompare(signatureInfo,minHashSignatures[0])){				
    						snapshot.child(keys[key]).ref().remove();
    					}
    				}
    			}
        	},
        	arrayCompare = function(A,B){

        		for(var i=0;i<A.length;i++){
        			if(A[i]!==B[i]){		
        				return false;
        			}
        		}
        		return true;
        	};
    			
			/* Obtain the vector hashes */
        	results = textMod.LSH(minHashSignatures);

        	/* Store the work into the author */
    		escapedEmail = this.escapeEmail(metadata['author']['email']);
    		authorRef = userRef.child(escapedEmail);
    		
    		userRef.child(escapedEmail).once('value', function(ss) {
    			if(ss.val() === null ) { 
    		    	/* author does not exist */ 
    		    	throw new Error("storeLSH: author is not registered");
    		    }else { 
		        	for(curBand=0;curBand<textMod.bands;curBand++){
		        		
		        		for(set=0;set<minHashSignatures.length;set++){
		        			
		        			curBandRef = bandRef.child(curBand);
		                                
		                    bucketRef = curBandRef.child(results['hashSet'][curBand][set]);
		        			
		        			bucketRef.once('value',bucketsCallback);
		        		}
		        	}
    		    }
    		});
    		
        }
};

