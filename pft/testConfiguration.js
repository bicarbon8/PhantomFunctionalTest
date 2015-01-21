QUnit.config.autostart = false;

QUnit.begin(function(details) {
    PFT.logger.log(PFT.logger.QUNIT, "Beginning execution of: "+details.totalTests+" tests...");
});
QUnit.log(function(details) {
    if (details.result) {
        return;
    }
    var loc = details.module + ": " + details.name + ": ",
    output = "FAILED: "+loc+(details.message ? details.message + ", " : "");

    if (details.actual) {
        output += "expected: " + details.expected + ", actual: " + details.actual;
    }
    if (details.source) {
        output += ", " + details.source;
    }
    PFT.logger.log(PFT.logger.QUNIT, output, true);
});
QUnit.moduleStart(function(details) {
    PFT.logger.log(PFT.logger.QUNIT, "starting suite: '"+details.name+"'");
});
QUnit.moduleDone(function(details) {
    PFT.logger.log(PFT.logger.QUNIT, "completed suite: '" +
        details.name + "' with " +
        details.failed + " failures out of " +
        details.total + " assertions.");
});
QUnit.testStart(function(details) {
    PFT.logger.log(PFT.logger.QUNIT, "starting test: '"+details.name+"'");
});
QUnit.testDone(function(details) {
    PFT.logger.log(PFT.logger.QUNIT, "completed test: '" +
        details.name + "' in " +
        PFT.framework.convertMsToHumanReadable(details.runtime));
});
QUnit.done(function(details) {
    PFT.logger.log(PFT.logger.QUNIT, "completed all tests. Failed Assertions: " +
        details.failed + ", Passed Assertions: " +
        details.passed + ", Total Duration: " +
        PFT.framework.convertMsToHumanReadable(details.runtime));
    phantom.exit(details.failed);
});