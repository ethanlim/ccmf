/**
 *  Simply load the file from system
 */

var fs = require('fs');

// Read and eval library
filedata = fs.readFileSync(__dirname+'/lib/build/ccmf.js','utf8');
eval(filedata);

/* The quadtree.js file defines a class 'QuadTree' which is all we want to export */

exports.ccmf = ccmf;