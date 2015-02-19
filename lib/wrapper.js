var fs = require('fs');
var system = require('system');
var args = system.args;
var PFT_THREAD_ID = '';

function injectArgs(args) {
    // inject each script into the PhantomJs browser as Globally accessible scripts
    var arg = args.shift();
    phantom.injectJs(arg);

    if (args.length > 0) {
        // delay loading to avoid PhantomJs crash on race condition
        setTimeout(function () {
            injectArgs(args);
        }, 25);
    }
}

if (args.length < 4) { // mutex.js pft.js wrapper.js <scripts_to_run>
    // display instructions
    console.log("ERROR: invalid number of arguments: '" + args.join(' ') + "'");
    phantom.exit(1);
} else {
    var tmp = [];
    // skip first argument as it is this file
    for (var i=1; i<args.length; i++) {
        if (args[i].indexOf('PFT_THREAD_ID_') > -1) {
            // we are running in parallel threads so this indicates which thread we are
            PFT_THREAD_ID = args[i].substring('PFT_THREAD_ID_'.length) + ' - ';
        } else {
            tmp.push(args[i]);
        }
    }
    injectArgs(tmp);
}
