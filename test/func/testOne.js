PFT.tester.run("Test One - A", function (page, assert) {
    assert.isTrue("A" === data, "Expected data to be 'A' but was: " + data);
    setTimeout(function () {
        assert.pass();
    }, 1000);
});

PFT.tester.run("Test One - B", function (page, assert) {
    assert.pass();
    does.not.exist = 1; // should not make it here
});
