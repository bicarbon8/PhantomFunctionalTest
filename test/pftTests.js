QUnit.module("PFT", {
    setup: function () {
        // setup
    },
    teardown: function () {
        // teardown
    }
});
QUnit.asyncTest("can create a new Page with no parameters", function (assert) {
    var page = PFT.createPage();
    assert.ok(page, "expected a page to be returned");
    assert.ok(page.viewportSize.width === 1024, "expected viewport width to be 1024 but was: " + page.viewportSize.width);
    assert.ok(page.viewportSize.height === 800, "expected viewport height to be 800 but was: " + page.viewportSize.height);
    assert.ok(page.customHeaders === null, "expected empty object but was: " + JSON.stringify(page.customHeaders));
    QUnit.start();
});
QUnit.asyncTest("can create a new Page with viewport", function (assert) {
    var page = PFT.createPage({ width: 100, height: 50 });
    assert.ok(page, "expected a page to be returned");
    assert.ok(page.viewportSize.width === 100, "expected viewport width to be 100 but was: " + page.viewportSize.width);
    assert.ok(page.viewportSize.height === 50, "expected viewport height to be 50 but was: " + page.viewportSize.height);
    assert.ok(page.customHeaders === null, "expected null but was: " + JSON.stringify(page.customHeaders));
    QUnit.start();
});
QUnit.asyncTest("can create a new Page with viewport and headers", function (assert) {
    var page = PFT.createPage({ width: 100, height: 50 },[{ name: "Accept-Language", value: "en-US" }]);
    assert.ok(page, "expected a page to be returned");
    assert.ok(page.viewportSize.width === 100, "expected viewport width to be 100 but was: " + page.viewportSize.width);
    assert.ok(page.viewportSize.height === 50, "expected viewport height to be 50 but was: " + page.viewportSize.height);
    assert.ok(page.customHeaders, "expected object but was: " + page.customHeaders);
    assert.ok(page.customHeaders["Accept-Language"] === "en-US", "expected 'en-US' object but was: " + page.customHeaders["Accept-Language"]);
    QUnit.start();
});
