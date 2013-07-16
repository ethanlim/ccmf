/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  SHA-1 implementation in JavaScript | (c) Chris Veness 2002-2010 | www.movable-type.co.uk      */
/*   - see http://csrc.nist.gov/groups/ST/toolkit/secure_hashing.html                             */
/*         http://csrc.nist.gov/groups/ST/toolkit/examples.html                                   */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Sha1 = {};  // Sha1 namespace

/**
 * Generates SHA-1 hash of string
 *
 * @param {String} msg                String to be hashed
 * @param {Boolean} [utf8encode=true] Encode msg as UTF-8 before generating hash
 * @returns {String}                  Hash of msg as hex character string
 */
Sha1.hash = function(msg, utf8encode) {
  utf8encode =  (typeof utf8encode == 'undefined') ? true : utf8encode;
  
  // convert string to UTF-8, as SHA only deals with byte-streams
  if (utf8encode) msg = Utf8.encode(msg);
  
  // constants [§4.2.1]
  var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  
  // PREPROCESSING 
  
  msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]
  
  // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
  var l = msg.length/4 + 2;  // length (in 32-bit integers) of msg + ‘1’ + appended length
  var N = Math.ceil(l/16);   // number of 16-integer-blocks required to hold 'l' ints
  var M = new Array(N);
  
  for (var i=0; i<N; i++) {
    M[i] = new Array(16);
    for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
      M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) | 
        (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
    } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
  }
  // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
  // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
  // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
  M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14])
  M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;
  
  // set initial hash value [§5.3.1]
  var H0 = 0x67452301;
  var H1 = 0xefcdab89;
  var H2 = 0x98badcfe;
  var H3 = 0x10325476;
  var H4 = 0xc3d2e1f0;
  
  // HASH COMPUTATION [§6.1.2]
  
  var W = new Array(80); var a, b, c, d, e;
  for (var i=0; i<N; i++) {
  
    // 1 - prepare message schedule 'W'
    for (var t=0;  t<16; t++) W[t] = M[i][t];
    for (var t=16; t<80; t++) W[t] = Sha1.ROTL(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);
    
    // 2 - initialise five working variables a, b, c, d, e with previous hash value
    a = H0; b = H1; c = H2; d = H3; e = H4;
    
    // 3 - main loop
    for (var t=0; t<80; t++) {
      var s = Math.floor(t/20); // seq for blocks of 'f' functions and 'K' constants
      var T = (Sha1.ROTL(a,5) + Sha1.f(s,b,c,d) + e + K[s] + W[t]) & 0xffffffff;
      e = d;
      d = c;
      c = Sha1.ROTL(b, 30);
      b = a;
      a = T;
    }
    
    // 4 - compute the new intermediate hash value
    H0 = (H0+a) & 0xffffffff;  // note 'addition modulo 2^32'
    H1 = (H1+b) & 0xffffffff; 
    H2 = (H2+c) & 0xffffffff; 
    H3 = (H3+d) & 0xffffffff; 
    H4 = (H4+e) & 0xffffffff;
  }

  return Sha1.toHexStr(H0) + Sha1.toHexStr(H1) + 
    Sha1.toHexStr(H2) + Sha1.toHexStr(H3) + Sha1.toHexStr(H4);
}

//
// function 'f' [§4.1.1]
//
Sha1.f = function(s, x, y, z)  {
  switch (s) {
  case 0: return (x & y) ^ (~x & z);           // Ch()
  case 1: return x ^ y ^ z;                    // Parity()
  case 2: return (x & y) ^ (x & z) ^ (y & z);  // Maj()
  case 3: return x ^ y ^ z;                    // Parity()
  }
}

//
// rotate left (circular left shift) value x by n positions [§3.2.5]
//
Sha1.ROTL = function(x, n) {
  return (x<<n) | (x>>>(32-n));
}

