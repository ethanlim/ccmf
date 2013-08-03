/**
 *  Simply load the file from system
 */

var fs = require('fs');

// Read and eval library
filedata = fs.readFileSync(__dirname+'/lib/build/ccmf.js','utf8');
eval(filedata);

exports.ccmf = ccmf;