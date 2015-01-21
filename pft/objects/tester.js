var PFT = PFT || {};

PFT.tester = {
    ready: true,
    running: false,
    testQueue: [],
    current: null,
    passResults: {},
    failResults: {},
    errorResults: {},

    suite: function (name, options) {
        PFT.tester.appendToExecutionQueue(name, "suite", function suite() {
            PFT.info("Suite Started: " + name);
        });
    },

    test: function (name, parameters, options, callback) {
        if (arguments.length === 2) {
            callback = parameters;
        }
        if (!parameters || parameters.length === 0) {
            parameters = [];
            parameters.push({});
        }
        for (var i=0; i<parameters.length; i++) {
            var parameter = parameters[i];
            var testName = name + " - " + JSON.stringify(parameter);
            if (options && options.setup) {
                PFT.tester.appendToExecutionQueue(testName + " - Setup", "setup", function setup() {
                    options.setup.call(this, parameter);
                });
            }
            PFT.tester.appendToExecutionQueue(testName, "test", function runTest() {
                PFT.info("Test Started: " + PFT.tester.current.name);
                PFT.tester.testStarted({ test: PFT.tester.current });
                callback.call(this, parameter);
            });
            if (options && options.tearDown) {
                PFT.tester.appendToExecutionQueue(testName + " - TearDown", "teardown", function tearDown() {
                    options.tearDown.call(this, parameter);
                });
            }
        }
    },

    appendToExecutionQueue: function (name, type, fn) {
        PFT.tester.testQueue.push({
            fn: fn,
            type: type,
            name: name,
        });
    },

    done: function () {
        PFT.info("Test Completed: " + PFT.tester.current.name);
        PFT.tester.testCompleted({ test: PFT.tester.current });
        PFT.tester.ready = true;
    },

    assert: {
        isTrue: function (value, message) {
            // TODO: increase pass count
            if (!value) {
                var m = message || "expected 'true' but was 'false'";
                m = "Error in: " + PFT.tester.current.name + "\n\t" + m;
                if (!PFT.tester.current.failures) {
                    PFT.tester.current.failures = [];
                }
                PFT.tester.current.failures.push(m);
                PFT.error(m);
                throw m;
            } else {
                if (!PFT.tester.current.passes) {
                    PFT.tester.current.passes = 0;
                }
                PFT.tester.current.passes++;
            }
        },

        isFalse: function (value, message) {
            var m = message || "expected 'false' but was 'true'";
            PFT.tester.assert.isTrue(!value, message);
        },
    },

    pass: function (message) {
        var m = message || PFT.tester.current.name;
        PFT.info("PASS: " + m);
        PFT.tester.assert.isTrue(true, message);
        PFT.tester.done();
    },

    fail: function (message) {
        var m = message || PFT.tester.current.name;
        PFT.error("FAIL: " + m);
        PFT.tester.assert.isTrue(false, message);
        PFT.tester.done();
    },

    start: function () {
        PFT.tester.running = true;
        PFT.tester.executionLoop();
    },

    executionLoop: function () {
        if (PFT.tester.testQueue.length) {
            if (PFT.tester.ready && PFT.tester.running) {
                try {
                    PFT.tester.ready = false;
                    var test = PFT.tester.testQueue.shift();
                    PFT.tester.current = test;
                    test.fn();
                } catch(e) {
                    PFT.error("Test Failure due to: " + e);
                    // TODO: increase error count
                    PFT.tester.done();
                }
            } else {
                setTimeout(PFT.tester.executionLoop, 10);
            }
        } else {
            // TODO: display completion details
        }
        PFT.tester.running = false;
    },

    stop: function () {
        PFT.tester.running = false;
    },

    exit: function () {
        PFT.tester.stop();
        phantom.exit();
    },

    testStarted: function (details) {
        // hook for testing
    },
    testCompleted: function (details) {
        // hoook for testing
    },
};