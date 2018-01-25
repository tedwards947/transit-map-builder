
var executePaperScript = require('./testpaper.paper.js');
console.log('load')

// Wait for canvas to be created
window.onload = function () {
  // Call the module to create a paperjs scope and execute the code
  var scope = executePaperScript('canvas');
}