// Hide standard console output
var tmpConsole = console;
var console = {
    records: [],
    log: function () {
        console.records.push(arguments);
    },
    warn: function () {
        tmpConsole.warn(arguments);
    },
    error: function () {
        tmpConsole.error(console.records.join('\n'), arguments);
    },
};

QUnit.config.testTimeout = 3000;
