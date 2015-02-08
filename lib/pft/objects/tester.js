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
    _tests: [],

    /** @ignore */
    _currentSuite: null,

    /** @ignore */
    remainingCount: 0,

    /** @ignore */
    globalStartTime: null,

    /** @ignore */
    SUITE: "suite",

    /** @ignore */
    SETUP: "setup",

    /** @ignore */
    TEST: "test",

    /** @ignore */
    TEARDOWN: "teardown",

    /** @ignore */
    _reset: function () {
        PFT.tester.running = false;
        PFT.tester.globalStartTime = null;
        PFT.tester.timeOutAfter = PFT.DEFAULT_TIMEOUT;
        PFT.tester._currentSuite = null;
        PFT.tester.remainingCount = 0;
        MutexJs = require('../node_modules/mutexjs/dist/mutex.min.js');
    },

    /**
     * function will set the suite of any subsequent tests to
     * this suite name
     */
    suite: function (name, options) {
        var o = options || {};
        var s = {
            name: name,
            setup: o.setup || function () {},
            teardown: o.teardown || function () {},
        };
        PFT.tester._currentSuite = s;
        PFT.logger.log(PFT.logger.TEST, "Suite: " + s.name);
        PFT.tester.onSuiteStarted({ suite: s });
    },

    test: function (name, callback, suite, timeout) {
        return {
            name: name,
            timeout: timeout || PFT.DEFAULT_TIMEOUT,
            page: null,
            suite: suite,
            passes: 0,
            failures: [],
            errors: [],
            done: false,
            unlockId: null,
            startTime: null,
            duration: null,
        };
    },

    /**
     * function will schedule the passed in {@link testCallback} for execution.
     * When the test is complete it MUST call {@link PFT.tester.done} to indicate
     * that the next step should proceed
     * @param {string} name - the name of the test
     * @param {testCallback} callback - the function to execute as a test. when
     * executed this function will be passed three arguments, a PhantomJs.Webpage.Page,
     * a data object and a reference to the {@link PFT.tester.assert} object
     * @param {Number} [timeout=PFT.DEFAULT_TIMEOUT] - the maximum time in
     * milliseconds to allow the test to execute before it is marked as a fail
     */
    run: function (name, callback, timeout) {
        PFT.tester.remainingCount++;
        PFT.tester.start();
        // get a test object
        var t = PFT.tester.test(name, callback, PFT.tester._currentSuite, timeout);

        // get a lock so we can run the test
        MutexJs.lockFor(PFT.tester.TEST, function onStart(unlockId) {
            var msg = "Starting: '" + t.name + "'...";
            PFT.logger.log(PFT.logger.TEST, msg);
            t.page = PFT.createPage();
            t.unlockId = unlockId;
            t.startTime = new Date().getTime();
            PFT.tester._tests.push(t);
            PFT.tester.onTestStarted({ test: t });
            try {
                callback.call(this, t.page, new PFT.tester.assert(t));
            } catch (e) {
                phantom.onError(e);
            }
        }, t.timeout, function onTimeout() {
            var msg = "Test '" + t.name + "' exceeded timeout of " + t.timeout;
            t.errors.push(msg);
            PFT.logger.log(PFT.logger.TEST, msg);
            PFT.tester.onTimeout({ test: t, message: msg });
            PFT.tester.done(t);
        });
    },

    /** @namespace */
    assert: function (testObj) {
        return {
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
                    m = "'" + testObj.name + "'\n\t" + m;
                    testObj.failures.push(m);
                    testObj.halt = true;
                    PFT.logger.log(PFT.logger.TEST, "Assert failed - " + m);
                    PFT.tester.onAssertionFailure({ test: testObj, message: m });
                    // halt execution, but continue with other tests
                    throw m;
                } else {
                    testObj.passes++;
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
                this.isTrue(!value, message);
            },

            /**
             * function to signal a successful completion of a test and increment
             * the current number of passes by 1.
             * function will also call {@link PFT.tester.done} so that any
             * subsequent tests can continue.
             * @param {string} message - a message to display describing the pass.
             */
            pass: function (message) {
                var m = message || testObj.name;
                PFT.logger.log(PFT.logger.TEST, "PASS: " + m);
                this.isTrue(true, message);

                // exit test with success
                testObj.halt = true;
                throw m;
            },

            /**
             * function to signal a failed completion of a test and increment
             * the current number of failures by 1.
             * function will also call {@link PFT.tester.done} so that any
             * subsequent tests can continue.
             * @param {string} message - a message to display describing the pass.
             */
            fail: function (message) {
                var m = message || testObj.name;
                PFT.logger.log(PFT.logger.TEST, "FAIL: " + m, true);
                this.isTrue(false, message);
                PFT.tester.done(testObj);
            },

            done: function (message) {
                var m = message || testObj.name;
                PFT.tester.done(testObj);
            },
        };
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
        if (PFT.tester.remainingCount === 0) {
            PFT.tester.exit();
        } else {
            setTimeout(PFT.tester.executionLoop, 10);
        }
    },

    /**
     * function to be called at the end of asynchronous test, setup and tearDown.
     * This indicates that the next scheduled item can be executed. Only call this
     * function when all tasks are complete within a {@link PFT.tester.test}
     */
    done: function (testObj) {
        if (testObj) {
            var duration = PFT.convertMsToHumanReadable(new Date().getTime() - testObj.startTime);
            testObj.duration = duration;
            var msg = "Completed: '" + testObj.name + "' in " + duration + " with " + testObj.passes + " passes, " +
                testObj.failures.length + " failures, " + testObj.errors.length + " errors.";
            PFT.logger.log(PFT.logger.TEST, msg);
        }

        PFT.tester.remainingCount--;
        testObj.page.close();
        PFT.tester.onTestCompleted({ test: testObj });

        MutexJs.release(testObj.unlockId);
    },

    /** @ignore */
    exit: function () {
        PFT.tester.running = false;
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
        for (i=0; i<PFT.tester._tests.length; i++) {
            passes += PFT.tester._tests[i].passes;
            failures += PFT.tester._tests[i].failures.length;
            errors += PFT.tester._tests[i].errors.length;
            for (j=0; j<PFT.tester._tests[i].failures.length; j++) {
                var failure = PFT.tester._tests[i].failures[j];
                if (!wroteFailures) {
                    wroteFailures = true;
                    failuresMsg += "\nFAILURES:\n";
                }
                failuresMsg += "\t" + failure + "\n";
            }
            for (j=0; j<PFT.tester._tests[i].errors.length; j++) {
                var error = PFT.tester._tests[i].errors[j];
                if (!wroteErrors) {
                    wroteErrors = true;
                    errorsMsg += "\nERRORS:\n";
                }
                errorsMsg += "\t" + error + "\n";
            }
        }

        var msg = "Completed '" + PFT.tester._tests.filter(function (i) { return i.type === PFT.tester.TEST; }).length +
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
