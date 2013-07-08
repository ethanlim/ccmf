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
       
       var shinglesFingerprint = new Array();
       
       for(var cur_shingle=0;cur_shingle<shinglesSet.length;cur_shingle++){
           
           /* Extract the 1st 8 characters of the 128 bit hash (32 bits) */
           var hexHashString = this.MD5(shinglesSet[cur_shingle]).substr(0,8);
           
           /* Convert it to a 32 bit integer */
           var hash = parseInt(hexHashString,16);
           
           shinglesFingerprint.push(hash);
       }
       
       return shinglesFingerprint;
     },
    
    /**
     * MD5 Hash Function
     * @param string any variable length string
     * @method MD5
     * @return 120 bits hexidecimal string
     */
     MD5: function (string) {
 
		function RotateLeft(lValue, iShiftBits) {
			return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
		}
	 
		function AddUnsigned(lX,lY) {
			var lX4,lY4,lX8,lY8,lResult;
			lX8 = (lX & 0x80000000);
			lY8 = (lY & 0x80000000);
			lX4 = (lX & 0x40000000);
			lY4 = (lY & 0x40000000);
			lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
			if (lX4 & lY4) {
				return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
			}
			if (lX4 | lY4) {
				if (lResult & 0x40000000) {
					return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
				} else {
					return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
				}
			} else {
				return (lResult ^ lX8 ^ lY8);
			}
	 	}
	 
	 	function F(x,y,z) {return (x & y) | ((~x) & z);}
	 	function G(x,y,z) {return (x & z) | (y & (~z));}
	 	function H(x,y,z) {return (x ^ y ^ z);}
		function I(x,y,z) {return (y ^ (x | (~z)));}
	 
		function FF(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};
	 
		function GG(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};
	 
		function HH(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};
	 
		function II(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};
	 
		function ConvertToWordArray(string) {
			var lWordCount;
			var lMessageLength = string.length;
			var lNumberOfWords_temp1=lMessageLength + 8;
			var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
			var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
			var lWordArray=Array(lNumberOfWords-1);
			var lBytePosition = 0;
			var lByteCount = 0;
			while ( lByteCount < lMessageLength ) {
				lWordCount = (lByteCount-(lByteCount % 4))/4;
				lBytePosition = (lByteCount % 4)*8;
				lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
				lByteCount++;
			}
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
			lWordArray[lNumberOfWords-2] = lMessageLength<<3;
			lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
			return lWordArray;
		};
	 
		function WordToHex(lValue) {
			var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
			for (lCount = 0;lCount<=3;lCount++) {
				lByte = (lValue>>>(lCount*8)) & 255;
				WordToHexValue_temp = "0" + lByte.toString(16);
				WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
			}
			return WordToHexValue;
		};
	 
		function Utf8Encode(string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
	 
			for (var n = 0; n < string.length; n++) {
	 
				var c = string.charCodeAt(n);
	 
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
	 
			}
	 
			return utftext;
		};
	 
		var x=Array();
		var k,AA,BB,CC,DD,a,b,c,d;
		var S11=7, S12=12, S13=17, S14=22;
		var S21=5, S22=9 , S23=14, S24=20;
		var S31=4, S32=11, S33=16, S34=23;
		var S41=6, S42=10, S43=15, S44=21;
	 
		string = Utf8Encode(string);
	 
		x = ConvertToWordArray(string);
	 
		a = 0x67452301;b = 0xEFCDAB89;c = 0x98BADCFE;d = 0x10325476;
	 
		for (k=0;k<x.length;k+=16) {
			AA=a;BB=b;CC=c;DD=d;
			a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
			d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
			c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
			b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
			a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
			d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
			c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
			b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
			a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
			d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
			c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
			b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
			a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
			d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
			c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
			b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
			a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
			d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
			c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
			b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
			a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
			d=GG(d,a,b,c,x[k+10],S22,0x2441453);
			c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
			b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
			a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
			d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
			c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
			b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
			a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
			d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
			c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
			b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
			a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
			d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
			c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
			b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
			a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
			d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
			c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
			b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
			a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
			d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
			c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
			b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
			a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
			d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
			c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
			b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
			a=II(a,b,c,d,x[k+0], S41,0xF4292244);
			d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
			c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
			b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
			a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
			d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
			c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
			b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
			a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
			d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
			c=II(c,d,a,b,x[k+6], S43,0xA3014314);
			b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
			a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
			d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
			c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
			b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
			a=AddUnsigned(a,AA);
			b=AddUnsigned(b,BB);
			c=AddUnsigned(c,CC);
			d=AddUnsigned(d,DD);
		}
	 
		var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
	 
		return temp.toLowerCase();
	    },
     
     /**
     *  Generate the minHash Signatures for any size of shingles fingerprint set
     *  @param shinglesFingSet, n  shinglesFingSet : a variable set of shingles n : number of rand hash functions
     *  @method minHashSignaturesGen
     *  @return SIG minhash signature matrix
     */
     minHashSignaturesGen: function(shinglesFingSet,n){
         'use strict';
         
         var percentage = 0;
         var infinity=1.7976931348623157E+10308;
         var universalSet = [];
         
         var numOfHashFn = n;     
         var SIG = new Array();
         
         for(var shinglesFingPrint=0;shinglesFingPrint<shinglesFingSet.length;shinglesFingPrint++){
             
             /* Add all shingles fingerprint to the universal set */
             universalSet = universalSet.concat(shinglesFingSet[shinglesFingPrint]);
             
             /* Initialise all SIC(i,c) to infinity */
             
             SIG[shinglesFingPrint] = new Array();
             
             for(var h=0;h<numOfHashFn;h++){
                SIG[shinglesFingPrint].push(infinity); 
                //Rows is the h1,h2,h3,h4,h5....
             }
         }
         
         //Generate n hash function
         var hashFnArr = this.hashFnGen(numOfHashFn,universalSet.length);
         var hashVal = new Array();
         var hashFn = null;
         
         /* Construct the signature matrix */
         
         for(var rows=0;rows<universalSet.length;rows++){
          
            /* Obtain one element from universal set */
            var uniElem = universalSet[rows];
            hashVal = [];
            
            /* Simulate the permutation       
             * Compute h1(r),h2(r),h3(r),.... */
            for(hashFn=0;hashFn<hashFnArr.length;hashFn++){
                hashVal.push(hashFnArr[hashFn](uniElem));
            }
            
            for(var shinglesFing=0;shinglesFing<shinglesFingSet.length;shinglesFing++){
                
                if(shinglesFingSet[shinglesFing].indexOf(uniElem)>-1){
                    
                    for(var i=0;i<SIG[shinglesFing].length;i++){
                        if(hashVal[i] < SIG[shinglesFing][i]){
                            SIG[shinglesFing][i]= hashVal[i];
                        }
                    }
                    
                }
                
            }
            
         }
         
         return SIG;
     },
    
     /**
      * Random Hash Function Generator 
      * @param k,rowlength k is the number of random hash to generate, row length determines the upper limit if hash value
      * @method hashFnGen
      * @return fnArr an array of random hash functions
      */
     hashFnGen : function(k,rowLen){
         
         var fnArr = new Array();
         
         for(var i=0;i<k;i++){
             fnArr.push(
                function(x){
                    
                    var a = Math.floor(Math.random() * rowLen) + 1;
                    var b = Math.floor(Math.random() * rowLen) + 1;
                    
                    // Module by row length to fall within it 
                    var value = (a*x+b)%rowLen;
                    
                    return value;
                }
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
         var hashFnLen = 100;
         
         var sets = this.minHashSignaturesGen(shinglesFing,hashFnLen);
         
         /* Determine the ratio of the hash function of SIGA equals to SIGB */ 
         var SIMCount = 0;
         for(var rows=0;rows<hashFnLen;rows++){
             
             if(sets[0][rows]==sets[1][rows]){
                 SIMCount++;
             }
         }
         
         /* Determine the percentage of equal hash value over all the hash value*/
         var percentage = SIMCount/hashFnLen*100;
         
         return percentage;
     },
     
     /**
      * Specialised Locality-Sensitive Hashing 
      * @param minHashSignature,band
      * @method LSH
      * @return candidatePairs array of candidate pairs
      */
     LSH : function(minHashSignature,band){
         
         var bucketsSize = 3571;
         var buckets = new Array(band);
         
         // r => num of rows per band
         var r = Math.floor(minHashSignature[0].length/band);
         
         for(var curBand=0;curBand<band;curBand++){
             
                /* New Buckets for each band */
                buckets[curBand] = new Array(bucketsSize);
                
                for(var bucket=0;bucket<bucketsSize;bucket++){
                    buckets[curBand][bucket]=new Array();
                }
              
                for(var curSet=0;curSet<minHashSignature.length;curSet++){

                    var vector = [];

                    for(var row=(curBand*(r-1)+curBand);row<(curBand*(r-1)+curBand+r);row++){

                        var element = minHashSignature[curSet][row];

                        vector.push(element);
                    }

                    var hash = this.LSHHashingFn(vector,bucketsSize);

                    buckets[curBand][hash].push(curSet);
                }
         }
         
         
         var numOfCandidates = 0;
         var candidatePairs = [];
         
         for(curBand=0;curBand<band;curBand++){
            
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