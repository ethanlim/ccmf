/*
 *      Creative Common's Media Fingerprint Library
 *      Copyright (c) 2013, Lim Zhi Hao (Ethan)
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

ccmf.namespace('ccmf.Text');

/**
 * The Text class.
 * @class Text
 */
ccmf.Text = function () {
    'use strict';
};

/**
 * Text Object Constructor
 * @param none
 * @method create
 * @static
 * @constructor
 * @return {Object} The newly created vector.
 */
ccmf.Text.create = function () {
    'use strict';
    var newObj = new ccmf.Text();
    return newObj;
};

/**
 * The Text class prototype
 * @class Text
 */
ccmf.Text.prototype = {
    
    /**
     * The set of stop words that would be identified
     */
    stopWords : ['to','that','a','for','the','that','have','it','is'],
    alphabets : "abcdefghijklmnopqrstuvwxyz",
    bands : 20,
    n : 100,
    
    /**
     *  Function that determines if word is a stop word
     *  @param {String} word - input word to be checked
     *  @method isStopWord
     *  @return {Bool} true/false 
     */
    isStopWord: function(word){
        'use strict';
        var i = 0,
        max = 0;
        
        for(i=0,max=this.stopWords.length;i<max;i+=1){
            if(word!=undefined&&(word.toLowerCase()===this.stopWords[i])){
                return true;
            }
        }
        return false;
    },
    
    /**
     * Remove the stop words within a textual content
     * @param {String} rawText - raw textual content
     * @method removeStopWords
     * @return {String} fliteredTextString - raw text without stop words 
     */
    removeStopWords: function(rawText){
        'use strict';
        var i = 0,
        max = 0,
        textArray = rawText.split(' '),
        fliteredTextString = '';
        
        for(i=0,max=textArray.length;i<max;i+=1){
            if(this.isStopWord(textArray[i])){
                textArray.splice(i,1);
            }
        }
        
        fliteredTextString = textArray.join(' ');
        
        return fliteredTextString;
    },
    
    /**
     * Extract the shingles based on the characters 
     * Methodology: extract overlapping k-grams and stemmed
     * ie. k=3, {abc,bcd,cde,...} from abcdefgh
     * Recommended for news articles k = 9 
     * @param {String} rawText - raw textual content without white spaces
     * @param {Number} k - length of shingles (substring)
     * @method fixedShinglesWithoutWS
     * @return {Array} shinglesSet - the set of shingles
     */
    fixedShinglesWithoutWS: function(rawText,k){
        'use strict';
        var textWithoutWS = rawText.replace(/\W/g, '').replace(/ /g,''),
        	shinglesSet = new Array(),
        	i,
        	max;
        
        for(i=0,max=textWithoutWS.length;i<max;i+=1){
            if(i+k-1<max){
                shinglesSet.push(textWithoutWS.substr(i,k));   
            }
        }
        return shinglesSet;
    },
    
    /**
     * Extract the shingles after removal of stop words
     * ie. k=3, {abc,bcd,cde,...} from abcdefgh
     * Just a wrapper for two functions : removeStopWords => fixedShinglesWithoutWS
     * @param rawText - raw textual content
     * @param k	- length of shingles
     * @method removedStopWordShingles
     * @return {Array} shinglesSet - the set of shingles
     */
    removedStopWordShingles: function(rawText,k){
        'use strict';
        /* After the removal of Stop Words, extract the shingles as usual*/
        var shinglesSet = this.fixedShinglesWithoutWS(this.removeStopWords(rawText),k);  
        return shinglesSet;
    },
    
    /**
     * Extract Shingles via two words after stop word 
     * @param {String} rawText - raw textual content
     * @method stopMoreShingles
     * @return {Array} shinglesSet - the set of shingles
     */
    stopMoreShingles: function(rawText){
        'use strict';
        /* Remove Non-Alpha Characters */
        var textArray = rawText.replace(/\W/g, '').split(' '),
        	shinglesSet=[],
        	i=0,
        	max=0;
        
        for(i=0,max=textArray.length;i<max;i++){
            
            if(this.isStopWord(textArray[i])){
            
                /* Take the next two words and skip them */
                if(i==max-1){
                    shinglesSet.push(textArray[i]);
                }else if(i+1==max-1){
                    shinglesSet.push(textArray[i]+' '+textArray[i+1]);
                }else{                              
                    shinglesSet.push(textArray[i]+' '+textArray[i+1]+' '+textArray[i+2]);
                }
            }
            
        }
        return shinglesSet;
    },
    
    /**
     * Hash Shingles to 32 bit integers
     * @param {Array} shinglesSet - set of shingles
     * @method shinglesFingerprintConv
     * @return {Array} shinglesFingerprint - set of 32 integers
     */
     shinglesFingerprintConv: function(shinglesSet){
    	 'use strict';
        
    	 var shinglesFingerprint = [],
    	 cur_shingle=0,
    	 hexHashString='',
    	 shinglesSetLen = 0,
    	 hash = 0;
       
    	 /* Foreach shingles */
    	 for(cur_shingle=0,shinglesSetLen=shinglesSet.length;cur_shingle<shinglesSetLen;cur_shingle+=1){
           
    		 /* Extract the 1st 8 characters of the 128 bit hash (32 bits) */
    		 hexHashString = MD5.encode((shinglesSet[cur_shingle])).substr(0,8);
           
    		 /* Convert it to a 32 bit - 4 bytes integer */
    		 hash = parseInt(hexHashString,16);
           
    		 shinglesFingerprint.push(hash);
    	 }
	       
    	 return shinglesFingerprint;
     },
     
     /**
      *  Generate the minHash Signatures for any size of shingles fingerprint set
      *  @param {Array} shinglesFingSet - a variable set of shingles
      *  @method minHashSignaturesGen
      *  @return {Array} - SIG minhash signature matrix
      */
     minHashSignaturesGen: function(shinglesFingSet){
        'use strict';

        var infinity=1.7976931348623157E+10308,
            universal = 4294967296,
            numOfHashFn = this.n,
            SIG = [],                                  			//Signature Matrix
            hashFnArr = this.hashFnGen(numOfHashFn,universal),  //Generate n random hash function
            hashVal = [],
            c=0,
            i=0,
            r='',
            shingles = 0,
            hashFn = null,
            maxNumOfHashFn = 0,
            shinglesFingSetMax = 0,
            maxNumOfShingles = 0,
            LSHRowLen = 0;
           
        /* Construct the signature matrix */
        for(c=0,shinglesFingSetMax=shinglesFingSet.length;c<shinglesFingSetMax;c+=1){

            /* Initialise all SIC(i,c) to infinity */
            SIG[c] = [];

            /* Foreach column , set all rows to infinity*/
            for(i=0;i<numOfHashFn;i+=1){
                SIG[c].push(infinity); 
            }

            for(shingles=0,maxNumOfShingles=shinglesFingSet[c].length;shingles<maxNumOfShingles;shingles+=1){
                
                /* Obtain one element (4 bytes int) from universal set [Implied c has 1 in row r]
                 * The implication is because all element are a subset of the universal set     
                 */
                r = shinglesFingSet[c][shingles];

                /* Simulate the permutation of the rows     
                * Compute h1(r),h2(r),h3(r),.... 
                */
                hashVal = [];
                for(hashFn=0,maxNumOfHashFn=hashFnArr.length;hashFn<maxNumOfHashFn;hashFn+=1){
                    hashVal.push(hashFnArr[hashFn](r));
                }
                
                /* Both n and SIG[c].length are equal */
                for(i=0,LSHRowLen=SIG[c].length;i<LSHRowLen;i+=1){
                    if(hashVal[i] < SIG[c][i]){
                        SIG[c][i] = hashVal[i];
                    }
                }
            }   
        }
        
        return SIG;
     },
    
     /**
      * Random Hash Function Generator 
      * @param {Number} k - k is the number of random hash to generate
      * @param {Number} rowLen - row length determines the upper limit
      * @method hashFnGen
      * @return {Array} functionArray - an array of random hash functions
      */
     hashFnGen: function(k,rowLen){
    	 'use strict';
    	 
    	 /* Fixed Hash Function Generator - Always Generate a 100 Hash Fn */
         var functionArray =  MinHashFn.Generate();
    	 
         return functionArray;
         
         /* True Random Function Generator */
         
         /*
         var fnArr = new Array(), aRan = [],bRan =[];
         var min = 1;
         var max = rowLen-1;
            
         // This ensure that a and b are not reference of aRan and bRan 
         function createFn(a,b){
             return function(x){
                    
                    // Modulo by row length to fall within it 
                    var value = (a*x+b)%rowLen;
                  
                    return value;
             };
         };   
         
         for(var i=0;i<k;i++){
             
             // These are kept as reference inside the closure 
             aRan = Math.floor(Math.random() * (max - min + 1)) + min;  
             bRan = Math.floor(Math.random() * (max - min + 1)) + min;  
             
             fnArr.push(
                createFn(aRan,bRan)
             );
         }
         
         return fnArr;
         
         */
     },
     
     /**
      * Compare two shingles set
      * Methodology: Practical Method
      * @param shinglesFingA,shinglesFingB
      * @method compareTwoSignatures
      * @return percentage 
      */
     compareTwoSignaturesPractical: function(shinglesFingA,shinglesFingB){
         'use strict';
         
         var shinglesFing = [],
         h = 0,
         n = this.n,
         CollisionCount = 0,
         percentage = 0,
         SIG = null;
         
         shinglesFing[0] = shinglesFingA;
         shinglesFing[1]= shinglesFingB;
         
         SIG = this.minHashSignaturesGen(shinglesFing,n);
         
         /* Determine the ratio of the hash function of SIGA equals to SIGB */ 
         
         for(h=0;h<n;h++){
             if(SIG[0][h]===SIG[1][h]){
                 CollisionCount++;
             }
         }
         
         /* Determine the percentage of equal hash value over all the hash value*/
         percentage = CollisionCount/n*100;
         
         return percentage;
     },
     
     /**
      * Specialised Locality-Sensitive Hashing 
      * @param minHashSignature
	  * @param realNumOfBands
      * @method LSH
      * @return candidatePairs array of candidate pairs
      */
     LSH : function(minHashSignature,realNumOfBands){
    	 'use strict';
         var    bucketsSize = 104729,
                numOfBands  = this.bands,
                buckets     = new Array(numOfBands),
                hashSet     = new Array(numOfBands),
                curBand     = null, 
                curSet      = null,
                vector      = null,
                row         = null,
                element     = null,
                hash        = null,
                r = 0,
                bucket      = null,
                results		= null;
         
         // r => num of rows per band
         r = Math.floor(minHashSignature[0].length/numOfBands);
         
         for(curBand=0;curBand<numOfBands;curBand++){
             
                /* New Buckets for each band */
                buckets[curBand] = new Array(bucketsSize);
                hashSet[curBand] = [];
                
                for(bucket=0;bucket<bucketsSize;bucket++){
                    buckets[curBand][bucket]=[];
                }
              
                /* For each minhash signature set */
                for(curSet=0;curSet<minHashSignature.length;curSet++){
                    /* Rows within a single band in one signature */
                    vector = [];

                    for(row=(curBand*(r-1)+curBand);row<(curBand*(r-1)+curBand+r);row++){

                        element = minHashSignature[curSet][row];

                        vector.push(element);
                    }

                    hash = this.LSHHashingFn(vector,bucketsSize);

                    /* Hash this into the current band buckets*/
                    buckets[curBand][hash].push(curSet);
                    /* Also record this hash for the current band  for this set*/
                    hashSet[curBand].push(hash);
                }
         }
         
         results = {
            buckets : buckets,
            hashSet : hashSet
         };
         
         return results;
     },
     
     /**
      * Extract the candidate pairs from all buckets
      * @param {Array} buckets
      * @returns {Array} candidate pairs
      */
     candididatePairsExtraction:function(buckets){
    	 'use strict';
    	 var numOfCandidates = 0,
    	 curBand = 0,
    	 idx = 0,
    	 elems = 0,
    	 combi = null,
    	 insertedCP = null,
    	 candidatePairs = [];
         
         for(curBand=0;curBand<this.bands;curBand++){
            
            for(idx=0;idx<buckets[curBand].length;idx++){

                if(typeof buckets[curBand][idx]!=="undefined" && buckets[curBand][idx].length>1){
                    
                    /* There is one or more pairs in this bucket */
                    
                    /* Extract the pairs */
                    
                	elems = buckets[curBand][idx];
                    
                    combi = this.k_combinations(elems,2);
                    
                    while(combi.length>0){
                        
                        insertedCP = combi.pop();
                        
                        if(!this.candidateExist(candidatePairs,elems))
                             candidatePairs.push(insertedCP);        
                    }
                    
                    numOfCandidates++;
                }
            }
         }
         
         return candidatePairs;	 
     },
     
     /**
      * Hash each vector of each bands into an unsigned integer
      * @param {Array} vector
      * @param {Number} bucketsSize
      * @returns {Number} hash
      */
     LSHHashingFn : function(vector,bucketsSize){
    	 'use strict';
         var hash = 0,
         pts = 0,
         sum = 0;
         
         for(pts=0;pts<vector.length;pts++){
             
             sum += Math.pow(vector[pts],pts);
         }
         
         hash = sum%bucketsSize;
         
         return hash;
     },
     
     /**
      * Find the combinations within characters
      * @param {Array} set	- The set of characters
      * @param {Number} k
      * @returns {Array} combs - All combinations
      */
     k_combinations: function (set, k) {
    	'use strict';
        var i = 0, 
        j = 0, 
        combs = '', 
        head = '', 
        tailcombs = '';
        
        if (k > set.length || k <= 0) {
        	return [];
        }
        if (k == set.length) {
        	return [set];
        }
        if (k == 1) {
        	combs = [];
	        for (i = 0; i < set.length; i++) {
	        	combs.push([set[i]]);
	        }
	        return combs;
        }
        
        combs = [];
        for (i = 0; i < set.length - k + 1; i++) {
        	head = set.slice(i, i+1);
        	tailcombs = this.k_combinations(set.slice(i + 1), k - 1);
        	for (j = 0; j < tailcombs.length; j++) {
        		combs.push(head.concat(tailcombs[j]));
        	}
        }
        return combs;
    },
    
    /**
     * If candidate pairs exist in a given set of candidates
     * @param {Array} candidateList
     * @param {Array} potentialCandidate
     * @returns {Boolean} 
     */
     candidateExist : function(candidateList,potentialCandidate){
     
    	 var can = 0;
    	 
    	 for(can=0;can<candidateList.length;can++){
           
           arr = candidateList[can];
           
           if(arr[0]===potentialCandidate[0]&&arr[1]===potentialCandidate[1]){
               return true;
           }
           
        }
        
        return false;
    }
};