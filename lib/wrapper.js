var fs = require('fs');
var system = require('system');
var args = system.args;

if (args.length < 3) {
    // display instructions
    console.log("Script must be passed to call.");
    phantom.exit(1);
} else {
    // remove this script from the list of arguments
    for (var i=1; i<args.length; i++) {
        var arg = args[i];
        phantom.injectJs(arg);
    }
}
