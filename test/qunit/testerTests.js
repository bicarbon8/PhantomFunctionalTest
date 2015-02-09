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
        assert.ok(details.test.name === "sample test", "expected onTestStarted");
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "sample test", "expected onTestCompleted");
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.run("sample test", function (page, tassert) {
        assert.ok(page, "expected page to be valid but was: " + page);
        assert.ok(page.open, "expected page to have the open method but did not");
        assert.ok(tassert, "expected a valid assert object but was: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object but did not");

        tassert.done();
    });
});
QUnit.test("can add a test with a timeout", function (assert) {
    var done = assert.async();
    var start = new Date().getTime();
    expect(8);
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "sample test");
    };
    PFT.tester.onTimeout = function (details) {
        assert.ok(details.test.name === "sample test");
        var elapsed = new Date().getTime() - start;
        assert.ok(elapsed < 2000 && elapsed > 1000, "expected that less than 2 and more than 1 seconds passed but was: " + elapsed);
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "sample test");
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.run("sample test", function (page, tassert) {
        assert.ok(page, "expected page to be valid but was: " + page);
        assert.ok(page.open, "expected page to have the open method but did not");
        assert.ok(tassert, "expected a valid assert object but was: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object but did not");
    }, 1000);
});
QUnit.test("can add a test with setup", function (assert) {
    var done = assert.async();
    expect(8);
    PFT.tester.onSuiteStarted = function (details) {
        assert.ok(details.suite.name === "sample suite", "expected onSuiteStarted");
    };
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "sample test", "expected onTestStarted");
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "sample test", "expected onTestCompleted");
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.suite("sample suite", { setup: function (done) { assert.ok(true, "expected setup"); done(); } });
    PFT.tester.run("sample test", function (page, tassert) {
        assert.ok(page, "expected page to be valid but was: " + page);
        assert.ok(page.open, "expected page to have the open method but did not");
        assert.ok(tassert, "expected a valid assert object but was: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object but did not");

        tassert.done();
    });
});
QUnit.test("can add a test with teardown", function (assert) {
    var done = assert.async();
    expect(8);
    PFT.tester.onSuiteStarted = function (details) {
        assert.ok(details.suite.name === "sample suite", "expected onSuiteStarted");
    };
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "sample test", "expected onTestStarted");
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "sample test", "expected onTestCompleted");
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.suite("sample suite", { teardown: function (done) { assert.ok(true, "expected teardown"); done(); } });
    PFT.tester.run("sample test", function (page, tassert) {
        assert.ok(page, "expected page to be valid but was: " + page);
        assert.ok(page.open, "expected page to have the open method but did not");
        assert.ok(tassert, "expected a valid assert object but was: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object but did not");

        tassert.done();
    });
});
QUnit.test("can add a test with setup and teardown", function (assert) {
    var done = assert.async();
    expect(9);
    PFT.tester.onSuiteStarted = function (details) {
        assert.ok(details.suite.name === "sample suite", "expected onSuiteStarted");
    };
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "sample test", "expected onTestStarted");
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "sample test", "expected onTestCompleted");
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.suite("sample suite", {
        setup: function (done) {
            assert.ok(true, "expected setup");
            done();
        }, teardown: function (done) {
            assert.ok(true, "expected teardown");
            done();
        }
    });
    PFT.tester.run("sample test", function (page, tassert) {
        assert.ok(page, "expected page to be valid but was: " + page);
        assert.ok(page.open, "expected page to have the open method but did not");
        assert.ok(tassert, "expected a valid assert object but was: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object but did not");

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
    PFT.tester.run("sample test", function (page, tassert) {
        tassert.pass('test passing');
        assert.ok(false, "expected this would not run");
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
    PFT.tester.run("sample test", function (page, tassert) {
        setTimeout(function () {
            tassert.pass('test passing');
            assert.ok(false, "expected this would not run");
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
    PFT.tester.run("sample test", function (page, tassert) {
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
    PFT.tester.run("sample test", function (page, tassert) {
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
    PFT.tester.run("sample test", function (page, tassert) {
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
    PFT.tester.run("sample test", function (page, tassert) {
        setTimeout(function () {
            does.not.exist = "no"; // expected to error
        }, 500);
    });
});
QUnit.test("async tests will run one after another", function (assert) {
    var done = assert.async();
    expect(8);
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
        done();
    };
    setTimeout(function () {
        PFT.tester.run("sample test", function (page, tassert) {
            var elapsed = new Date().getTime() - start;
            assert.ok(elapsed < 1000);
            setTimeout(function () {
                tassert.pass();
            }, 1000);
        });
    },1);
    setTimeout(function () {
        PFT.tester.run("sample test", function (page, tassert) {
            var elapsed = new Date().getTime() - start;
            assert.ok(elapsed < 2000 && elapsed > 1000);
            tassert.pass();
        });
    },1);
});
