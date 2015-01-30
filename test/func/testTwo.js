cases = [
    { "a": 0 },
    { "a": 1 }
];
/* jshint loopfunc:true */
for(var i=0; i<cases.length; i++) {
    PFT.tester.test("Test Two - A", undefined, cases[i], function (page, data, assert) {
        assert.isTrue(data.a === 0 || data.a === 1, "Expected data.a to be either 0 or 1 but was: " + data.a);
        assert.pass();
    });
}

PFT.tester.test("Test Two - B", function (page, data, assert) {
    setTimeout(function () {
        assert.pass();
    }, 1000);
});

PFT.tester.start();
