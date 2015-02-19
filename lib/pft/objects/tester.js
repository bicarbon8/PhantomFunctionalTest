/**
 * @namespace
 * @memberof PFT
 */
PFT.tester = {
    /**
     * @property {number} [timeOutAfter=PFT.DEFAULT_TIMEOUT] - the default max
     * amount of time allowed for tests to run before they are marked as a fail.
     * this can be overridden for a specific test by passing a 'maxDuration'
     * option to the {@link PFT.tester.test} function
     */
    timeOutAfter: PFT.DEFAULT_TIMEOUT,

    /** @ignore */
    running: false,

    /** @ignore */
    exiting: false,

    /** @ignore */
    _suites: [],

    /** @ignore */
    _tests: [],

    /** @ignore */
    remainingCount: 0,

    /** @ignore */
    globalStartTime: null,

    /** @ignore */
    _reset: function () {
        MutexJs._reset();
        PFT.tester.running = false;
        PFT.tester.exiting = false;
        PFT.tester.globalStartTime = null;
        PFT.tester.timeOutAfter = PFT.DEFAULT_TIMEOUT;
        PFT.tester.remainingCount = 0;
        PFT.tester._tests = [];
        PFT.tester._suites = [];
        PFT.tester.onTestStarted = function (details) {};
        PFT.tester.onTestCompleted = function (details) {};
        PFT.tester.onPageError = function (details) {};
        PFT.tester.onError = function (details) {};
        PFT.tester.onTimeout = function (details) {};
        PFT.tester.onAssertionFailure = function (details) {};
        PFT.tester.onExit = function (details) {};
    },

    /** @ignore */
    suite: function (name, options) {
        var o = options || {};
        var s = {
            name: name,
            setup: o.setup,
            teardown: o.teardown,
        };
        PFT.tester._suites.push(s);
    },

    /** @ignore */
    test: function (name, callback, suite, timeout) {
        return {
            name: name,
            timeout: timeout || PFT.DEFAULT_TIMEOUT,
            page: null,
            suite: suite,
            passes: 0,
            failures: [],
            errors: [],
            unlockId: null,
            startTime: null,
            duration: null,
        };
    },

    /**
     * function will get the current suite in use. this is primarily used for
     * associating a suite with a test
     */
    currentSuite: function () {
        var s = null;
        if (PFT.tester._suites.length > 0) {
            s = PFT.tester._suites[PFT.tester._suites.length - 1];
        }
        return s;
    },

    /**
     * function will get the currently executing test
     */
    currentTest: function () {
        var t = null;
        if (PFT.tester._tests.length > 0) {
            t = PFT.tester._tests[PFT.tester._tests.length - 1];
        }
        return t;
    },

    /** @ignore */
    captureStartTime: function () {
        if (PFT.tester.globalStartTime === null) {
            PFT.tester.globalStartTime = new Date().getTime();
        }
    },

    /**
     * function will schedule the passed in {@link testCallback} for execution.
     * When the test is complete it MUST call one of {@link PFT.tester.assert.done},
     * {@link PFT.tester.assert.pass}, {@link PFT.tester.assert.fail} or an
     * assertion must fail to indicate that the next test should proceed.
     * @param {string} name - the name of the test
     * @param {testCallback} callback - the function to execute as a test. when
     * executed this function will be passed two arguments, a PhantomJs.Webpage.Page,
     * and a {@link PFT.tester.assert} object referencing the test
     * @param {Number} [timeout=PFT.DEFAULT_TIMEOUT] - the maximum time in
     * milliseconds to allow the test to execute before it is marked as a fail.
     * this time includes any setup and teardown that is specified
     */
    run: function (name, callback, timeout) {
        PFT.tester.captureStartTime();
        PFT.tester.remainingCount++;
        // get a test object
        var t = PFT.tester.test(name, callback, PFT.tester.currentSuite(), timeout);

        (function (testObj) {
            // get a lock so we can run the test
            MutexJs.lockFor("PFT.tester.test", function onStart(runUnlockId) {
                testObj.runUnlockId = runUnlockId;
                PFT.tester._tests.push(testObj);
                var suite = "";
                if (testObj.suite) {
                    if (testObj.suite.name) {
                        suite = testObj.suite.name + " - ";
                    }
                }
                var msg = "Starting: '" + suite + testObj.name + "'...";
                PFT.logger.log(PFT.logger.TEST, msg);
                var testId = PFT.guid();

                // run setup
                if (testObj.suite && testObj.suite.setup) {
                    MutexJs.lock(testId, function setup(unlockId) {
                        testObj.unlockId = unlockId;
                        var done = function () {
                            PFT.tester.haltCurrentScript();
                        };
                        testObj.suite.setup.call(this, done);
                    });
                }

                // run test
                MutexJs.lock(testId, function test(unlockId) {
                    testObj.page = PFT.createPage();
                    testObj.unlockId = unlockId;
                    testObj.startTime = new Date().getTime();
                    PFT.tester.onTestStarted({ "test": testObj });
                    callback.call(this, testObj.page, new PFT.tester.assert(testObj));
                });

                // run teardown
                if (testObj.suite && testObj.suite.teardown) {
                    MutexJs.lock(testId, function teardown(unlockId) {
                        testObj.unlockId = unlockId;
                        var done = function () {
                            PFT.tester.haltCurrentScript();
                        };
                        testObj.suite.teardown.call(this, done);
                    });
                }

                MutexJs.lock(testId, function done(unlockId) {
                    PFT.tester.closeTest(testObj);
                    MutexJs.release(unlockId);
                    MutexJs.release(runUnlockId);
                });
            }, testObj.timeout, function onTimeout() {
                var msg = "Test '" + testObj.name + "' exceeded timeout of " + testObj.timeout;
                PFT.tester.onTimeout({ "test": testObj, message: msg });

                // close resources
                PFT.tester.closeTest(testObj);

                // don't continue running
                testObj.unlockId = null;

                throw msg;
            });
        })(t);
    },

    /**
     * function will close out the currently running test objects, but any async
     * tasks will continue running.
     */
    closeTest: function (testObj) {
        var duration = PFT.convertMsToHumanReadable(new Date().getTime() - testObj.startTime);
        testObj.duration = duration;
        var suite = "";
        if (testObj.suite) {
            if (testObj.suite.name) {
                suite = testObj.suite.name + " - ";
            }
        }
        var msg = "Completed: '" + suite + testObj.name + "' in " + duration + " with " + testObj.passes + " passes, " +
            testObj.failures.length + " failures, " + testObj.errors.length + " errors.";
        PFT.logger.log(PFT.logger.TEST, msg);
        PFT.tester.onTestCompleted({ test: testObj });
        try {
            testObj.page.close();
        } catch (e) {
            PFT.warn(e);
        }
        PFT.tester.remainingCount--;
        PFT.tester.exitIfDoneTesting();
    },

    /**
     * @namespace PFT.tester.assert
     * @memberof PFT.tester
     */
    assert: function (testObj) {
        return {
            /**
             * function to test the value of a passed in boolean is true
             * and to signal a halt to the current test if it is not.
             * function will also call {@link PFT.tester.assert.done} so that any
             * subsequent tests can continue on failure. triggers the
             * {@link PFT.tester.onAssertionFailure} function call if passed in
             * value is false
             * @param {boolean} value - the boolean value to be compared to 'true'
             * @param {string} message - a message to display describing the failure in the
             * case of a failed comparison. this message is referenced in the current test.failures
             * @memberof PFT.tester.assert
             */
            isTrue: function (value, message) {
                if (!value) {
                    var m = message || "expected 'true' but was 'false'";
                    m = "'" + testObj.name + "'\n\t" + m;
                    testObj.failures.push(m);
                    PFT.logger.log(PFT.logger.TEST, "Assert failed - " + m);
                    PFT.tester.onAssertionFailure({ test: testObj, message: m });
                    this.done();
                } else {
                    testObj.passes++;
                }
            },

            /**
             * alias of {@link PFT.tester.assert.isTrue}
             * @param {boolean} value - the boolean value to be compared to 'true'
             * @param {string} message - a message to display describing the failure in the
             * case of a failed comparison. this message is referenced in the current.failures
             * @memberof PFT.tester.assert
             */
            ok: function (value, message) {
                this.isTrue(value, message);
            },

            /**
             * function to test the value of a passed in boolean is false
             * and to signal a halt to the current test if it is not.
             * function will also call {@link PFT.tester.assert.done} so that any
             * subsequent tests can continue on failure. triggers the
             * {@link PFT.tester.onAssertionFailure} function call if passed in
             * value is true
             * @param {boolean} value - the boolean value to be compared to 'false'
             * @param {string} message - a message to display describing the failure in the
             * case of a failed comparison. this message is referenced in the
             * current test.failures
             * @memberof PFT.tester.assert
             */
            isFalse: function (value, message) {
                var m = message || "expected 'false' but was 'true'";
                this.isTrue(!value, message);
            },

            /**
             * function to signal a successful completion of a test and increment
             * the current number of passes by 1.
             * function will also call {@link PFT.tester.assert.done} so that any
             * subsequent tests can continue.
             * @param {string} message - a message to display describing the pass.
             * @memberof PFT.tester.assert
             */
            pass: function (message) {
                var m = message || testObj.name;
                PFT.logger.log(PFT.logger.TEST, "PASS: " + m);
                testObj.passes++;
                this.done();
            },

            /**
             * function to signal a failed completion of a test and increment
             * the current number of failures by 1.
             * function will also call {@link PFT.tester.assert.done} so that any
             * subsequent tests can continue.
             * @param {string} message - a message to display describing the pass.
             * @memberof PFT.tester.assert
             */
            fail: function (message) {
                var m = message || testObj.name;
                PFT.logger.log(PFT.logger.TEST, "FAIL: " + m, true);
                testObj.failures.push(m);
                PFT.tester.onAssertionFailure({ test: testObj, message: m });
                this.done();
            },

            /**
             * function to be called at the end of asynchronous test, setup and tearDown.
             * This indicates that the next scheduled item can be executed. Only call this
             * function when all tasks are complete within a {@link PFT.tester.run}
             * @memberof PFT.tester.assert
             */
            done: function () {
                // release the current lock
                MutexJs.release(testObj.unlockId);
            },
        };
    },

    /**
     * function provides handling for expected exceptions thrown to halt
     * the currently running script. typically this will be called from the
     * phantom.onError function if tests are running.
     */
    /** @ignore */
    handleError: function (msg) {
        // restart MutexJs in case exception caused fatal javascript halt
        MutexJs.recover();

        // unexpected exception so log in errors and move to next
        var t = PFT.tester.currentTest();
        t.errors.push(msg);
        PFT.tester.onError({ test: t, message: msg });

        // release the lock so subsequent items can proceed
        MutexJs.release(t.unlockId);
    },

    /**
     * function will indicate that we should exit if no tests remain to be run
     * and then it will call the {@link PFT.tester.exit} function
     */
    /** @ignore */
    exitIfDoneTesting: function () {
        if (PFT.tester.remainingCount === 0) {
            if (!PFT.tester.exiting) {
                PFT.tester.exit();
            }
        }
    },

    /** @ignore */
    exit: function () {
        PFT.tester.exiting = true;
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

        var msg = "Completed '" + PFT.tester._tests.length +
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
 * @param {PFT.tester.assert} assert - the test controller that allows for
 * indicating the test status including pass, fail, and done for async control
 */
