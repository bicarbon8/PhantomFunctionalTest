var PFT = PFT || {};

PFT.tester = {
    ready: true,
    running: false,
    testQueue: [],
    current: null,
    passes: [],
    failures: [],
    errors: [],
    remainingCount: 0,

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
                PFT.tester.appendToExecutionQueue("Setup - " + testName, "setup", parameter, function setup(parameter) {
                    options.setup.call(this, parameter);
                });
            }
            PFT.tester.remainingCount++;
            PFT.tester.appendToExecutionQueue(testName, "test", parameter, function runTest(parameter) {
                PFT.info("Started: " + PFT.tester.current.name);
                PFT.tester.onTestStarted({ test: PFT.tester.current });
                callback.call(this, parameter);
            });
            if (options && options.tearDown) {
                PFT.tester.appendToExecutionQueue("TearDown - " + testName, "teardown", parameter, function tearDown(parameter) {
                    options.tearDown.call(this, parameter);
                });
            }
        }
    },

    appendToExecutionQueue: function (name, type, parameters, fn) {
        PFT.tester.testQueue.push({
            fn: fn,
            type: type,
            name: name,
            parameters: parameters,
        });
    },

    done: function () {
        PFT.info("Completed: " + PFT.tester.current.name);
        PFT.tester.onTestCompleted({ test: PFT.tester.current });
        PFT.tester.ready = true;
        if (PFT.tester.current.type === "test") {
            PFT.tester.remainingCount--;
        }
    },

    assert: {
        isTrue: function (value, message) {
            // TODO: increase pass count
            if (!value) {
                var m = message || "expected 'true' but was 'false'";
                m = "Error in: " + PFT.tester.current.name + "\n\t" + m;
                if (!PFT.tester.failures) {
                    PFT.tester.failures = [];
                }
                PFT.tester.failures.push(m);
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
        if (PFT.tester.testQueue.length > 0) {
            if (PFT.tester.ready && PFT.tester.running) {
                try {
                    PFT.tester.ready = false;
                    var test = PFT.tester.testQueue.shift();
                    PFT.tester.current = test;
                    test.fn.call(this, test.parameters);
                } catch(e) {
                    var msg = "Error due to: " + e;
                    PFT.error(msg);
                    PFT.tester.errors.push(msg);
                    PFT.tester.done();
                }
            }
        } else {
            if (PFT.tester.remainingCount < 1) {
                PFT.tester.exit();
            }
        }

        if (PFT.tester.running) {
            setTimeout(PFT.tester.executionLoop, 10);
        }
    },

    stop: function () {
        PFT.tester.running = false;
    },

    exit: function () {
        PFT.tester.stop();
        var exitCode = PFT.tester.errors.length + PFT.tester.failures.length;
        // TODO: display exit details
        phantom.exit(exitCode);
    },

    onTestStarted: function (details) {
        // hook for testing
    },
    onTestCompleted: function (details) {
        // hook for testing
    },
};