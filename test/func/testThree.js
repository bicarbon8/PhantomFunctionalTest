PFT.tester.run("Test Three - A", function (page, assert) {
    assert.isTrue(true, "Expected true");
    setTimeout(function () {
        assert.pass();
    }, 1000);
});

PFT.tester.run("Test Three - B", function (page, assert) {
    assert.pass();
    does.not.exist = 1; // should not make it here
});
