CCMF
====

[Creative Commons][1] Media-Fingerprint Library
---

CCMF library is an easy to use javascript client/node library that assist copyright owners to track their content throughout the web.
* * *

*   [Overview](#overview)
    *   [Philosophy](#philosophy)
    *   [Requirements](#requirements)
    *   [Installation](#installation)  
    	* [Client Browser](#browserInstall)
    	* [Node Module](#nodeInstall)
    *   [Getting Started](#gettingStarted)
*   [Text Module](#textModule)
    *   [General](#textModule-general)
	* [Shingles](#textModule-shingles)
	* [MinHashing](#textModule-minhash)
	* [Locality-Sensitive Hashing (LSH)](#textModule-lsh)
*	[Feature Request and Bug Fixes](#feature&bugs)
*	[Versioning](#versioning)
*	[Authors](#authors)
*   [Miscellaneous](#misc)
    *   [Copyright & License](#copyright&license)
    *   [Theoretical Readings](#theoreticalReading)

[1]: http://creativecommons.org/ "Creative Commons"
[2]: http://semver.org/ "Semantic Versioning"

* * * 
##Overview

###Philosophy

CCMF is intended to safeguard  copyright owner's intellectual properties, by keeping track of the appearance of their content on the web. Eventually, CCMF would notify these owners if their copyright of their content has been violated on the web.

To facilitate this, CCMF would require a signature of author's original content. Subsequently, various search channels would compare with this signature. When the search channels chance upon a significantly similar web content, CCMF would verify that it belongs to the original content and identify it's author. 

Another key idea is that the all computations can be accomplished via the client's browser or via the Node.JS environment. There is no centralised server requirement to use this library.

###Requirements

To register and submit content, users have to register [an account](http://ccmf.ethanlim.net/users/signup) with Creative Commons.

###Installation

####Client Browser

Add ccmf library into your page:

```HTML
<script src='https://raw.github.com/ethanlim/ccmf/master/lib/build/ccmf.js'></script>
```

####Node Module

Insert ccmf into package.json and conduct a <code>npm install</code>:

```javascript
"dependencies": {
  "ccmf":"git://github.com/ethanlim/ccmf.git#master"
}
```

###Quick Started

Create a text module object
 
```javascript
var textMod = ccmf.Text.create();
```

Insert your credentials into a <code>metadata</code> object

```javascript
var metadata = 	{
					author:{
							first:'test',
							last:'test',
							email:'test@test.com'
							}
		   	 	};
```

####Register

Execute the text module's register method to register any text content into Creative Common's database:

```javascript
textMod.register(	
	registeringText,			//text content to be registered
	{k:9},						//shingles length : more on this below
	metadata,					//attached your metadata constructed above
	storeCallback				//callback if you would like to perform additional actions once text is stored
);
```

An example of a register callback function

```javascript
var storeCallback = function(error){
					if(error===null){
						jQuery('#result').text("Text registered with creative commons");
					}
					else{
						console.log(error);
					}
				};
```

###Search

Execute the search method to search for similar textual content to yours.

```javascript
textMod.search(
				textToBeSearched,		//Text that you are using to search for similar texts
				{k:9},					//shingles length : more on this below
				null,					//reserved for future usage
				resultCallback			//attach the callback that would execute once results are ready
			  );
```

The callback for search is slightly different as it returns the result of your search

```javascript
resultCallback = function(results){
				
		//If there are any results
		if(results.count!=0){
			
			var resultSets = results['sets'],
			metadata = null,
			author = null,
			set = null;
		
			for(var result=0;result<results.count;result++){
				
				set = JSON.parse(resultSets[result]);	//Signature of the similar text
				
				metadata = set['metadata'];				//Get the metadata object (exactly as above)

				author = metadata['author']; 			//Get the author's detail
				
				console.log('Signature :'+set['sig'].toString().substring(0,30) +' Author : '+author['first']);
			}
		}
		else{
				console.log('No Similar Signature Found');
		}
	};
```

##Text Module

###General

The previous <code>search</code> and <code>register</code> methods use 3 components,namely shingles extraction, minhashing and locality-sensitive hashing of the text module. These components dissect the intended textual content into signatures (patterns of integers). These signatures preserve the relationship between that textual content with other contents. The three step process is represented by converting text into shingles, minhashing of shingles and finally conduct lsh. The end product is a signature that can be stored efficiently and be identified as similar to another textual content's signature.

![text-register-image](http://ccmf.s3.amazonaws.com/img/views/texts/doc/general-working1.png)

####Shingles

Extracting shingles is the act of extracting sub-strings from a given text. Using ccmf's API, shingles can be extracted based on 3 different criteria:

- Fixed Shingles

	The most basic shingles extraction. Simply extract each shingles of substring length **k** from the beginning to the end of text.
	
	```javascript
	var textAShingles = textMod.fixedShinglesWithoutWS(rawText,k);
	```

- Remove Stop Words Shingles

	Perform a removal of all stop words before conducting Fixed Shingles extraction.

	```javascript
	var textAShingles = textMod.removedStopWordShingles(rawText,k);
	```

- Stop More After Stop Word Shingles

	This is a different methodology of extractions. Each shingles are two words after the encountering of a stop word.
	
	```javascript
	var textAShingles = textMod.stopMoreShingles(rawText,k);
	```

After extracting a set of shingles,they generally occupy more space then actual text themselves. Hence, we should minimize them by hashing them into an array of integers.

```javascript
var shinglesFingerprintA = textMod.shinglesFingerprintConv(textAShingles);
```

####MinHash

Minhash is a technique or process of compressing the amount of data actually needed for comparison while preserving their inherit relationship with each other. 

```javascript
var signatures[0] = shinglesFingerprintA;
```

The previous compressed integer array could be loaded into an array of signatures. Use this array of signature if you would like to perform similar text matching solely on the browser. You can add N signatures to this signature array.

``` javascript
var signatures[1] = shinglesFingerprintB;

var signatures[2] = shinglesFingerprintC;

var signatures[3] = shinglesFingerprintD;
```

Now generate the minhash signatures (they can contain signatures from 1 or more text contents)

```javascript
var minHashSignatures = this.minHashSignaturesGen(signature);
```

####Locality-Sensitive Hashing (LSH)

To compare each and every pair of minhash signatures to determine the most similar pair would be too inefficient. Normally for this use case, we only need to focus on pairs of signatures that are most likely to be similar and not on every pair. The search functions uses the underlying locality-sensitive hashing (LSH). The art of locality-sensitive hashing is that through multiple hashing of a minhash signature, eventually the similar text content would be hashed to the same location.

The LSH belongs to the data module and so we have to first create the data module object. 

```javascript
var dataMod = ccmf.Data.create();
```

Next, create the callback to process the return data.

```javascript
callback :function(snapshot){	
   /* Search through each band */	
   if(snapshot.val()!=null){	
     var foundSignatureSet = snapshot.val();	
  }	
}
```

Call the method in data module to conduct LSH.

```javascript
dataMod.conductLsh(minHashSignature,obj.callback);
```
The callback function would be called and the similar minhash signatures would be returned.

##Feature Request and Bug Fixes

Submit all feature request and bug reports [here](https://github.com/ethanlim/ccmf/issues).

##Versioning

Built on the rationale of providing maximum backward compatibility,CCMF adopts the [Semantic Versioning][2] v.2.0.0 guidelines.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

eg. **v1.2.12**
represents the 1st major, 2nd minor and the 12th patch.

And constructed with the following guidelines:

- Breaking backward compatibility bumps the major (and resets the minor and patch)
- New additions without breaking backward compatibility bumps the minor (and resets the patch)
- Bug fixes and misc changes bumps the patch

##Authors

### Ethan Lim ###
- GitHub - [https://github.com/ethanlim/](https://github.com/ethanlim/)

##Miscellaneous

###Copyright & License

The MIT License (MIT)

Copyright (c) 2013 Lim Zhi Hao

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

###Theoretical Reading 

- **[Finding Similar Items](http://infolab.stanford.edu/~ullman/mmds.html)**
