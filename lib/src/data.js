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
         * @param metadata - Optional addition information about the document
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
            		
            		authorRef.once('value', function(ss) {

            		    if(ss.val() === null ) { 
            		    	/* author does not exist */ 
            		    	callback(true);
            		    	throw new Error("storeLSH: User is not registered");
            		    }else { 
            		    	/* author exists */ 
            		    	authorRef.child('works').push(JSON.stringify(minHashSignatures[set]));
            		    	
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
            		    	
            		    	console.log('Article Registered');
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
        conductLsh : function(minHashSignatures,callback){
        	'use strict';
        	
        	this.init();
        	var textMod = ccmf.Text.create(),
    		results = null,
    		bandRef = this.rootRef.child('bands'),
    		curBandRef = null,
    		curBand = null,
            bucketRef = null,
    		set = null;
        	
                /* Obtain the vector hashes */
        	results = textMod.LSH(minHashSignatures);
        	
        	for(curBand=0;curBand<textMod.bands;curBand++){
        		
        		for(set=0;set<minHashSignatures.length;set++){
        			
        			curBandRef = bandRef.child(curBand);
                                
                    bucketRef = curBandRef.child(results['hashSet'][curBand][set]);
        			
        			bucketRef.once('value',callback);
        		}
        	}
        }
};

