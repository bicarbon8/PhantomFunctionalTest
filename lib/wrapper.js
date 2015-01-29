var fs = require('fs');
var system = require('system');
var args = system.args;

function injectArgs(args) {
    // remove this script from the list of arguments
    var arg = args.shift();
    phantom.injectJs(arg);

    if (args.length > 0) {
        // delay loading to avoid PhantomJs crash
        setTimeout(function () {
            injectArgs(args);
        }, 25);
    }
}

if (args.length < 3) {
    // display instructions
    console.log("Script must be passed to call.");
    phantom.exit(1);
} else {
    var tmp = [];
    // skip first argument as it is this file
    for (var i=1; i<args.length; i++) {
        tmp.push(args[i]);
    }
    injectArgs(tmp);
}
