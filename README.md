# PhantomFunctionalTest
a lightweight alternative to CasperJs for Functional Testing based on QUnit that adds helpful methods for interacting with PhantomJs in support of Javascript UI testing

# INSTALLING
using npm you can install this framework into any existing project using te folowing:
```npm install pft --save-dev``` (coming soon)

or by cloning this repository and usng npm to install from the cloned directory into your project directory:
```your/project/dir/> npm install path/to/this/project/```

# USING
to run you must first have a standard phantomjs script you woul like to run and then use:
```> pft path/to/script.js```

# FEATURES
- ```waitFor``` and ```waitUntil``` functions that help in ensuring selectors are present on a page
- ```PFT.BasePage``` class which serves as a core interface with PhantomJs functions and can easily be extended to support the concept of Test [Page Objects](https://code.google.com/p/selenium/wiki/PageObjects)
- can be used with or without node.js
- ```PFT.tester``` module that allows for execution of sequential, asynchronous testing similar to ```QUnit.asyncTest```
- logging levels set through the ```PFT.Logger.logLevel``` property which takes a string of "error", "warn", "info", and "debug" and the ```PFT.error```, ```PFT.warn```, ```PFT.info```, and ```PFT.debug``` functions

## Testing
The basics for creating and running a test with PFT is the use of the ```PFT.tester.test``` function. This adds an asynchronous test to the queue and tracks execution and assertions.
Ex:
```
PFT.tester.test("sample test name", cases, options, function() {
  ... async operations ...
  PFT.tester.done(); // called from inside the callback chain
});
```
