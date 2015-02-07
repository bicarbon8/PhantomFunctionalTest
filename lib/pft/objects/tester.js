var MutexJs = require('../node_modules/mutexjs/dist/mutex.min.js');

/** @namespace */
PFT.tester = {
    /**
     * @property {number} [timeOutAfter=PFT.DEFAULT_TIMEOUT] - the default max
     * amount of time allowed for tests to run before they are marked as a fail.
     * this can be overridden for a specific test by passing a 'maxDuration'
     * option to the {@link PFT.tester.test} function
     */
    timeOutAfter: PFT.DEFAULT_TIMEOUT,

    /** @ignore */
    ready: true,

    /** @ignore */
    running: false,

    /** @ignore */
    inQueue: [],

    /**
     * @property {Array} outQueue - the array of running and already run tasks
     * where index 0 is the currently running task
     */
    outQueue: [],

    /** @ignore */
    _currentSuite: null,

    /** @ignore */
    remainingCount: 0,

    /** @ignore */
    globalStartTime: null,

    /** @ignore */
    SUITE: 0,

    /** @ignore */
    SETUP: 1,

    /** @ignore */
    TEST: 2,

    /** @ignore */
    TEARDOWN: 3,

    /** @ignore */
    _reset: function () {
        PFT.tester.running = false;
        PFT.tester.ready = true;
        PFT.tester.inQueue = [];
        PFT.tester.outQueue = [];
        PFT.tester.globalStartTime = null;
        PFT.tester.timeOutAfter = PFT.DEFAULT_TIMEOUT;
        PFT.tester._currentSuite = null;
        PFT.tester.remainingCount = 0;
    },

    /**
     * function will set the suite of any subsequent tests to
     * this suite name
     */
    suite: function (name, options) {
        PFT.tester.appendToExecutionQueue(name, PFT.tester.SUITE, undefined, function suite() {
            PFT.tester._currentSuite = name;
            PFT.logger.log(PFT.logger.TEST, "Suite: " + name);
            PFT.tester.onSuiteStarted({ suite: name });
            PFT.tester.done();
        });
    },

    /**
     * function will schedule the passed in {@link testCallback} for execution.
     * When the test is complete it MUST call {@link PFT.tester.done} to indicate
     * that the next step should proceed
     * @param {string} name - the name of the test
     * @param {testCallback} callback - the function to execute as a test. when
     * executed this function will be passed three arguments, a PhantomJs.Webpage.Page,
     * a data object and a reference to the {@link PFT.tester.assert} object
     * @param {Number} [timeout=PFT.DEFAULT_TIMEOUT] - the maximum time to allow
     * the test to execute
     */
    test: function (name, callback, timeout) {
        var maxDuration = timeout || PFT.DEFAULT_TIMEOUT;
        PFT.tester.remainingCount++;
        MutexJs.lock(PFT.tester.TEST, function onStart(unlockId) {
            var msg = "Starting: '" + name + "'...";
            PFT.logger.log(PFT.logger.TEST, msg);
            PFT.tester.onTestStarted({ name: name, fn: callback, timeout: timeout });
            callback.call(this, PFT.createPage(), PFT.tester.assert);
        }, maxDuration, function onTimeout() {
            var msg = "Test '" + PFT.tester.outQueue[0].name + "' exceeded timeout of " + duration;
            PFT.tester.outQueue[0].errors.push(msg);
            PFT.logger.log(PFT.logger.TEST, msg);
            PFT.tester.onTimeout({ test: PFT.tester.outQueue[0], message: msg });
            PFT.tester.done();
        });
    },

    /** @namespace */
    assert: {
        /**
         * function to test the value of a passed in boolean is true
         * and to signal a halt to the current test if it is not.
         * function will also call {@link PFT.tester.done} so that any
         * subsequent tests can continue. triggers the {@link PFT.tester.onAssertionFailure}
         * function call if passed in value is false
         * @param {boolean} value - the boolean value to be compared to 'true'
         * @param {string} message - a message to display describing the failure in the
         * case of a failed comparison. this message is referenced in the current test as well
         * as globally in {@link PFT.tester.failures}
         */
        isTrue: function (value, message) {
            if (!value) {
                var m = message || "expected 'true' but was 'false'";
                m = "'" + PFT.tester.outQueue[0].name + "'\n\t" + m;
                PFT.tester.outQueue[0].failures.push(m);
                PFT.tester.outQueue[0].halt = true;
                PFT.logger.log(PFT.logger.TEST, "Assert failed - " + m);
                PFT.tester.onAssertionFailure({ test: PFT.tester.outQueue[0], message: m });
                // halt execution, but continue with other tests
                throw m;
            } else {
                PFT.tester.outQueue[0].passes++;
            }
        },

        /**
         * function to test the value of a passed in boolean is false
         * and to signal a halt to the current test if it is not.
         * function will also call {@link PFT.tester.done} so that any
         * subsequent tests can continue. triggers the {@link PFT.tester.onAssertionFailure}
         * function call if passed in value is true
         * @param {boolean} value - the boolean value to be compared to 'false'
         * @param {string} message - a message to display describing the failure in the
         * case of a failed comparison. this message is referenced in the current test as well
         * as globally in {@link PFT.tester.failures}
         */
        isFalse: function (value, message) {
            var m = message || "expected 'false' but was 'true'";
            PFT.tester.assert.isTrue(!value, message);
        },

        /**
         * function to signal a successful completion of a test and increment
         * the current number of passes by 1.
         * function will also call {@link PFT.tester.done} so that any
         * subsequent tests can continue.
         * @param {string} message - a message to display describing the pass.
         */
        pass: function (message) {
            var m = message || PFT.tester.outQueue[0].name;
            PFT.logger.log(PFT.logger.TEST, "PASS: " + m);
            PFT.tester.assert.isTrue(true, message);
            PFT.tester.done();
        },

        /**
         * function to signal a failed completion of a test and increment
         * the current number of failures by 1.
         * function will also call {@link PFT.tester.done} so that any
         * subsequent tests can continue.
         * @param {string} message - a message to display describing the pass.
         */
        fail: function (message) {
            var m = message || PFT.tester.outQueue[0].name;
            PFT.logger.log(PFT.logger.TEST, "FAIL: " + m, true);
            PFT.tester.assert.isTrue(false, message);
            PFT.tester.done();
        },
    },

    /**
     * function calls to {@link PFT.tester.assert.pass}
     */
    pass: function (message) {
        PFT.tester.assert.pass(message);
    },

    /**
     * function calls to {@link PFT.tester.assert.fail}
     */
    fail: function (message) {
        PFT.tester.assert.fail(message);
    },

    /**
     * function that will start the execution of all tests added through the
     * {@link PFT.tester.test} function. Calling this method while already
     * running has no side effects
     */
    start: function () {
        if (!PFT.tester.running) {
            PFT.tester.globalStartTime = new Date().getTime();
            PFT.tester.running = true;
            PFT.tester.executionLoop();
        }
    },

    /** @ignore */
    executionLoop: function () {
        var duration = (PFT.tester.outQueue[0] && PFT.tester.outQueue[0].maxDuration) ? PFT.tester.outQueue[0].maxDuration : PFT.tester.timeOutAfter;
        if (PFT.tester.outQueue[0] && PFT.tester.outQueue[0].startTime && (new Date().getTime() - PFT.tester.outQueue[0].startTime) >= duration) {
            var msg = "Test '" + PFT.tester.outQueue[0].name + "' exceeded timeout of " + duration;
            PFT.tester.outQueue[0].errors.push(msg);
            PFT.logger.log(PFT.logger.TEST, msg);
            PFT.tester.onTimeout({ test: PFT.tester.outQueue[0], message: msg });
            PFT.tester.done();
        }
        if (PFT.tester.inQueue.length > 0) {
            if (PFT.tester.ready && PFT.tester.running) {
                try {
                    PFT.tester.ready = false;
                    PFT.tester.outQueue.unshift(PFT.tester.inQueue.shift());
                    PFT.tester.outQueue[0].startTime = new Date().getTime();
                    if (PFT.tester.outQueue[0].type === PFT.tester.TEST) {
                        PFT.tester.outQueue[0].page = PFT.createPage();
                    }
                    PFT.tester.outQueue[0].data = PFT.tester.outQueue[0].data;
                    PFT.tester.outQueue[0].fn.call(this, PFT.tester.outQueue[0].page, PFT.tester.outQueue[0].data, PFT.tester.assert);
                } catch(e) {
                    phantom.onError(e);
                }
            }
        } else {
            if (PFT.tester.ready && PFT.tester.remainingCount < 1) {
                PFT.tester.exit();
            }
        }

        if (PFT.tester.running) {
            setTimeout(PFT.tester.executionLoop, 10);
        }
    },

    /**
     * function to be called at the end of asynchronous test, setup and tearDown.
     * This indicates that the next scheduled item can be executed. Only call this
     * function when all tasks are complete within a {@link PFT.tester.test}
     */
    done: function () {
        if (PFT.tester.outQueue[0] && PFT.tester.outQueue[0].type === PFT.tester.TEST) {
            var duration = PFT.convertMsToHumanReadable(new Date().getTime() - PFT.tester.outQueue[0].startTime);
            PFT.tester.outQueue[0].duration = duration;
            var msg = "Completed: '" + PFT.tester.outQueue[0].name + "' in " + duration + " with " + PFT.tester.outQueue[0].passes + " passes, " +
                PFT.tester.outQueue[0].failures.length + " failures, " + PFT.tester.outQueue[0].errors.length + " errors.";
            PFT.logger.log(PFT.logger.TEST, msg);
        }

        if (PFT.tester.outQueue[0].type === PFT.tester.TEST) {
            PFT.tester.remainingCount--;
            PFT.tester.outQueue[0].page.close();
            PFT.tester.onTestCompleted({ test: PFT.tester.outQueue[0] });
        }

        PFT.tester.ready = true;
    },

    /**
     * function will halt the triggering of any additional tests following
     * completion of the existing task
     */
    stop: function () {
        PFT.tester.running = false;
    },

    /** @ignore */
    exit: function () {
        PFT.tester.stop();
        var duration = PFT.convertMsToHumanReadable(new Date().getTime() - PFT.tester.globalStartTime);

        var i,
            j,
            wroteFailures = false,
            wroteErrors = false,
            passes = 0,
            failures = 0,
            errors = 0,
            failuresMsg = "",
            errorsMsg = "";
        for (i=0; i<PFT.tester.outQueue.length; i++) {
            passes += PFT.tester.outQueue[i].passes;
            failures += PFT.tester.outQueue[i].failures.length;
            errors += PFT.tester.outQueue[i].errors.length;
            for (j=0; j<PFT.tester.outQueue[i].failures.length; j++) {
                var failure = PFT.tester.outQueue[i].failures[j];
                if (!wroteFailures) {
                    wroteFailures = true;
                    failuresMsg += "\nFAILURES:\n";
                }
                failuresMsg += "\t" + failure + "\n";
            }
            for (j=0; j<PFT.tester.outQueue[i].errors.length; j++) {
                var error = PFT.tester.outQueue[i].errors[j];
                if (!wroteErrors) {
                    wroteErrors = true;
                    errorsMsg += "\nERRORS:\n";
                }
                errorsMsg += "\t" + error + "\n";
            }
        }

        var msg = "Completed '" + PFT.tester.outQueue.filter(function (i) { return i.type === PFT.tester.TEST; }).length +
            "' tests in " + duration + " with " + passes + " passes, " +
            failures + " failures, " + errors + " errors.\n";
        msg += failuresMsg;
        msg += errorsMsg;
        PFT.logger.log(PFT.logger.TEST, msg);
        PFT.tester.onExit({ message: msg });
        var exitCode = errors + failures;
        // ensure message gets out before exiting
        setTimeout(function () {
            phantom.exit(exitCode);
        }, 1000);
    },

    /**
     * function hook that is called when a new test is started
     * @param {Object} details - an object containing a 'test' property for the
     * currently started test object
     */
    onTestStarted: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when a new suite is started
     * @param {Object} details - an object containing a 'suite' property with
     * the current suite's name
     */
    onSuiteStarted: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when a test completes. this
     * includes anything resulting in {@link PFT.tester.done}
     * being called
     * @param {Object} details - an object containing a 'test' property for the
     * currently started test object
     */
    onTestCompleted: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when the underlying page
     * experiences an error
     */
    onPageError: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when there is a test error
     */
    onError: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when a test times out
     */
    onTimeout: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when an assertion fails
     * @param {Object} details - an object containing a 'test' property for the
     * currently started test object and a 'message' property for the failure
     * message
     */
    onAssertionFailure: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when program exits
     */
    onExit: function (details) {
        // hook for testing
    },
};

/**
 * This callback is executed as a test and will only be run when
 * any previous test has completed. If Setup and TearDown methods
 * are specified in the test options those will be run before and
 * after the test
 * @callback testCallback
 * @param {PhantomJs.Webpage.Page} page - a PhantomJs Page object for use in
 * testing
 * @param {Object} data - the data object passed to the {@link PFT.tester.test}
 * function
 * @param {PFT.tester.assert} assert - a convenience object for
 * accessing {@link PFT.tester.assert}
 */
