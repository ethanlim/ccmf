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

/**
 *  Namespace Creator
 *  @param ns_string namespace string
 */
ccmf.namespace = function (ns_string) {
    'use strict';
    var parts = ns_string.split('.'),
        parent = ccmf;
    
    //Strip the redundent leading Global Variable
    if (parts[0] === "ccmf") {
        parts = parts.slice(1);
    }
    
    for (var i = 0; i < parts.length; i += 1) {
        // create a property if it doesn't exist
        if (parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
};

/**
 * The Core class.
 * @class Core
 * @constructor
 */
ccmf.Core = ccmf.namespace('Core');

/**
 * Core Constructor
 * @param none
 * @method create
 * @static
 * @return {ccmf.Core} The newly created vector.
 */
ccmf.Core = function () {
    'use strict';
    var newObj = new ccmf.Core();
    return newObj;
};

ccmf.Core.prototype = {
    
    init:function(){
    }
};