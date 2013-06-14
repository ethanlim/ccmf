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

/*
 *  Global Library Namespace
 */
var ccmf = ccmf || {};

/*
 *  Namespace Creator
 *  @param ns_string namespace string
 */
ccmf.namespace = function (ns_string) {
    'use strict';
    var parts = ns_string.split('.'),
        parent = ccmf,
        i;
    if (parts[0] === "ccmf") {
        parts = parts.slice(1);
    }
    for (i = 0; i < parts.length; i += 1) {
        // create a property if it doesn't exist
        if (parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
};

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
 * The Text class prototype
 * @class Text
 * @constructor
 */
ccmf.Text.prototype = {
    
    /**
     * The set of stop words that would be identified
     */
    stopWords : ['to','that','a','for','the','that','have','it','is'],
    
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
     * Extract the shingles based on the characters 
     * ie. k=3, {abc,bcd,cde,...} from abcdefgh
     * @param input textual content
     * @param k     length of shingles (substring)
     * @method fixedShingles
     * @return the set of shingles
     */
    fixedShingles: function(input,k){
        'use strict';
    },
    
    /**
     * Extract the shingles after removal of stop words
     * ie. k=3, {abc,bcd,cde,...} from abcdefgh
     * @param input textual content
     * @param k     length of shingles (substring)
     * @method removedStopWordShingles
     * @return the set of shingles
     */
    removedStopWordShingles: function(input,k){
        'use strict';
    },
    
    /**
     * Extract Shingles via two words after stop word 
     * @param input textual content
     * @method stopMoreShingles
     * @return the set of shingles
     */
    stopMoreShingles: function(input){
        'use strict';
        var text = input.split(' ');
        var shinglesSet=new Array();
        
        for(var i=0;i<text.length;i++){
            
            if(this.isStopWord(text[i])){
                
                /* Take the next two words and skip them */
                if(i==text.length-1)
                    shinglesSet.push(text[i]);
                else if(i+1==text.length-1)
                    shinglesSet.push(text[i]+' '+text[i+1]);
                else                              
                    shinglesSet.push(text[i]+' '+text[i+1]+' '+text[i+2]);
               
            }
        }
        
        return shinglesSet;
    }
};

/**
 * Create a new Text Obj.
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