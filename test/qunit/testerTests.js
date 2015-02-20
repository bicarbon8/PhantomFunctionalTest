QUnit.module("PFT.tester", {
    setup: function () {
        // setup
    },
    teardown: function () {
        PFT.tester._reset();
    }
});
QUnit.test("can add a test", function (assert) {
    var done = assert.async();
    expect(6);
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "can add a test", "expected onTestStarted");
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "can add a test", "expected onTestCompleted");
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.run("can add a test", function (page, tassert) {
        assert.ok(page, "expected page to be valid: " + page);
        assert.ok(page.open, "expected page to have the open method");
        assert.ok(tassert, "expected a valid assert object: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object");

        tassert.done();
    });
});
QUnit.test("can add a test with a timeout", function (assert) {
    var done = assert.async();
    var start = new Date().getTime();
    expect(9);
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "can add a test with a timeout", "expected onTestStarted");
    };
    PFT.tester.onTimeout = function (details) {
        assert.ok(details.test.name === "can add a test with a timeout", "expected onTimeout");
        var elapsed = new Date().getTime() - start;
        assert.ok(elapsed < 2000 && elapsed > 1000, "expected that less than 2 and more than 1 seconds passed: " + elapsed);
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "can add a test with a timeout", "expected onTestCompleted");
    };
    PFT.tester.onExit = function (details) {
        assert.ok(true, "expected onExit");
        done();
    };
    PFT.tester.run("can add a test with a timeout", function (page, tassert) {
        assert.ok(page, "expected page to be valid: " + page);
        assert.ok(page.open, "expected page to have the open method");
        assert.ok(tassert, "expected a valid assert object: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object");
    }, 1000);
});
QUnit.test("can add a test with setup", function (assert) {
    var done = assert.async();
    expect(8);
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "can add a test with setup", "expected onTestStarted");
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "can add a test with setup", "expected onTestCompleted");
    };
    PFT.tester.onExit = function (details) {
        assert.ok(true, "expected onExit");
        done();
    };
    PFT.tester.suite("sample suite", {
        setup: function (complete) {
            assert.ok(true, "expected setup");
            complete();
        }
    });
    PFT.tester.run("can add a test with setup", function (page, tassert) {
        assert.ok(page, "expected page to be valid: " + page);
        assert.ok(page.open, "expected page to have the open method");
        assert.ok(tassert, "expected a valid assert object: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object");

        tassert.done();
    });
});
QUnit.test("can add a test with teardown", function (assert) {
    var done = assert.async();
    expect(8);
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "can add a test with teardown", "expected onTestStarted");
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "can add a test with teardown", "expected onTestCompleted");
    };
    PFT.tester.onExit = function (details) {
        assert.ok(true, "expected onExit");
        done();
    };
    PFT.tester.suite("sample suite", {
        teardown: function (complete) {
            assert.ok(true, "expected teardown");
            complete();
        }
    });
    PFT.tester.run("can add a test with teardown", function (page, tassert) {
        assert.ok(page, "expected page to be valid: " + page);
        assert.ok(page.open, "expected page to have the open method");
        assert.ok(tassert, "expected a valid assert object: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object");

        tassert.done();
    });
});
QUnit.test("teardown will run even if test fails", function (assert) {
    var done = assert.async();
    expect(4);
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "teardown will run even if test fails", "expected onTestStarted");
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "teardown will run even if test fails", "expected onTestCompleted");
    };
    PFT.tester.onExit = function (details) {
        assert.ok(true, "expected onExit");
        done();
    };
    PFT.tester.suite("sample suite", { teardown: function (complete) { assert.ok(true, "expected teardown"); complete(); } });
    PFT.tester.run("teardown will run even if test fails", function (page, tassert) {
        tassert.fail();
    });
});
QUnit.test("teardown will run even if last test fails out of many", function (assert) {
    var start = new Date().getTime();
    var done = assert.async();
    expect(5);
    PFT.tester.onExit = function (details) {
        var elapsed = new Date().getTime() - start;
        assert.ok(elapsed > 1000 && elapsed < 2000, "expected test to complete in 1-2 seconds: " + elapsed);
        setTimeout(function () {
            done();
        }, 500);
    };
    PFT.tester.onAssertionFailure = function (details) {
        assert.ok(details.test.name === "teardown will run even if last test fails out of many 3", "expected onAssertionFailure");
    };

    PFT.tester.suite("sample suite", {
        teardown: function (complete) {
            assert.ok(true, "expected teardown");
            complete();
        }
    });
    PFT.tester.run("teardown will run even if last test fails out of many 1", function (page, tassert) {
        // test runs for 1/2 sec
        setTimeout(function () {
            tassert.pass();
        }, 500);
    });
    PFT.tester.run("teardown will run even if last test fails out of many 2", function (page, tassert) {
        // test runs for 1/2 sec
        setTimeout(function () {
            tassert.pass();
        }, 500);
    });
    PFT.tester.run("teardown will run even if last test fails out of many 3", function (page, tassert) {
        tassert.fail();
    });
});
QUnit.test("teardown will not run if test errors", function (assert) {
    var done = assert.async();
    expect(3);
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "teardown will not run if test errors", "expected onTestStarted");
    };
    PFT.tester.onError = function (details) {
        assert.ok(details.test.name === "teardown will not run if test errors", "expected onTestCompleted");
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "teardown will not run if test errors", "expected onTestCompleted");
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.suite("sample suite", {
        teardown: function (complete) {
            assert.ok(true, "expected teardown after error");
            complete();
        }
    });
    PFT.tester.run("teardown will not run if test errors", function (page, tassert) {
        does.not.exist = foo;
        assert.ok(fail, "expected to not run");
    });
});
QUnit.test("subsequent tests run with teardown after test error", function (assert) {
    var start = new Date().getTime();
    var done = assert.async();
    expect(5);
    PFT.tester.onExit = function (details) {
        var elapsed = new Date().getTime() - start;
        assert.ok(elapsed > 1000 && elapsed < 2000, "expected test to complete in 1-2 seconds: " + elapsed);
        done();
    };

    PFT.tester.suite("sample suite", {
        teardown: function (complete) {
            assert.ok(true, "expected teardown after error");
            complete();
        }
    });
    PFT.tester.run("subsequent tests run with teardown after test error 1", function (page, tassert) {
        does.not.exist = foo;
        assert.ok(fail, "expected to not run");
    });
    PFT.tester.run("subsequent tests run with teardown after test error 2", function (page, tassert) {
        assert.ok(true);
        // test runs for 1/2 sec
        setTimeout(function () {
            tassert.pass();
        }, 500);
    });
    PFT.tester.run("subsequent tests run with teardown after test error 3", function (page, tassert) {
        assert.ok(true);
        // test runs for 1/2 sec
        setTimeout(function () {
            tassert.pass();
        }, 500);
    });
});
QUnit.test("can add a test with setup and teardown", function (assert) {
    var done = assert.async();
    expect(8);
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "can add a test with setup and teardown", "expected onTestStarted");
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "can add a test with setup and teardown", "expected onTestCompleted");
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.suite("sample suite", {
        setup: function (complete) {
            assert.ok(true, "expected setup");
            complete();
        }, teardown: function (complete) {
            assert.ok(true, "expected teardown");
            complete();
        }
    });
    PFT.tester.run("can add a test with setup and teardown", function (page, tassert) {
        assert.ok(page, "expected page to be valid: " + page);
        assert.ok(page.open, "expected page to have the open method");
        assert.ok(tassert, "expected a valid assert object: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object");

        tassert.done();
    });
});
QUnit.test("calling assert.pass exits the test and updates passed count", function (assert) {
    var done = assert.async();
    expect(3);
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.passes === 1);
        assert.ok(details.test.failures.length === 0);
        assert.ok(details.test.errors.length === 0);
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.run("calling assert.pass exits the test and updates passed count", function (page, tassert) {
        tassert.pass('test passing');
    });
});
QUnit.test("calling assert.pass asynchronously exits the test and updates passed count", function (assert) {
    var done = assert.async();
    expect(3);
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.passes === 1);
        assert.ok(details.test.failures.length === 0);
        assert.ok(details.test.errors.length === 0);
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.run("calling assert.pass asynchronously exits the test and updates passed count", function (page, tassert) {
        setTimeout(function () {
            tassert.pass('test passing');
        },500);
    });
});
QUnit.test("calling assert.fail exits the test and updates failed count", function (assert) {
    var done = assert.async();
    expect(4);
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.passes === 0);
        assert.ok(details.test.failures.length === 1);
        assert.ok(details.test.failures[0] === "test failing");
        assert.ok(details.test.errors.length === 0);
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.run("calling assert.fail exits the test and updates failed count", function (page, tassert) {
        tassert.fail('test failing');
    });
});
QUnit.test("calling assert.fail asynchronously exits the test and updates failed count", function (assert) {
    var done = assert.async();
    expect(4);
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.passes === 0);
        assert.ok(details.test.failures.length === 1);
        assert.ok(details.test.failures[0] === "test failing");
        assert.ok(details.test.errors.length === 0);
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.run("calling assert.fail asynchronously exits the test and updates failed count", function (page, tassert) {
        setTimeout(function () {
            tassert.fail('test failing');
        }, 500);
    });
});
QUnit.test("javascript errors exit the test and update error count", function (assert) {
    var done = assert.async();
    expect(4);
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.passes === 0);
        assert.ok(details.test.failures.length === 0);
        assert.ok(details.test.errors.length === 1);
        assert.ok(details.test.errors[0]);
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.run("javascript errors exit the test and update error count", function (page, tassert) {
        does.not.exist = "no"; // expected to error
    });
});
QUnit.test("async javascript errors exit the test and update error count", function (assert) {
    var done = assert.async();
    expect(4);
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.passes === 0);
        assert.ok(details.test.failures.length === 0);
        assert.ok(details.test.errors.length === 1);
        assert.ok(details.test.errors[0]);
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.run("async javascript errors exit the test and update error count", function (page, tassert) {
        setTimeout(function () {
            does.not.exist = "no"; // expected to error
        }, 500);
    });
});
QUnit.test("async tests will run one after another", function (assert) {
    var done = assert.async();
    expect(9);
    var start = new Date().getTime();
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.passes === 1, "expected 1 pass: " + details.test.passes);
        assert.ok(details.test.failures.length === 0, "expected 0 fail: " + details.test.failures.length);
        assert.ok(details.test.errors.length === 0, "expected 0 error: " + details.test.errors.length);
    };
    PFT.tester.onTimeout = function (details) {
        assert.ok(false, "not expected to timeout");
    };
    PFT.tester.onExit = function (details) {
        assert.ok(true, "expected onExit");
        done();
    };
    setTimeout(function () {
        PFT.tester.run("async tests will run one after another", function (page, tassert) {
            var elapsed = new Date().getTime() - start;
            assert.ok(elapsed < 1000);
            setTimeout(function () {
                tassert.pass();
            }, 1000);
        });
    },1);
    setTimeout(function () {
        PFT.tester.run("async tests will run one after another", function (page, tassert) {
            var elapsed = new Date().getTime() - start;
            assert.ok(elapsed < 2000 && elapsed > 1000);
            tassert.pass();
        });
    },1);
});
