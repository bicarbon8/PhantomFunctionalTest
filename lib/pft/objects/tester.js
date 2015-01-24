var PFT = PFT || {};

PFT.tester = {
    ready: true,
    running: false,
    testQueue: [],
    current: null,
    passes: 0,
    failures: [],
    errors: [],
    remainingCount: 0,
    globalStartTime: null,

    suite: function (name, options) {
        PFT.tester.appendToExecutionQueue(name, "suite", function suite() {
            PFT.Logger.log(PFT.Logger.TEST, "Suite Started: " + name);
            PFT.tester.done();
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
                PFT.Logger.log(PFT.Logger.TEST, "Started: " + PFT.tester.current.name);
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
            passes: 0,
            failures: [],
            errors: [],
        });
    },

    done: function () {
        PFT.Logger.log(PFT.Logger.TEST, "Completed: " + PFT.tester.current.name);
        PFT.tester.current.duration = PFT.convertMsToHumanReadable(new Date().getTime() - PFT.tester.current.startTime);
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
                PFT.tester.failures.push(m);
                PFT.tester.current.failures.push(m);
                PFT.Logger.log(PFT.Logger.TEST, m, true);
                throw m;
            } else {
                PFT.tester.passes++;
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
        PFT.Logger.log(PFT.Logger.TEST, "PASS: " + m);
        PFT.tester.assert.isTrue(true, message);
        PFT.tester.done();
    },

    fail: function (message) {
        var m = message || PFT.tester.current.name;
        PFT.Logger.log(PFT.Logger.TEST, "FAIL: " + m, true);
        PFT.tester.assert.isTrue(false, message);
        PFT.tester.done();
    },

    start: function () {
        if (!PFT.tester.running) {
            PFT.tester.globalStartTime = new Date().getTime();
            PFT.tester.running = true;
            PFT.tester.executionLoop();
        }
    },

    executionLoop: function () {
        if (PFT.tester.testQueue.length > 0) {
            if (PFT.tester.ready && PFT.tester.running) {
                try {
                    PFT.tester.ready = false;
                    var test = PFT.tester.testQueue.shift();
                    PFT.tester.current = test;
                    PFT.tester.current.startTime = new Date().getTime();
                    test.fn.call(this, test.parameters);
                } catch(e) {
                    var msg = "Error due to: " + e;
                    PFT.Logger.log(PFT.Logger.TEST, msg, true);
                    PFT.tester.errors.push(msg);
                    PFT.tester.current.errors.push(m);
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
        var duration = PFT.convertMsToHumanReadable(new Date().getTime() - PFT.tester.globalStartTime);
        var msg = "Completed in " + duration + " with " + PFT.tester.passes + " passes, " + PFT.tester.failures.length + " failures, " + PFT.tester.errors.length + " errors.";
        PFT.Logger.log(PFT.Logger.TEST, msg);
        // ensure message gets out before exiting
        setTimeout(function () {
            phantom.exit(exitCode);
        }, 1000);
    },

    onTestStarted: function (details) {
        // hook for testing
    },
    onTestCompleted: function (details) {
        // hook for testing
    },
};