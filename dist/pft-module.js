/*! pft v0.9.0, created by: Jason Holt Smith <bicarbon8@gmail.com> 2015-01-28 21:32:46 */
var PFT = {};

PFT.POLLING_INTERVAL = 1e3, PFT.DEFAULT_TIMEOUT = 6e4, PFT.IMAGES_DIR = "./img/", 
PFT.createPage = function(viewport, headers) {
    PFT.debug("generating new page...");
    var page = null;
    if (page = require("webpage").create(), viewport || (viewport = {
        width: 1024,
        height: 800
    }), PFT.debug("setting viewport to: " + JSON.stringify(viewport)), page.viewportSize = viewport, 
    headers) {
        PFT.debug("setting headers to: " + JSON.stringify(headers));
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i];
            page = PFT.addHeader(page, header.name, header.value);
        }
    }
    return page;
}, PFT.addHeader = function(page, name, value) {
    var headers = page.customHeaders;
    return headers || (headers = {}), headers[name] = value, page.customHeaders = headers, 
    page;
}, PFT.getCookieValue = function(cookieName) {
    PFT.debug("checking for cookie '" + cookieName + "' in cookies...");
    for (var key in phantom.cookies) {
        var cookie = phantom.cookies[key];
        if (cookie.name.toLowerCase() == cookieName.toLowerCase()) return PFT.debug("found '" + cookieName + "' cookie with value of: '" + cookie.value + "'"), 
        cookie.value;
    }
}, PFT.trace = function(message) {
    PFT.logger.log(PFT.logger.TRACE, message);
}, PFT.debug = function(message) {
    PFT.logger.log(PFT.logger.DEBUG, message);
}, PFT.info = function(message) {
    PFT.logger.log(PFT.logger.INFO, message);
}, PFT.warn = function(message) {
    PFT.logger.log(PFT.logger.WARN, message);
}, PFT.error = function(message) {
    PFT.logger.log(PFT.logger.ERROR, message, !0);
}, PFT.guid = function() {
    function s4() {
        return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
    }
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}, PFT.convertMsToHumanReadable = function(milliseconds) {
    var date = new Date(milliseconds), h = date.getHours(), m = date.getMinutes(), s = date.getSeconds(), ms = date.getMilliseconds(), out = "";
    return h > 0 && (out += h, out += 1 == h ? " hour " : " hours "), m > 0 && (out += m, 
    out += 1 == m ? " minute " : " minutes "), s > 0 && (out += s, out += 1 == s ? " second " : " seconds "), 
    ms > 0 && (out += ms, out += 1 == ms ? " millisecond" : " milliseconds"), out;
}, PFT.renderPage = function(page, name) {
    page && (name || (name = page.url), name = name.replace(/\//g, "_").replace(/([%:?&\[\]{}\s\W\\])/g, ""), 
    name = PFT.IMAGES_DIR + name + "." + new Date().getTime() + ".jpg", PFT.info("capturing page image: " + name), 
    page.render(name, {
        quality: "50"
    }));
}, PFT.onPageConsoleMessage = function() {}, phantom.onError = function(msg, trace) {
    var msgStack = [ msg ];
    trace && trace.length && trace.forEach(function(t) {
        msgStack.push(" -> " + (t.file || t.sourceURL) + ": " + t.line + (t["function"] ? " (in function " + t["function"] + ")" : ""));
    }), msg = msgStack.join("\n"), PFT.tester.running && PFT.tester.outQueue.length > 0 ? (PFT.tester.outQueue[0].halt || PFT.tester.outQueue[0].errors.push(msg), 
    PFT.tester.done()) : (PFT.logger.log(PFT.logger.ERROR, msg, !1), PFT.tester.onError({
        message: msg
    }), phantom.exit(1));
};

var PFT = PFT || {};

PFT.logger = {
    logLevel: require("system").env.log_level || "info",
    UNKNOWN: -1,
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    TEST: 100,
    getLogLevelInt: function(levelStr) {
        switch (levelStr.toLowerCase()) {
          case "trace":
            return PFT.logger.TRACE;

          case "debug":
            return PFT.logger.DEBUG;

          case "info":
            return PFT.logger.INFO;

          case "warn":
            return PFT.logger.WARN;

          case "error":
            return PFT.logger.ERROR;

          case "qunit":
            return PFT.logger.TEST;

          default:
            return PFT.logger.UNKNOWN;
        }
    },
    getLogLevelStr: function(levelInt) {
        switch (levelInt) {
          case PFT.logger.TRACE:
            return "TRACE";

          case PFT.logger.DEBUG:
            return "DEBUG";

          case PFT.logger.INFO:
            return "INFO";

          case PFT.logger.WARN:
            return "WARN";

          case PFT.logger.ERROR:
            return "ERROR";

          case PFT.logger.TEST:
            return "TEST";

          default:
            return "UNKNOWN";
        }
    },
    log: function(levelInt, message, includeStackTrace) {
        if (levelInt && !isNaN(levelInt) && levelInt > PFT.logger.UNKNOWN && levelInt >= PFT.logger.getLogLevelInt(PFT.logger.logLevel)) {
            includeStackTrace && (message += "\n" + PFT.logger._getStackTrace());
            var msg = PFT.logger.getLogLevelStr(levelInt) + ": " + message;
            switch (levelInt) {
              case PFT.logger.FATAL:
              case PFT.logger.ERROR:
                console.error(msg);
                break;

              case PFT.logger.WARN:
                console.warn(msg);
                break;

              default:
                console.log(msg);
            }
        }
    },
    _getStackTrace: function() {
        var callstack = "", isCallstackPopulated = !1;
        try {
            i.dont.exist += 0;
        } catch (e) {
            var lines, i;
            if (e.stack) {
                for (lines = e.stack.split("\n"), i = 2; i < lines.length; i++) callstack += lines[i] + "\n";
                isCallstackPopulated = !0;
            }
        }
        if (!isCallstackPopulated) for (var currentFunction = arguments.callee.caller; currentFunction; ) {
            var fn = currentFunction.toString(), fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf("")) || "anonymous";
            callstack += "	" + fname + "\n", currentFunction = currentFunction.caller;
        }
        return callstack;
    }
}, PFT.BasePage = function(page, baseUrl) {
    this.page = page || PFT.createPage(), this.baseUrl = baseUrl || "", this.keyElements = [], 
    this.page.onError = function(msg, trace) {
        var msgStack = [ msg ];
        trace && trace.length && trace.forEach(function(t) {
            msgStack.push(" -> " + (t.file || t.sourceURL) + ": " + t.line + (t["function"] ? " (in function " + t["function"] + ")" : ""));
        }), PFT.trace(msgStack.join("\n")), PFT.tester.onPageError({
            message: msgStack.join("\n")
        });
    }, this.page.onConsoleMessage = function(msg, lineNum, sourceId) {
        PFT.trace("CONSOLE: " + msg + " (from line #" + lineNum + ' in "' + sourceId + '")');
        var output = {
            message: msg,
            line: lineNum,
            source: sourceId
        };
        PFT.onPageConsoleMessage(output);
    };
}, PFT.BasePage.prototype.open = function(urlParams, callback) {
    urlParams && !callback && "function" == typeof urlParams && (callback = urlParams, 
    urlParams = void 0);
    var p = urlParams || "";
    this.page.open(this.baseUrl + p, function(status) {
        PFT.debug("opened page: " + this.baseUrl + " = " + status), "success" == status ? callback.call(this, !0) : callback.call(this, !1, "opening '" + this.baseUrl + p + "' returned: " + status);
    }.bind(this));
}, PFT.BasePage.prototype.close = function() {
    this.page.clearCookies(), this.page.close();
    for (var key in this) this.hasOwnProperty(key) && (this[key] = void 0);
}, PFT.BasePage.prototype.registerKeyElement = function(elementSelector) {
    this.keyElements.push(elementSelector);
}, PFT.BasePage.prototype.checkValidity = function(callback) {
    var selectors = this.keyElements;
    this._verify(selectors, callback);
}, PFT.BasePage.prototype._verify = function(selectors, callback) {
    if (selectors.length > 0) {
        var selector = selectors.shift();
        PFT.debug("verifying '" + selector + "' exists on page..."), this.waitFor(selector, function(success, msg) {
            success ? selectors.length > 0 ? this._verify(selectors, callback) : callback.call(this, !0) : callback.call(this, !1, "unable to locate selector: " + msg);
        }.bind(this), PFT.DEFAULT_TIMEOUT);
    } else callback.call(this, !1, "nothing to verify");
}, PFT.BasePage.prototype.withinPage = function(selector) {
    PFT.debug("checking for: '" + selector + "' within page.");
    try {
        var pos = this.elementPosition(selector);
        return pos.left >= 0 && pos.top >= 0 && pos.left <= this.page.viewportSize.width && pos.top <= this.page.viewportSize.height ? !0 : !1;
    } catch (e) {
        return !1;
    }
}, PFT.BasePage.prototype.visible = function(selector) {
    PFT.debug("checking for: '" + selector + "' visible.");
    try {
        var display = this.eval(function(s) {
            var el = document.querySelector(s);
            return "undefined" != typeof window.getComputedStyle ? window.getComputedStyle(el, null).display : "undefined" !== el.currentStyle ? el.currentStyle.display : void 0;
        }, selector);
        return "none" === display ? !1 : !0;
    } catch (e) {
        return !1;
    }
}, PFT.BasePage.prototype.renderPage = function(name) {
    PFT.renderPage(this.page, name);
}, PFT.BasePage.prototype.waitFor = function(selector, callback, maxMsWait) {
    var wait = maxMsWait || PFT.DEFAULT_TIMEOUT;
    if (isNaN(wait)) callback.call(this, !1, "invalid value of '" + wait + "' passed to function"); else {
        PFT.debug("waiting for: '" + selector + "' or until " + wait + "ms has passed.");
        var expiry = new Date().getTime() + wait;
        this.waitUntil(selector, callback, expiry);
    }
}, PFT.BasePage.prototype.waitUntil = function(selector, callback, timeInMilliseconds) {
    PFT.debug("waiting for: '" + selector + "' or for " + (timeInMilliseconds - new Date().getTime()) + " milliseconds"), 
    this.exists(selector) ? (PFT.debug("selector found."), callback.call(this, !0)) : (PFT.debug("selector not found."), 
    new Date().getTime() + PFT.POLLING_INTERVAL < timeInMilliseconds ? (PFT.debug("retrying..."), 
    setTimeout(function() {
        this.waitUntil(selector, callback, timeInMilliseconds);
    }.bind(this), PFT.POLLING_INTERVAL)) : (PFT.info("timing out. '" + selector + "' not found by: " + new Date(timeInMilliseconds)), 
    callback.call(this, !1, "'" + selector + "' not found by: " + new Date(timeInMilliseconds))));
}, PFT.BasePage.prototype.exists = function(selector) {
    PFT.debug("checking for: '" + selector + "' on page.");
    var condition = this.eval(function(s) {
        return null !== document.querySelector(s);
    }, selector.toString());
    return condition ? (PFT.debug("condition met."), !0) : (PFT.debug("condition failed."), 
    !1);
}, PFT.BasePage.prototype.elementPosition = function(selector) {
    PFT.debug("retrieving: '" + selector + "' position page.");
    var pos = this.eval(function(s) {
        return document.querySelector(s).getBoundingClientRect();
    }, selector.toString());
    if (!pos || void 0 === pos.left && null === pos.left || void 0 === pos.top && null === pos.top) throw "element could not be located on the page. pos: " + JSON.stringify(pos);
    return PFT.debug("found '" + selector + "' at position: " + JSON.stringify(pos)), 
    pos;
}, PFT.BasePage.prototype.click = function(selector) {
    PFT.debug("clicking on: '" + selector + "'...");
    this.elementPosition(selector);
    PFT.debug("using javascript click..."), this.eval(function(s) {
        var ev = document.createEvent("MouseEvent");
        ev.initMouseEvent("click", !0, !0, window, null, 0, 0, 0, 0, !1, !1, !1, !1, 0, null), 
        document.querySelector(s).dispatchEvent(ev);
    }, selector);
}, PFT.BasePage.prototype.getText = function(selector) {
    return PFT.debug("getting textContent for: '" + selector + "'..."), this.eval(function(s) {
        return document.querySelector(s).textContent;
    }, selector.toString());
}, PFT.BasePage.prototype.getAttribute = function(selector, attribute) {
    return PFT.debug("returning href value for: '" + selector + "'..."), this.eval(function(s, a) {
        return document.querySelector(s).getAttribute(a);
    }, selector.toString(), attribute);
}, PFT.BasePage.prototype.sendKeys = function(selector, value, callback) {
    try {
        if (value) {
            var character = value.substring(0, 1);
            PFT.trace("appending value of '" + character + "' to: '" + selector + "'"), value = value.substring(1, value.length), 
            this.eval(function(s) {
                function fireEvent(element, event) {
                    return document.createEventObject ? (evt = document.createEventObject(), element.fireEvent("on" + event, evt)) : document.createEvent ? (evt = document.createEvent("HTMLEvents"), 
                    evt.initEvent(event, !0, !0), !element.dispatchEvent(evt)) : (evt = new Event(event), 
                    element.dispatchEvent(evt));
                }
                var evt, el = document.querySelector(s.sel);
                el.value = el.value + s.ch, fireEvent(el, "keydown"), fireEvent(el, "keyup"), fireEvent(el, "focus");
            }, {
                sel: selector,
                ch: character
            }), this.page.sendEvent("keyup", character), value.length > 0 ? setTimeout(function() {
                this.sendKeys(selector, value, callback);
            }.bind(this), 25) : callback.call(this, !0);
        } else callback.call(this, !1, "no value passed to method: " + value);
    } catch (e) {
        callback.call(this, !1, e);
    }
}, PFT.BasePage.prototype.setCheckboxState = function(selector, enabled) {
    PFT.debug("setting state of checkbox for: '" + selector + "' to: " + enabled), enabled ? this.eval(function(s) {
        document.querySelector(s).checked = !0;
    }, selector.toString()) : this.eval(function(s) {
        document.querySelector(s).checked = !1;
    }, selector.toString());
}, PFT.BasePage.prototype.eval = function() {
    return arguments && arguments.length > 0 ? (PFT.debug("eval called with '" + arguments.length + "' arguments"), 
    PFT.trace("evaluating: '" + JSON.stringify(arguments) + "' in page..."), this.page.evaluate.apply(this.page, arguments)) : void 0;
}, PFT.BasePage.prototype.extend = function(module) {
    for (var k in module) module.hasOwnProperty(k) && (this[k] = module[k]);
}, PFT.tester = {
    timeOutAfter: PFT.DEFAULT_TIMEOUT,
    ready: !0,
    running: !1,
    inQueue: [],
    outQueue: [],
    _currentSuite: null,
    remainingCount: 0,
    globalStartTime: null,
    SUITE: 0,
    SETUP: 1,
    TEST: 2,
    TEARDOWN: 3,
    _reset: function() {
        PFT.tester.running = !1, PFT.tester.ready = !0, PFT.tester.inQueue = [], PFT.tester.outQueue = [], 
        PFT.tester.globalStartTime = null, PFT.tester.timeOutAfter = PFT.DEFAULT_TIMEOUT, 
        PFT.tester._currentSuite = null, PFT.tester.remainingCount = 0;
    },
    suite: function(name) {
        PFT.tester.appendToExecutionQueue(name, PFT.tester.SUITE, void 0, function() {
            PFT.tester._currentSuite = name, PFT.logger.log(PFT.logger.TEST, "Suite: " + name), 
            PFT.tester.onSuiteStarted({
                suite: name
            }), PFT.tester.done();
        });
    },
    test: function(name, options, data, callback) {
        2 === arguments.length && (callback = options, options = void 0), options || (options = {});
        var maxDuration;
        options.maxDuration && (maxDuration = options.maxDuration), options.setup && PFT.tester.appendToExecutionQueue("Setup - " + name, PFT.tester.SETUP, data, function(data) {
            options.setup.call(this, data);
        }, maxDuration), PFT.tester.remainingCount++, PFT.tester.appendToExecutionQueue(name, PFT.tester.TEST, data, function(page, data, assert) {
            var msg = "Starting: '" + PFT.tester.outQueue[0].name + "'...";
            data && (msg += "\n	Data: " + JSON.stringify(data)), PFT.logger.log(PFT.logger.TEST, msg), 
            PFT.tester.onTestStarted({
                test: PFT.tester.outQueue[0]
            }), callback.call(this, page, data, assert);
        }, maxDuration, PFT.tester._currentSuite), options.tearDown && PFT.tester.appendToExecutionQueue("TearDown - " + name, PFT.tester.TEARDOWN, data, function(data) {
            options.tearDown.call(this, data);
        }, maxDuration);
    },
    appendToExecutionQueue: function(name, type, data, fn, maxDuration, suite) {
        PFT.tester.inQueue.push({
            fn: fn,
            type: type,
            name: name,
            data: data,
            passes: 0,
            failures: [],
            errors: [],
            maxDuration: maxDuration,
            suite: suite
        });
    },
    assert: {
        isTrue: function(value, message) {
            if (!value) {
                var m = message || "expected 'true' but was 'false'";
                throw m = "'" + PFT.tester.outQueue[0].name + "'\n	" + m, PFT.tester.outQueue[0].failures.push(m), 
                PFT.tester.outQueue[0].halt = !0, PFT.logger.log(PFT.logger.TEST, "Assert failed - " + m), 
                PFT.tester.onAssertionFailure({
                    test: PFT.tester.outQueue[0],
                    message: m
                }), m;
            }
            PFT.tester.outQueue[0].passes++;
        },
        isFalse: function(value, message) {
            PFT.tester.assert.isTrue(!value, message);
        },
        pass: function(message) {
            var m = message || PFT.tester.outQueue[0].name;
            PFT.logger.log(PFT.logger.TEST, "PASS: " + m), PFT.tester.assert.isTrue(!0, message), 
            PFT.tester.done();
        },
        fail: function(message) {
            var m = message || PFT.tester.outQueue[0].name;
            PFT.logger.log(PFT.logger.TEST, "FAIL: " + m, !0), PFT.tester.assert.isTrue(!1, message), 
            PFT.tester.done();
        }
    },
    pass: function(message) {
        PFT.tester.assert.pass(message);
    },
    fail: function(message) {
        PFT.tester.assert.fail(message);
    },
    start: function() {
        PFT.tester.running || (PFT.tester.globalStartTime = new Date().getTime(), PFT.tester.running = !0, 
        PFT.tester.executionLoop());
    },
    executionLoop: function() {
        var duration = PFT.tester.outQueue[0] && PFT.tester.outQueue[0].maxDuration ? PFT.tester.outQueue[0].maxDuration : PFT.tester.timeOutAfter;
        if (PFT.tester.outQueue[0] && PFT.tester.outQueue[0].startTime && new Date().getTime() - PFT.tester.outQueue[0].startTime >= duration) {
            var msg = "Test '" + PFT.tester.outQueue[0].name + "' exceeded timeout of " + duration;
            PFT.tester.outQueue[0].errors.push(msg), PFT.logger.log(PFT.logger.TEST, msg), PFT.tester.onTimeout({
                test: PFT.tester.outQueue[0],
                message: msg
            }), PFT.tester.done();
        }
        if (PFT.tester.inQueue.length > 0) {
            if (PFT.tester.ready && PFT.tester.running) try {
                PFT.tester.ready = !1, PFT.tester.outQueue.unshift(PFT.tester.inQueue.shift()), 
                PFT.tester.outQueue[0].startTime = new Date().getTime(), PFT.tester.outQueue[0].type === PFT.tester.TEST && (PFT.tester.outQueue[0].page = PFT.createPage()), 
                PFT.tester.outQueue[0].data = PFT.tester.outQueue[0].data, PFT.tester.outQueue[0].fn.call(this, PFT.tester.outQueue[0].page, PFT.tester.outQueue[0].data, PFT.tester.assert);
            } catch (e) {
                phantom.onError(e);
            }
        } else PFT.tester.ready && PFT.tester.remainingCount < 1 && PFT.tester.exit();
        PFT.tester.running && setTimeout(PFT.tester.executionLoop, 10);
    },
    done: function() {
        if (PFT.tester.outQueue[0] && PFT.tester.outQueue[0].type === PFT.tester.TEST) {
            var duration = PFT.convertMsToHumanReadable(new Date().getTime() - PFT.tester.outQueue[0].startTime);
            PFT.tester.outQueue[0].duration = duration;
            var msg = "Completed: '" + PFT.tester.outQueue[0].name + "' in " + duration + " with " + PFT.tester.outQueue[0].passes + " passes, " + PFT.tester.outQueue[0].failures.length + " failures, " + PFT.tester.outQueue[0].errors.length + " errors.";
            PFT.logger.log(PFT.logger.TEST, msg);
        }
        PFT.tester.ready = !0, PFT.tester.outQueue[0].type === PFT.tester.TEST && (PFT.tester.remainingCount--, 
        PFT.tester.outQueue[0].page.close(), PFT.tester.onTestCompleted({
            test: PFT.tester.outQueue[0]
        }));
    },
    stop: function() {
        PFT.tester.running = !1;
    },
    exit: function() {
        PFT.tester.stop();
        var i, j, duration = PFT.convertMsToHumanReadable(new Date().getTime() - PFT.tester.globalStartTime), wroteFailures = !1, wroteErrors = !1, passes = 0, failures = 0, errors = 0, failuresMsg = "", errorsMsg = "";
        for (i = 0; i < PFT.tester.outQueue.length; i++) {
            for (passes += PFT.tester.outQueue[i].passes, failures += PFT.tester.outQueue[i].failures.length, 
            errors += PFT.tester.outQueue[i].errors.length, j = 0; j < PFT.tester.outQueue[i].failures.length; j++) {
                var failure = PFT.tester.outQueue[i].failures[i];
                wroteFailures || (wroteFailures = !0, failuresMsg += "\nFAILURES:\n"), failuresMsg += "	" + failure + "\n";
            }
            for (j = 0; j < PFT.tester.outQueue[i].errors.length; j++) {
                var error = PFT.tester.outQueue[i].errors[j];
                wroteErrors || (wroteErrors = !0, errorsMsg += "\nERRORS:\n"), errorsMsg += "	" + error + "\n";
            }
        }
        var msg = "Completed all tests in " + duration + " with " + passes + " passes, " + failures + " failures, " + errors + " errors.\n";
        msg += failuresMsg, msg += errorsMsg, PFT.logger.log(PFT.logger.TEST, msg), PFT.tester.onExit({
            message: msg
        });
        var exitCode = errors + failures;
        setTimeout(function() {
            phantom.exit(exitCode);
        }, 1e3);
    },
    onTestStarted: function() {},
    onSuiteStarted: function() {},
    onTestCompleted: function() {},
    onPageError: function() {},
    onError: function() {},
    onTimeout: function() {},
    onAssertionFailure: function() {},
    onExit: function() {}
}, Function.prototype.bind || (Function.prototype.bind = function(oThis) {
    if ("function" != typeof this) throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {}, fBound = function() {
        return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
    };
    return fNOP.prototype = this.prototype, fBound.prototype = new fNOP(), fBound;
});
module ? module.exports = PFT : ;