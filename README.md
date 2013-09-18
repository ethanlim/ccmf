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
<h2 id="overview">Overview</h2>

<h3 id="philosophy">Philosophy</h3>

CCMF is intended to safeguard  copyright owner's intellectual properties, by keeping track of the appearance of their content on the web. Eventually, CCMF would notify these owners if their copyright of their content has been violated on the web.

To facilitate this, CCMF would require a signature of author's original content. Subsequently, various search channels would compare with this signature. When the search channels chance upon a significantly similar web content, CCMF would verify that it belongs to the original content and identify it's author. 

Another key idea is that the all computations can be accomplished via the client's browser or via the Node.JS environment. There is no centralised server requirement to use this library.

<h3 id="requirements">Requirements</h3>

To register and submit content, users have to register with Creative Commons here.

<h3 id="installation">Installation<h3>

<h4 id="browserInstall">Client Browser</h4>


<h4 id="nodeInstall">Node Module</h4>

1. Add CCMF to your package.json

```javascript
"dependencies": {
	"express": "*",
	"jade": "*",
	"firebase":"*",
	"ccmf":"git://github.com/ethanlim/ccmf.git#master"
},
```

2. Conduct a NPM install

```javascript
node npm install
```

<h3 id="gettingStarted">Getting Started</h3>

<h2 id="textModule">Text Module</h2>

<h3 id="textModule-general">General</h3>

<h3 id="textModule-register">Register</h3>

<h3 id="textModule-search">Search</h3>

<h3 id="textModule-submodules">Submodule</h3>

<h4 id="textModule-shingles">Shingles</h4>

<h4 id="textModule-minhash">MinHash</h4>

<h4 id="textModule-lsh">Locality-Sensitive Hashing (LSH)</h4>

<h2 id="feature&bugs">Feature Request and Bug Fixes</h2>

<h2 id="versioning">Versioning</h2>

Built on the rationale of providing maximum backward compatibility,CCMF adopts the [Semantic Versioning][2] v.2.0.0 guidelines.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

eg. **v1.2.12**
represents the 1st major, 2nd minor and the 12th patch.

And constructed with the following guidelines:

- Breaking backward compatibility bumps the major (and resets the minor and patch)
- New additions without breaking backward compatibility bumps the minor (and resets the patch)
- Bug fixes and misc changes bumps the patch

<h2 id="authors">Authors</h2>

<h2 id="misc">Miscellaneous</h2>

<h3 id="copyright&license">Copyright & License</h3>

The MIT License (MIT)

Copyright (c) 2013 [Creative Commons][1]

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

<h3 id="theoreticalReading">Theoretical Reading</h3> 

