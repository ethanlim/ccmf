/**
 *  Simply load the javascript file into a node module
 */

var fs = require('fs');

// Read and eval library
filedata = fs.readFileSync(__dirname+'/lib/build/ccmf.js','utf8');
eval(filedata);

exports.ccmf = ccmf;