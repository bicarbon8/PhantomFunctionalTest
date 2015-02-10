// Hide standard console output
var tmpConsole = console;
var console = {
    records: [],
    log: function () {
        console.records.push(arguments);
    },
    warn: function () {
        tmpConsole.log(JSON.stringify(arguments));
    },
    error: function () {
        tmpConsole.log(console.records.join('\n'), arguments);
    },
};

QUnit.config.testTimeout = 5000;
