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
        assert.ok(elapsed < 2000 && elapsed > 1000, "expected that less than 3 and more than 2 seconds passed but was: " + elapsed);
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
QUnit.test("calling assert.pass exits the test and update passed count", function (assert) {
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
QUnit.test("calling assert.pass asynchronously exits the test and update passed count", function (assert) {
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
        setTimout(function () {
            tassert.pass('test passing');
            assert.ok(false, "expected this would not run");
        },500);
    });
});
QUnit.test("calling assert.fail exits the test and update failed count", function (assert) {
    var done = assert.async();
    expect(4);
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.passes === 0);
        assert.ok(details.test.failures.length === 1);
        assert.ok(details.test.failures[0] === "'sample test'\n\ttest failing");
        assert.ok(details.test.errors.length === 0);
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.run("sample test", function (page, tassert) {
        tassert.fail('test failing');
    });
});
QUnit.test("calling assert.fail asynchronously exits the test and update failed count", function (assert) {
    var done = assert.async();
    expect(4);
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.passes === 0);
        assert.ok(details.test.failures.length === 1);
        assert.ok(details.test.failures[0] === "'sample test'\n\ttest failing");
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
