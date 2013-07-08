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

            });
        },

        start:function(){

            var fetchedSignatures=[],
                textOBj = ccmf.Text.create();

            for(var priorityIdx=0;priorityIdx<setsToRead;priorityIdx++){

                var randomSetIdentifier = Math.floor(Math.random()*this.signatureLenAtRepo);

                /* Search the Repo for a random set */

                this.dataObj.text('r',null,randomSetIdentifier,randomSetIdentifier,function(snapshot){

                    var rawData = snapshot.val();
                    console.log(rawData);
                    fetchedSignatures.push(rawData);
                    
                    var newWorker = ccmf.Worker.create();
                    newWorker.process(fetchedSignatures);
                });
            }
        },
        
        process:function(obtainedSignatures){
            
            var formattedSig = null,
                obtainedSig = null;
            
            for(var sigIdx=0;sigIdx<obtainedSignatures.length;sigIdx++){
                
                obtainedSig = obtainedSignatures[sigIdx];
                
                
                
                
            }
        }
    
    }
}());
