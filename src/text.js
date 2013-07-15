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

ccmf.namespace('ccmf.Text');

/**
 * The Text class.
 * @class Text
 * @constructor
 */
ccmf.Text = function () {
    'use strict';
};

/**
 * Text Object Constructor
 * @param none
 * @method create
 * @static
 * @return {ccmf.Text} The newly created vector.
 */
ccmf.Text.create = function () {
    'use strict';
    var newObj = new ccmf.Text();
    return newObj;
};

/**
 * The Text class prototype
 * @class Text
 * @constructor
 */
ccmf.Text.prototype = {
    
    /**
     * The set of stop words that would be identified
     */
    stopWords : ['to','that','a','for','the','that','have','it','is'],
    alphabets : "abcdefghijklmnopqrstuvwxyz",
    bands : 20,
    
    /**
     *  Function that determines if word is a stop word
     *  @param word input word to be checked
     *  @method isStopWord
     *  @return {bool} true/false 
     */
    isStopWord: function(word){
        'use strict';
        for(var i=0;i<this.stopWords.length;i++){
            if(word.toLowerCase()==this.stopWords[i])
                return true;
        }
        return false;
    },
    
    /**
     * Remove the stop words within a textual content
     * @param rawText raw textual content
     * @method removeStopWords
     * @return {string} 
     */
    removeStopWords: function(rawText){
        'use strict';
        var textArray = rawText.split(' ');
        for(var i=0;i<textArray.length;i++){
            if(this.isStopWord(textArray[i])){
                textArray.splice(i,1);
            }
        }
        return textArray.join(' ');
    },
    
    /**
     * Extract the shingles based on the characters 
     * Methodology: extract overlapping k-grams and stemmed
     * ie. k=3, {abc,bcd,cde,...} from abcdefgh
     * Recommended for news articles k = 9 
     * @param rawText raw textual content without white spaces
     * @param k     length of shingles (substring)
     * @method fixedShingles
     * @return the set of shingles
     */
    fixedShinglesWithoutWS: function(rawText,k){
        'use strict';
        /* Remove Non-Alpha Characters */
        rawText = rawText.replace(/\W/g, '');
        var textWithoutWS = rawText.replace(/ /g,'');
        var shinglesSet = new Array();
        for(var i=0;i<textWithoutWS.length;i++){
            if(i+k-1<textWithoutWS.length)
                shinglesSet.push(textWithoutWS.substr(i,k));   
        }
        return shinglesSet;
    },
    
    /**
     * Extract the shingles after removal of stop words
     * ie. k=3, {abc,bcd,cde,...} from abcdefgh
     * @param rawText raw textual content
     * @param k     length of shingles (substring)
     * @method removedStopWordShingles
     * @return the set of shingles
     */
    removedStopWordShingles: function(rawText,k){
        'use strict';
        /* After the removal of Stop Words, extract the shingles as usual*/
        var shinglesSet = this.fixedShinglesWithoutWS(this.removeStopWords(rawText),k);  
        return shinglesSet;
    },
    
    /**
     * Extract Shingles via two words after stop word 
     * @param rawText raw textual content
     * @method stopMoreShingles
     * @return the set of shingles
     */
    stopMoreShingles: function(rawText){
        'use strict';
        /* Remove Non-Alpha Characters */
        rawText = rawText.replace(/\W/g, '');
        var textArray = rawText.split(' ');
        var shinglesSet=new Array();
        for(var i=0;i<textArray.length;i++){
            
            if(this.isStopWord(textArray[i])){
            
                /* Take the next two words and skip them */
                if(i==textArray.length-1)
                    shinglesSet.push(textArray[i]);
                else if(i+1==textArray.length-1)
                    shinglesSet.push(textArray[i]+' '+textArray[i+1]);
                else                              
                    shinglesSet.push(textArray[i]+' '+textArray[i+1]+' '+textArray[i+2]);
               
            }
        }
        return shinglesSet;
    },
    
    /**
     * Hash Shingles to 32 bit integers
     * @param shinglesSet set of shingles
     * @method shinglesFingerprintConv
     * @return shinglesFingerprint set of 32 integers
     */
     shinglesFingerprintConv: function(shinglesSet){
        'use strict';
        
       var shinglesFingerprint = new Array();
       
       /* Foreach shingles */
       for(var cur_shingle=0;cur_shingle<shinglesSet.length;cur_shingle++){
           
           /* Extract the 1st 8 characters of the 128 bit hash (32 bits) */
           var hexHashString = MD5.encode((shinglesSet[cur_shingle])).substr(0,8);
           
           /* Convert it to a 32 bit - 4 bytes integer */
           var hash = parseInt(hexHashString,16);
           
           shinglesFingerprint.push(hash);
       }
       
       return shinglesFingerprint;
     },
     
     /**
     *  Generate the minHash Signatures for any size of shingles fingerprint set
     *  @param shinglesFingSet, n  shinglesFingSet : a variable set of shingles n : number of rand hash functions
     *  @method minHashSignaturesGen
     *  @return SIG minhash signature matrix
     */
     minHashSignaturesGen: function(shinglesFingSet,n){
        'use strict';

        var infinity=1.7976931348623157E+10308,
            universal = 4294967296,
            numOfHashFn = n,
            SIG = new Array(),                                  //Signature Matrix
            hashFnArr = this.hashFnGen(numOfHashFn,universal),  //Generate n random hash function
            hashVal = new Array(),
            c=null,
            i=null,
            shingles=null,
            hashFn=null;
           
        /* Construct the signature matrix */
        for(c=0;c<shinglesFingSet.length;c++){

            /* Initialise all SIC(i,c) to infinity */
            SIG[c] = new Array();

            /* Foreach column , set all rows to infinity*/
            for(i=0;i<numOfHashFn;i++){
                SIG[c].push(infinity); 
            }

            for(shingles=0;shingles<shinglesFingSet[c].length;shingles++){
                
                /* Obtain one element (4 bytes int) from universal set [Implied c has 1 in row r]*/
                var r = shinglesFingSet[c][shingles];

                /* Simulate the permutation       
                * Compute h1(r),h2(r),h3(r),.... */
                hashVal = [];
                for(hashFn=0;hashFn<hashFnArr.length;hashFn++){
                    hashVal.push(hashFnArr[hashFn](r));
                }
                
                /* Both n and SIG[c].length are equal */
                for(i=0;i<SIG[c].length;i++){
                    if(hashVal[i] < SIG[c][i]){
                        SIG[c][i]= hashVal[i];
                    }
                }
            }   
        }
        
        return SIG;
     },
    
     /**
      * Random Hash Function Generator 
      * @param k - k is the number of random hash to generate
      * @param rowLen - row length determines the upper limit
      * @method hashFnGen
      * @return fnArr an array of random hash functions
      */
     hashFnGen : function(k,rowLen){
         
         var fnArr = new Array(), aRan = [],bRan =[];
         var min = 1;
         var max = rowLen-1;
            
         /* This ensure that a and b are not reference of aRan and bRan */
         function createFn(a,b){
             return function(x){
                    
                    // Modulo by row length to fall within it 
                    var value = (a*x+b)%rowLen;
                  
                    return value;
             };
         };   
         
         for(var i=0;i<k;i++){
             
             /* These are kept as reference inside the closure */
             aRan = Math.floor(Math.random() * (max - min + 1)) + min;  
             bRan = Math.floor(Math.random() * (max - min + 1)) + min;  
             
             fnArr.push(
                createFn(aRan,bRan)
             );
         }
         
         return fnArr;
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
         
         var shinglesFing = new Array();
         shinglesFing[0] = shinglesFingA;
         shinglesFing[1]= shinglesFingB;
         var n = 100;
         
         var SIG = this.minHashSignaturesGen(shinglesFing,n);
         
         /* Determine the ratio of the hash function of SIGA equals to SIGB */ 
         var CollisionCount = 0;
         for(var h=0;h<n;h++){
             
             if(SIG[0][h]==SIG[1][h]){
                 CollisionCount++;
             }
         }
         
         /* Determine the percentage of equal hash value over all the hash value*/
         var percentage = CollisionCount/n*100;
         
         return percentage;
     },
     
     /**
      * Specialised Locality-Sensitive Hashing 
      * @param minHashSignature,band
      * @method LSH
      * @return candidatePairs array of candidate pairs
      */
     LSH : function(minHashSignature){
         
         var    bucketsSize = 1301081,
                numOfBands  = this.bands,
                buckets     = new Array(numOfBands),
                hashSet     = new Array(numOfBands),
                curBand     = null, 
                curSet      = null,
                vector      = null,
                row         = null,
                element     = null,
                hash        = null,
                bucket      = null;
         
         // r => num of rows per band
         var r = Math.floor(minHashSignature[0].length/numOfBands);
         
         for(curBand=0;curBand<numOfBands;curBand++){
             
                /* New Buckets for each band */
                buckets[curBand] = new Array(bucketsSize);
                hashSet[curBand] = [];
                
                for(bucket=0;bucket<bucketsSize;bucket++){
                    buckets[curBand][bucket]=new Array();
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
         
         var results = {
            buckets : buckets,
            hashSet : hashSet
         }
         
         return results;
     },
     
     candididatePairsExtraction:function(buckets){
    	
    	 var numOfCandidates = 0;
         var candidatePairs = [];
         
         for(curBand=0;curBand<this.bands;curBand++){
            
            for(var idx=0;idx<buckets[curBand].length;idx++){

                if(typeof buckets[curBand][idx]!="undefined" && buckets[curBand][idx].length>1){
                    
                    /* There is one or more pairs in this bucket */
                    
                    /* Extract the pairs */
                    
                    var elems = buckets[curBand][idx];
                    
                    var combi = this.k_combinations(elems,2);
                    
                    while(combi.length>0){
                        
                        var insertedCP = combi.pop();
                        
                        if(!this.candidateExist(candidatePairs,elems))
                             candidatePairs.push(insertedCP);        
                    }
                    
                    numOfCandidates++;
                }
            }
         }
         
         return candidatePairs;	 
     },
     
     LSHHashingFn : function(vector,bucketsSize){
         
         var T1,T2;
         var Sum=0;
         
         for(var pts=0;pts<vector.length;pts++){
             
             Sum += Math.pow(vector[pts],pts);
             
         }
         
         T1 = Sum%bucketsSize;
         
         return T1;
     },
     
     k_combinations: function (set, k) {
        var i, j, combs, head, tailcombs;
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
        // Assert {1 < k < set.length}
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
    
     candidateExist : function(candidateList,potentialCandidate){
        
        for(var can=0;can<candidateList.length;can++){
           
           arr = candidateList[can];
           
           if(arr[0]==potentialCandidate[0]&&arr[1]==potentialCandidate[1]){
               return true;
           }
           
        }
        
        return false;
    }
};