//
// hexadecimal representation of a number 
//   (note toString(16) is implementation-dependant, and  
//   in IE returns signed numbers when used on full words)
//
Sha1.toHexStr = function(n) {
  var s="", v;
  for (var i=7; i>=0; i--) { v = (n>>>(i*4)) & 0xf; s += v.toString(16); }
  return s;
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
/*              single-byte character encoding (c) Chris Veness 2002-2010                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Utf8 = {};  // Utf8 namespace

/**
 * Encode multi-byte Unicode string into utf-8 multiple single-byte characters 
 * (BMP / basic multilingual plane only)
 *
 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
 *
 * @param {String} strUni Unicode string to be encoded as UTF-8
 * @returns {String} encoded string
 */
Utf8.encode = function(strUni) {
  // use regular expressions & String.replace callback function for better efficiency 
  // than procedural approaches
  var strUtf = strUni.replace(
      /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
      function(c) { 
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
    );
  strUtf = strUtf.replace(
      /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
      function(c) { 
        var cc = c.charCodeAt(0); 
        return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
    );
  return strUtf;
}

/**
 * Decode utf-8 encoded string back into multi-byte Unicode characters
 *
 * @param {String} strUtf UTF-8 string to be decoded back to Unicode
 * @returns {String} decoded string
 */
Utf8.decode = function(strUtf) {
  // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
  var strUni = strUtf.replace(
      /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
      function(c) {  // (note parentheses for precence)
        var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f); 
        return String.fromCharCode(cc); }
    );
  strUni = strUni.replace(
      /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
      function(c) {  // (note parentheses for precence)
        var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
        return String.fromCharCode(cc); }
    );
  return strUni;
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  MD5 Implementation                                                                            */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var MD5 = {};

/**
 * MD5 Hash Function
 * @param string any variable length string
 * @method encode
 * @return 120 bits hexidecimal string
 */
MD5.encode = function (string) {
 
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
}

/**
 *  MinHash Hash Functions
 */

var MinHashFn = {};


MinHashFn.Generate = function(){
    
    var FunctionArray = [];
    var rowLen = 4294967296;
    
    FunctionArray[0] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (938243813*x+449548425)%rowLen;

        return value;
    };
    FunctionArray[1] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (3501656610*x+3972643584)%rowLen;

        return value;
    };
    FunctionArray[2] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (989286798*x+1740616241)%rowLen;

        return value;
    };
    FunctionArray[3] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (279445565*x+227321191)%rowLen;

        return value;
    };
    FunctionArray[4] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (2525138838*x+2375197675)%rowLen;

        return value;
    };
    FunctionArray[5] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (1391177992*x+2273598062)%rowLen;

        return value;
    };
    FunctionArray[6] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (1765233525*x+3122473841)%rowLen;

        return value;
    };
    FunctionArray[7] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (2543622534*x+3276150337)%rowLen;

        return value;
    };
    FunctionArray[8] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (3538112737*x+1214063340)%rowLen;

        return value;
    };
    FunctionArray[9] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (693746806*x+645677509)%rowLen;

        return value;
    };
    FunctionArray[10] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (2688207442*x+922213198)%rowLen;

        return value;
    };
    FunctionArray[11] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (1083836246*x+3273423626)%rowLen;

        return value;
    };
    FunctionArray[12] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (879484938*x+649482222)%rowLen;

        return value;
    };
    FunctionArray[13] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (781585411*x+2187620941)%rowLen;

        return value;
    };
    FunctionArray[14] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (4217187924*x+409282534)%rowLen;

        return value;
    };
    FunctionArray[15] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (3997304204*x+3483865819)%rowLen;

        return value;
    };
    FunctionArray[16] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (1890696230*x+3837954244)%rowLen;

        return value;
    };
    FunctionArray[17] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (2400333341*x+2117565765)%rowLen;

        return value;
    };
    FunctionArray[18] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (1894529290*x+1415821789)%rowLen;

        return value;
    };
    FunctionArray[19] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (3934480093*x+82924441)%rowLen;

        return value;
    };
    FunctionArray[20] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (457936083*x+3502020083)%rowLen;

        return value;
    };
    FunctionArray[21] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (2057448810*x+825873002)%rowLen;

        return value;
    };
    FunctionArray[22] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (70956257*x+3803368919)%rowLen;

        return value;
    };
    FunctionArray[23] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (4111065769*x+577911722)%rowLen;

        return value;
    };
    FunctionArray[24] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (3647861596*x+375847830)%rowLen;

        return value;
    };
    FunctionArray[25] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (2199282009*x+3056603428)%rowLen;

        return value;
    };
    FunctionArray[26] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (3792129462*x+1729987571)%rowLen;

        return value;
    };
    FunctionArray[27] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (222422346*x+2361499571)%rowLen;

        return value;
    };
    FunctionArray[28] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (4133247564*x+158419197)%rowLen;

        return value;
    };
    FunctionArray[29] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (350830640*x+1959352365)%rowLen;

        return value;
    };
    FunctionArray[30] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (2755092655*x+1161440783)%rowLen;

        return value;
    };
    FunctionArray[31] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (82862384*x+1161440783)%rowLen;

        return value;
    };
    FunctionArray[32] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (900580792*x+1543109527)%rowLen;

        return value;
    };
    FunctionArray[33] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (3070307155*x+332490895)%rowLen;

        return value;
    };
    FunctionArray[34] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (971361265*x+1654498089)%rowLen;

        return value;
    };
    FunctionArray[35] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (677289179*x+198263575)%rowLen;

        return value;
    };
    FunctionArray[36] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (6660553*x+756084743)%rowLen;

        return value;
    };
    FunctionArray[37] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (4270212011*x+3055539426)%rowLen;

        return value;
    };
    FunctionArray[38] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (818266003*x+478317643)%rowLen;

        return value;
    };
    FunctionArray[39] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (2300183882*x+2724540749)%rowLen;

        return value;
    };
    FunctionArray[40] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (1239455167*x+4287525061)%rowLen;

        return value;
    };
    FunctionArray[41] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (1674327431*x+2959381535)%rowLen;

        return value;
    };
    FunctionArray[42] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (1557761080*x+904181300)%rowLen;

        return value;
    };
    FunctionArray[43] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (3091725339*x+1656461228)%rowLen;

        return value;
    };
    FunctionArray[44] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (3382005781*x+548587195)%rowLen;

        return value;
    };
    FunctionArray[45] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (1699744644*x+2375814789)%rowLen;

        return value;
    };
    FunctionArray[46] = function(x){
                   
        // Modulo by row length to fall within it 
        var value = (461206415*x+3272630411)%rowLen;

        return value;
    };
    FunctionArray[47] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (4253919265*x+1610002264)%rowLen;

        return value;
    };
    FunctionArray[48] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (1722374739*x+18508135)%rowLen;

        return value;
    };
    FunctionArray[49] = function(x){
                    
        // Modulo by row length to fall within it 
        var value = (2781478195*x+912297640)%rowLen;

        return value;
    };
    
    return FunctionArray;
}