var PFT = PFT || {};

PFT.tester = {
    timeOutAfter: 60000, // 60 seconds
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
            PFT.tester.onSuiteStarted({ suite: name });
            PFT.tester.done();
        });
    },

    test: function (name, options, data, callback) {
        if (arguments.length === 2) {
            callback = options;
            options = undefined;
        }
        if (!options) {
            options = {};
        }
        var maxDuration;
        if (options.maxDuration) {
            maxDuration = options.maxDuration;
        }
        
        if (options.setup) {
            PFT.tester.appendToExecutionQueue("Setup - " + name, "setup", data, function setup(data) {
                options.setup.call(this, data);
            }, maxDuration);
        }
        PFT.tester.remainingCount++;
        PFT.tester.appendToExecutionQueue(name, "test", data, function runTest(data, assert) {
            var msg = "Starting: '" + PFT.tester.current.name + "'...";
            if (data) {
                msg += "\n\tData: " + JSON.stringify(data);
            }
            PFT.Logger.log(PFT.Logger.TEST, msg);
            PFT.tester.onTestStarted({ test: PFT.tester.current });
            callback.call(this, data, assert);
        }, maxDuration);
        if (options.tearDown) {
            PFT.tester.appendToExecutionQueue("TearDown - " + name, "teardown", data, function tearDown(data) {
                options.tearDown.call(this, data);
            }, maxDuration);
        }
    },

    /** @ignore */
    appendToExecutionQueue: function (name, type, data, fn, maxDuration) {
        PFT.tester.testQueue.push({
            fn: fn,
            type: type,
            name: name,
            data: data,
            passes: 0,
            failures: [],
            errors: [],
            maxDuration: maxDuration,
        });
    },

    assert: {
        isTrue: function (value, message) {
            if (!value) {
                var m = message || "expected 'true' but was 'false'";
                m = "Error in: " + PFT.tester.current.name + "\n\t" + m;
                PFT.tester.failures.push(m);
                PFT.tester.current.failures.push(m);
                PFT.tester.onAssertionFailure({ test: PFT.tester.current, message: m });
                PFT.tester.current.halt = true;
                // halt execution, but continue with other tests
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
    },

    pass: function (message) {
        PFT.tester.assert.pass(message);
    },

    fail: function (message) {
        PFT.tester.assert.fail(message);
    },

    start: function () {
        if (!PFT.tester.running) {
            PFT.tester.globalStartTime = new Date().getTime();
            PFT.tester.running = true;
            PFT.tester.executionLoop();
        }
    },

    /** @ignore */
    executionLoop: function () {
        var duration = (PFT.tester.current && PFT.tester.current.maxDuration) ? PFT.tester.current.maxDuration : PFT.tester.timeOutAfter;
        if (PFT.tester.current && PFT.tester.current.startTime && (new Date().getTime() - PFT.tester.current.startTime) >= duration) {
            var msg = "Test " + PFT.tester.current.name + " exceeded timeout of " + PFT.tester.timeOutAfter;
            PFT.tester.current.errors.push(msg);
            PFT.Logger.log(PFT.Logger.TEST, msg);
            PFT.tester.onTimeout({ test: PFT.tester.current, message: msg });
            PFT.tester.done();
        }
        if (PFT.tester.testQueue.length > 0) {
            if (PFT.tester.ready && PFT.tester.running) {
                try {
                    PFT.tester.ready = false;
                    var test = PFT.tester.testQueue.shift();
                    PFT.tester.current = test;
                    PFT.tester.current.startTime = new Date().getTime();
                    test.fn.call(this, test.data, PFT.tester.assert);
                } catch(e) {
                    var msg = "Error due to: " + e;
                    PFT.Logger.log(PFT.Logger.TEST, msg, true);
                    PFT.tester.errors.push(msg);
                    PFT.tester.current.errors.push(msg);
                    PFT.tester.onError({ test: PFT.tester.current, message: msg });
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

    done: function () {
        if (PFT.tester.current && PFT.tester.current.type === "test") {
            var duration = PFT.convertMsToHumanReadable(new Date().getTime() - PFT.tester.current.startTime);
            PFT.tester.current.duration = duration;
            PFT.tester.onTestCompleted({ test: PFT.tester.current });
            var msg = "Completed: '" + PFT.tester.current.name + "' in " + duration + " with " + PFT.tester.current.passes + " passes, " +
                PFT.tester.current.failures.length + " failures, " + PFT.tester.current.errors.length + " errors.";
            PFT.Logger.log(PFT.Logger.TEST, msg);
        }
        PFT.tester.ready = true;
        if (PFT.tester.current.type === "test") {
            PFT.tester.remainingCount--;
        }
    },

    stop: function () {
        PFT.tester.running = false;
    },

    exit: function () {
        PFT.tester.stop();
        var exitCode = PFT.tester.errors.length + PFT.tester.failures.length;
        var duration = PFT.convertMsToHumanReadable(new Date().getTime() - PFT.tester.globalStartTime);
        var msg = "Completed all tests in " + duration + " with " + PFT.tester.passes + " passes, " + PFT.tester.failures.length + " failures, " + PFT.tester.errors.length + " errors.\n";
        for (var i=0; i<PFT.tester.failures.length; i++) {
            var failure = PFT.tester.failures[i];
            if (i === 0) {
                msg += "\nFAILURES:\n";
            }
            msg += "\t" + failure + "\n";
        }
        for (var i=0; i<PFT.tester.errors.length; i++) {
            var error = PFT.tester.errors[i];
            if (i === 0) {
                msg += "\nERROR:\n";
            }
            msg += "\t" + error + "\n";
        }
        PFT.Logger.log(PFT.Logger.TEST, msg);
        // ensure message gets out before exiting
        setTimeout(function () {
            phantom.exit(exitCode);
        }, 1000);
    },

    onTestStarted: function (details) {
        // hook for testing
    },
    onSuiteStarted: function (details) {
        // hook for testing
    },
    onTestCompleted: function (details) {
        // hook for testing
    },
    onPageError: function (details) {
        // hook for testing
    },
    onError: function (details) {
        // hook for testing
    },
    onTimeout: function (details) {
        // hook for testing
    },
    onAssertionFailure: function (details) {
        // hook for testing
    },
};