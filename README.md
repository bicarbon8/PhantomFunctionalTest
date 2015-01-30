# PhantomFunctionalTest ![build status](https://travis-ci.org/bicarbon8/PhantomFunctionalTest.svg)
a lightweight alternative to CasperJs for Functional Testing based on QUnit that adds helpful methods for interacting with PhantomJs in support of Javascript UI testing

# DOCUMENTATION
[jsdoc](https://rawgit.com/bicarbon8/PhantomFunctionalTest/master/dist/doc/index.html)

# INSTALLING
using npm you can install this framework into any existing project using the folowing:
```npm install pft -g```

or by cloning this repository and usng npm to install from the cloned directory into your project directory:
```your/project/dir/> npm install path/to/this/project/```

# USING
to run you must first have a standard phantomjs script you would like to run and then use:
```> pft path/to/script.js```

# FEATURES
- multithreaded, parallel execution of scripts by simply calling with ```pft --parallel=N path/to/scripts/**/*.js``` where 'N' is some number greater than 1 (note this will spawn an instance of PhantomJs for each thread)
- ```waitFor``` and ```waitUntil``` functions that help in ensuring selectors are present on a page
- ```PFT.BasePage``` class which serves as a core interface with PhantomJs functions and can easily be extended to support the concept of Test [Page Objects](https://code.google.com/p/selenium/wiki/PageObjects)
- can be used with or without node.js
- ```PFT.tester``` module that allows for execution of sequential, asynchronous testing similar to ```QUnit.asyncTest```
- logging levels set through the ```PFT.Logger.logLevel``` property which takes a string of "error", "warn", "info", and "debug" and the ```PFT.error```, ```PFT.warn```, ```PFT.info```, and ```PFT.debug``` functions

## Testing
The basics for creating and running a test with PFT is the use of the ```PFT.tester.test``` function. This adds an asynchronous test to the queue and tracks execution and assertions.
Ex:
```javascript
PFT.tester.test("sample test name", options, data, function(page, data, assert) {
  ... async operations ...
  PFT.tester.done(); // indicates that subsequent tests can be executed
});
```
Because the tests are all assumed to be asynchronous, each test must indicate back to the framework that it is complete. This can be done in several ways:
- ```PFT.tester.done();``` indicates that all testing has completed, but does not affect the pass / fail / error counts for the test
- ```PFT.tester.pass();``` or ```PFT.tester.assert.pass();``` indicates that all testing has completed successfully and increments the pass count by 1
- ```PFT.tester.fail();``` or ```PFT.tester.assert.fail();``` indicates that all testing has completed unsuccessfully and increments the fail count by 1
- ```PFT.tester.assert.isTrue(false);``` indicates that a failure has occurred and the test should halt and increments the fail count by 1
- javascript error in the test indicates that the test should halt and increments the error count by 1

### Using PFT.BasePage in tests
the ```PFT.BasePage``` class provides much of the helper functions for interacting with a web UI. The documentation will contain the most detailed information on usage and extending this class, but for the basics see the following example:
```javascript
PFT.tester.test("sample test name", options, data, function(page, data, assert) {
  var basePage = new PFT.BasePage(page, "http://sample.com");
  basePage.registerKeyElement('.sampleHeader'); // CSS selector for elements containing the 'sampleHeader' class
  basePage.registerKeyElement('.sampleFooter'); // CSS selector for elements containing the 'sampleFooter' class
  // navigate to 'http://sample.com'
  basePage.open(function (success, errMessage) {
    assert.isTrue(success, errMessage); // exits test if 'success' === false
    // ensure page contains expected 'key' elements
    basePage.checkValidity(function (valid, errMessage) {
      assert.isTrue(valid, errMessage); // exits test if 'valid' === false
      assert.pass(); // exits test and closes the current page
    });
  });
});
```
### Extending PFT.BasePage
The ```PFT.BasePage``` class can be easily extended to help model your page objects. Ex:
```javascript
function HomePage(page) {
  PFT.BasePage.call(this, page, 'http://hompage.com');
  this.HEADERLINK_CSS = '.header';
  this.registerKeyElement(this.HEADERLINK_CSS);
}
HomePage.prototype = Object.create(PFT.BasePage.prototype);
HomePage.prototype.constructor = HomePage;
```
