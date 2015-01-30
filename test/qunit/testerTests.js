QUnit.module("PFT.tester", {
    setup: function () {
        // setup
    },
    teardown: function () {
        PFT.tester._reset();
    }
});
QUnit.test("can add a suite", function (assert) {
    var done = assert.async();
    PFT.tester.suite("sample suite");
    PFT.tester.onSuiteStarted = function (details) {
        assert.ok(details.suite === "sample suite");
    };
    PFT.tester.onExit = function (details) {
        done();
    };

    PFT.tester.start();
});
QUnit.test("can add a test with no options or data", function (assert) {
    var done = assert.async();
    expect(7);
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "sample test");
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "sample test");
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.test("sample test", function (page, data, tassert) {
        assert.ok(page, "expected page to be valid but was: " + page);
        assert.ok(page.open, "expected page to have the open method but did not");
        assert.ok(data === undefined, "expected data to be undefined, but was: " + data);
        assert.ok(tassert, "expected a valid assert object but was: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object but did not");

        PFT.tester.done();
    });

    PFT.tester.start();
});
QUnit.test("can add a test with valid data and no options", function (assert) {
    var done = assert.async();
    expect(8);
    PFT.tester.onTestStarted = function (details) {
        assert.ok(details.test.name === "sample test");
    };
    PFT.tester.onTestCompleted = function (details) {
        assert.ok(details.test.name === "sample test");
    };
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.test("sample test", undefined, { sample: "foo" }, function (page, data, tassert) {
        assert.ok(page, "expected page to be valid but was: " + page);
        assert.ok(page.open, "expected page to have the open method but did not");
        assert.ok(data, "expected data to be an object but was: " + data);
        assert.ok(data.sample === "foo", "expected data to have a property called sample that is equal to 'foo' but was: " + data.sample);
        assert.ok(tassert, "expected a valid assert object but was: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object but did not");

        PFT.tester.done();
    });

    PFT.tester.start();
});
QUnit.test("can add a test with option.maxDuration and timeout", function (assert) {
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
    PFT.tester.onExit = function (details) {
        done();
    };
    PFT.tester.test("sample test", { maxDuration: 1000 }, undefined, function (page, data, tassert) {
        assert.ok(page, "expected page to be valid but was: " + page);
        assert.ok(page.open, "expected page to have the open method but did not");
        assert.ok(data === undefined, "expected data to be undefined, but was: " + data);
        assert.ok(tassert, "expected a valid assert object but was: " + tassert);
        assert.ok(tassert.isTrue, "expected the isTrue function to exist on the assert object but did not");
    });

    PFT.tester.start();
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
    PFT.tester.test("sample test", function (page, data, tassert) {
        tassert.pass('test passing');
    });

    PFT.tester.start();
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
    PFT.tester.test("sample test", function (page, data, tassert) {
        tassert.fail('test failing');
    });

    PFT.tester.start();
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
    PFT.tester.test("sample test", function (page, data, tassert) {
        setTimeout(function () {
            tassert.fail('test failing');
        }, 500);
    });

    PFT.tester.start();
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
    PFT.tester.test("sample test", function (page, data, tassert) {
        does.not.exist = "no"; // expected to error
    });

    PFT.tester.start();
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
    PFT.tester.test("sample test", function (page, data, tassert) {
        setTimeout(function () {
            does.not.exist = "no"; // expected to error
        }, 500);
    });

    PFT.tester.start();
});
