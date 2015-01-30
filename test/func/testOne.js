PFT.tester.test("Test One - A", undefined, "A", function (page, data, assert) {
    assert.isTrue("A" === data, "Expected data to be 'A' but was: " + data);
    setTimeout(function () {
        assert.pass();
    }, 1000);
});

PFT.tester.test("Test One - B", function (page, data, assert) {
    assert.pass();
});

PFT.tester.start();

does.not.exist = 1;
