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
    *   [Register](#textModule-register)
    *   [Search](#textModule-search)
    * 	[Submodules](#textModule-submodules)
    	* [Shingles](#textModule-shingles)
    	* [MinHashing](#textModule-minhash)
    	* [Locality-Sensitive Hashing](#textModule-lsh)
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

####Quick Started

Create a text module object
 
```javascript
var textMod = ccmf.ccmf.Text.create();
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

#####Register

Execute the text module's register method to register any text content into Creative Common's database:

```javascript
textMod.register(	
	registeringText,			//text content to be registered
	{k:9},						//shingles length : more on this below
	metadata,					//attached your metadata constructed above
	storeCallback				//callback if you would like to perform additional actions once text is stored
);
```

An example of a callback function

```javascript
storeCallback = function(error){
					if(error===null){
						jQuery('#result').text("Text registered with creative commons");
					}
					else{
						console.log(error);
					}
				};
```

####Search

##Text Module

###General

####Shingles

####MinHash

####Locality-Sensitive Hashing (LSH)

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
