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

ccmf.namespace('Worker');

/**
 * The Worker class.
 * @class Worker
 * @constructor
 */
ccmf.Worker = function () {
    'use strict';
    
};

/**
 * Worker Object Constructor
 * @param none
 * @method create
 * @static
 * @return {ccmf.Text} The newly created vector.
 */
ccmf.Worker.create = function () {
    'use strict';
    var newObj = new ccmf.Worker();
    return newObj;
};

/**
 * The Text class prototype
 * @class Text
 * @constructor
 */
ccmf.Worker.prototype = (function(){
    
    //Private Members
    var dataObj=null,
        setsToRead=5,
        randomSetIdx=[],
        signatureLenAtRepo=0;
    
    //Implement the public methods
    return {
        
        init:function(){

            /* Use the Data Class */
            this.dataObj = ccmf.Data.create();

            var workerObj = this;

            /* Call the data object that seeks the signature records length */
            this.dataObj.signatureLength(function(snapshot){

                workerObj.signatureLenAtRepo = snapshot.val();
                workerObj.start();
                
                window.setInterval(function(){workerObj.start();},10000);
            });
        },
        
        randomNumExist:function(numArr,num){
        	
        	for(key in numArr){
        		
        		if(numArr[key] == num)
        			return true;
        	}
        	
        	return false;
        },

        start:function(obj){
        	console.log('Begin processing');
            var signatures =[],
            	randomSetIdx = [],
                rawData = null,
                rawDataPriority = null,
                randNumExist = false,
                textOBj = ccmf.Text.create();

            for(var priorityIdx=0;priorityIdx<setsToRead;priorityIdx++){
            	
            	/* Select a random set */
            	do{
            		var randomSetIdentifier = Math.floor(Math.random()*this.signatureLenAtRepo);
                	
            		if(randomSetIdx.length>0&&this.randomNumExist(randomSetIdx,randomSetIdentifier))
            			randNumExist=true;
            		else
            			randNumExist=false;
            		
            	}while(randNumExist)
                
                randomSetIdx.push(randomSetIdentifier);

                /* Search the Repo for a random set */
                
                this.dataObj.repoSignaturesOp('r',null,randomSetIdentifier,randomSetIdentifier,function(snapshot){

                    rawData = snapshot.exportVal();
                    
                    signatures.push(rawData);
                    
                    if(signatures.length==5){
                        var newWorker = ccmf.Worker.create();
                    	newWorker.process(signatures,randomSetIdx);
                    }
                });
            }
        },
        
        process:function(obtainedSignatures,globalSetIdentifier){
            
            var formattedSignatures = [],
                priority=null,
            	sigDomainPaths = [],
            	currentSig = [],
                textMod = ccmf.Text.create(),
                candidatePairs = [],
                obtainedSig = null;
                
            this.dataObj = ccmf.Data.create();
            
            for(var sigIdx=0;sigIdx<obtainedSignatures.length;sigIdx++){
                
                obtainedSig = obtainedSignatures[sigIdx];
                sigDomainPaths[globalSetIdentifier[sigIdx]] = [];
                
                for(timestamp in obtainedSig){
                    
                    currentSig = [];
                    
                    /* Format the signature element in signatures into proper array for processing */
                    for(elem=0;elem<Object.keys(obtainedSig[timestamp]).length;elem++){

                            if(Object.keys(obtainedSig[timestamp])[elem]=="domain"){
                                    sigDomainPaths[globalSetIdentifier[sigIdx]].domain = obtainedSig[timestamp][Object.keys(obtainedSig[timestamp])[elem]];
                            }else if(Object.keys(obtainedSig[timestamp])[elem]=="path"){
                                    sigDomainPaths[globalSetIdentifier[sigIdx]].path = obtainedSig[timestamp][Object.keys(obtainedSig[timestamp])[elem]];
                            }
                            else if(Object.keys(obtainedSig[timestamp])[elem]==".priority"){
                                    priority = obtainedSig[timestamp][Object.keys(obtainedSig[timestamp])[elem]];
                            }
                            else{
                                    currentSig.push(obtainedSig[timestamp][Object.keys(obtainedSig[timestamp])[elem]]['.value']);
                            }
                    }
                    
                    /* If the signature has domain & path same as current domain and path, throw it away */
                    if(sigDomainPaths[globalSetIdentifier[sigIdx]].domain!=this.dataObj.currentDomain()
                       ||
                       sigDomainPaths[globalSetIdentifier[sigIdx]].path!=this.dataObj.currentPathURL()){
                    
                            formattedSignatures[priority] = currentSig;
                            /* Current Sig must be pushed in the same order as priorities */
                       }
                    else{
                    	/* Since it belongs on the same page, remove it from the global identifier */
                    		for(var set=0;set<globalSetIdentifier.length;set++){
                    			
                    			if(globalSetIdentifier[set]==priority)
                    				globalSetIdentifier = globalSetIdentifier.splice(set,1);
                    		}
                    	
                    }
                }
            }
            
            /* Use the text method to generate the lsh */
            if(formattedSignatures.length>0){
                
                /*Sort the formatted array based on global set identifier*/
                var processedSignatureArr = [];
                
                for(var i=0;i<globalSetIdentifier.length;i++){
                    
                    processedSignatureArr.push(formattedSignatures[globalSetIdentifier[i]]);
                }
                
                candidatePairs = textMod.LSH(processedSignatureArr,20);	//At this stage only m sets
            }
            
            /* If candidate pairs exists */
            if(candidatePairs.length>0){
            	 this.result(candidatePairs,sigDomainPaths,globalSetIdentifier);
            }
        },
    
        result:function(candidatePairs,signaturesDomainPaths,globalSetIdentifier){
        	
            this.dataObj = ccmf.Data.create();

            var globalUniqueSetIdx = null,
                globalIdentifiedSetIdx = null,
                identifiedSets = [];

            /* Note : candidatePairs and globalSetIdentifer has same n sets */

            for(setIdx=0;setIdx<globalSetIdentifier.length;setIdx++){

                    /* Obtained the global unique variable */
                    globalUniqueSetIdx = globalSetIdentifier[setIdx];

                    identifiedSets[globalUniqueSetIdx] = [];

                    for(var pair=0;pair<candidatePairs.length;pair++){

                        if(candidatePairs[pair][0]==setIdx){
                            /* Either candidate matches the set index */    

                            globalIdentifiedSetIdx = globalSetIdentifier[candidatePairs[pair][1]];

                        }else if(candidatePairs[pair][1]==setIdx){


                            globalIdentifiedSetIdx = globalSetIdentifier[candidatePairs[pair][0]];
                        }


                        if(candidatePairs[pair][0]==setIdx||candidatePairs[pair][1]==setIdx){

                            var identifiedSet = {
                                        orig_idx         : globalUniqueSetIdx,
                                        orig_domain      : signaturesDomainPaths[globalUniqueSetIdx]['domain'],
                                        orig_path        : signaturesDomainPaths[globalUniqueSetIdx]['path'],
                                        tracked_domain   : this.dataObj.currentDomain(),
                                        tracked_path     : this.dataObj.currentPathURL()
                            };

                            identifiedSets[globalUniqueSetIdx].push(identifiedSet);
                        }

                    }

            }

            /* Call Data Object Save Method */
            this.dataObj.identifiedSignatures(identifiedSets);
            
            console.log('End Processing');
        }
    }
}());
