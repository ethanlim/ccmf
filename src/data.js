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
            this.rootRef = new Firebase(this.endpoint);
        },

        currentDomain:function(){
            return window.location.host;
        },

        currentPathURL:function(){
            // Returns the base64 hash
            return btoa(window.location.pathname);
        },

        signatureLength:function(callback){
            this.init();
            var textRef = this.rootRef.child('text');
            var sigLenRef = textRef.child('noOfSignatures');
            sigLenRef.once('value',callback);
        },
        
        /**
         * Text Data Object 
         * @param mode (w => dataObj.text('w', SIG))
         * @param signature minhash signature matrix
         * @param startPriority
         * @param endPriority
         * @param callback
         * @method text
         * @return void
         */
        repoSignaturesOp:function(mode,signature,startPriority,endPriority,callback){

            this.init();

            var textRef = this.rootRef.child('text'),
                    signaturesLabelRef = textRef.child('signatures');
                    numOfSignaturesOnRepoRef = textRef.child('noOfSignatures'),
                    uniquePriorities = [],
                    newSigUniquePriority=null;

            switch(mode){

                case 'r':

                    /* Extract a random signature which of cose will return at callback */

                    var signaturesQuery = signaturesLabelRef.startAt(startPriority).endAt(endPriority);
                    signaturesQuery.on('value',callback);

                break;

                case 'w':

                    numOfSignaturesOnRepoRef.once('value',function(snapshot){

                        // Once the number of signatures in repository is determine, let's save!

                        var numOfSignaturesOnRepo = parseInt(snapshot.val());
                        var dataObj = ccmf.Data.create();

                            //Write each individual signature
                            for(var sig=0;sig<signature.length;sig++){

                                    /* Start Critical Region */
                                    var newSignatureRef = signaturesLabelRef.push();

                                    /* End Critical Region */

                                    /* Save the unique priority locally to return to user */
                                    newSigUniquePriority = parseInt(numOfSignaturesOnRepo+sig);
                                    uniquePriorities.push(newSigUniquePriority);

                                    /* Save the domain and path of signature */
                                    newSignatureRef.setWithPriority({
                                                            domain:dataObj.currentDomain(),
                                                            path:dataObj.currentPathURL()
                                                        },
                                                        newSigUniquePriority)

                                    for(var elem=0;elem<signature[sig].length;elem++){

                                            newSignatureRef.child(elem).setWithPriority(signature[sig][elem],elem);
                                    }
                            }

                            /* Add the number of added signatures to the counter @ Repo */
                            /* Start Critical Region */

                            textRef.child('noOfSignatures').transaction(function(current_val){
                                    return current_val + signature.length;
                            });

                            /* End Critical Region */

                            // Return all the priorities assigned to user's text
                            return uniquePriorities;
                    });	

                break;
            }
        },
		
        image:function(mode,signature){
            var imageRef = this.rootRef.child('image');

            switch(mode){
            case 'r':
                    break;
            case 'w':
                    break;
            }
        },
		
        identifiedSignatures:function(identifiedSets){
            
            this.init();
            
            var textRef = this.rootRef.child('text');
            
            var identified = textRef.child('identified');
            
            for(elem in identifiedSets){
            
                for(var set=0;set<identifiedSets[elem].length;set++){

                    var globalIdx = elem;

                    identified.child(globalIdx).push(identifiedSets[globalIdx][set]);

                }
            }
            
        }
		
};

