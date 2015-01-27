/*! PFT v0.9.0, created by: Jason Holt Smith <bicarbon8@gmail.com> 2015-01-27 18:28:57 */var PFT = {};

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
    return PFT.tester.running && PFT.tester.current && (PFT.tester.current.page = page), 
    page;
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
    PFT.Logger.log(PFT.Logger.TRACE, message);
}, PFT.debug = function(message) {
    PFT.Logger.log(PFT.Logger.DEBUG, message);
}, PFT.info = function(message) {
    PFT.Logger.log(PFT.Logger.INFO, message);
}, PFT.warn = function(message) {
    PFT.Logger.log(PFT.Logger.WARN, message);
}, PFT.error = function(message) {
    PFT.Logger.log(PFT.Logger.ERROR, message, !0);
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
    if (PFT.tester.running && PFT.tester.current && PFT.tester.current.halt) PFT.tester.done(); else {
        var msgStack = [ msg ];
        trace && trace.length && trace.forEach(function(t) {
            msgStack.push(" -> " + (t.file || t.sourceURL) + ": " + t.line + (t["function"] ? " (in function " + t["function"] + ")" : ""));
        }), PFT.Logger.log(PFT.Logger.ERROR, msgStack.join("\n"), !1), PFT.tester.onError({
            message: msgStack.join("\n")
        }), phantom.exit(1);
    }
};

var PFT = PFT || {};

PFT.Logger = {
    logLevel: require("system").env.log_level || "info",
    UNKNOWN: -1,
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5,
    TEST: 100,
    getLogLevelInt: function(levelStr) {
        switch (levelStr.toLowerCase()) {
          case "trace":
            return PFT.Logger.TRACE;

          case "debug":
            return PFT.Logger.DEBUG;

          case "info":
            return PFT.Logger.INFO;

          case "warn":
            return PFT.Logger.WARN;

          case "error":
            return PFT.Logger.ERROR;

          case "fatal":
            return PFT.Logger.FATAL;

          case "qunit":
            return PFT.Logger.TEST;

          default:
            return PFT.Logger.UNKNOWN;
        }
    },
    getLogLevelStr: function(levelInt) {
        switch (levelInt) {
          case PFT.Logger.TRACE:
            return "TRACE";

          case PFT.Logger.DEBUG:
            return "DEBUG";

          case PFT.Logger.INFO:
            return "INFO";

          case PFT.Logger.WARN:
            return "WARN";

          case PFT.Logger.ERROR:
            return "ERROR";

          case PFT.Logger.FATAL:
            return "FATAL";

          case PFT.Logger.TEST:
            return "TEST";

          default:
            return "UNKNOWN";
        }
    },
    log: function(levelInt, message, includeStackTrace) {
        if (levelInt >= PFT.Logger.getLogLevelInt(PFT.Logger.logLevel)) {
            includeStackTrace && (message += "\n" + PFT.Logger._getStackTrace());
            var msg = PFT.Logger.getLogLevelStr(levelInt) + ": " + message;
            switch (levelInt) {
              case PFT.Logger.FATAL:
              case PFT.Logger.ERROR:
                console.error(msg);
                break;

              case PFT.Logger.WARN:
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
    PFT.debug("waiting for: '" + selector + "' or until " + maxMsWait + "ms has passed.");
    var expiry = new Date().getTime() + 1e4;
    return maxMsWait && "number" == typeof maxMsWait && (expiry = new Date().getTime() + maxMsWait), 
    this.waitUntil(selector, callback, expiry);
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
    testQueue: [],
    current: null,
    passes: 0,
    failures: [],
    errors: [],
    remainingCount: 0,
    globalStartTime: null,
    suite: function(name) {
        PFT.tester.appendToExecutionQueue(name, "suite", function() {
            PFT.Logger.log(PFT.Logger.TEST, "Suite Started: " + name), PFT.tester.onSuiteStarted({
                suite: name
            }), PFT.tester.done();
        });
    },
    test: function(name, options, data, callback) {
        2 === arguments.length && (callback = options, options = void 0), options || (options = {});
        var maxDuration;
        options.maxDuration && (maxDuration = options.maxDuration), options.setup && PFT.tester.appendToExecutionQueue("Setup - " + name, "setup", data, function(data) {
            options.setup.call(this, data);
        }, maxDuration), PFT.tester.remainingCount++, PFT.tester.appendToExecutionQueue(name, "test", data, function(data, assert) {
            var msg = "Starting: '" + PFT.tester.current.name + "'...";
            data && (msg += "\n	Data: " + JSON.stringify(data)), PFT.Logger.log(PFT.Logger.TEST, msg), 
            PFT.tester.onTestStarted({
                test: PFT.tester.current
            }), callback.call(this, data, assert);
        }, maxDuration), options.tearDown && PFT.tester.appendToExecutionQueue("TearDown - " + name, "teardown", data, function(data) {
            options.tearDown.call(this, data);
        }, maxDuration);
    },
    appendToExecutionQueue: function(name, type, data, fn, maxDuration) {
        PFT.tester.testQueue.push({
            fn: fn,
            type: type,
            name: name,
            data: data,
            passes: 0,
            failures: [],
            errors: [],
            maxDuration: maxDuration
        });
    },
    assert: {
        isTrue: function(value, message) {
            if (!value) {
                var m = message || "expected 'true' but was 'false'";
                throw m = "'" + PFT.tester.current.name + "'\n	" + m, PFT.tester.failures.push(m), 
                PFT.tester.current.failures.push(m), PFT.tester.current.halt = !0, PFT.Logger.log(PFT.Logger.TEST, "Assert failed - " + m), 
                PFT.tester.onAssertionFailure({
                    test: PFT.tester.current,
                    message: m
                }), m;
            }
            PFT.tester.passes++, PFT.tester.current.passes++;
        },
        isFalse: function(value, message) {
            PFT.tester.assert.isTrue(!value, message);
        },
        pass: function(message) {
            var m = message || PFT.tester.current.name;
            PFT.Logger.log(PFT.Logger.TEST, "PASS: " + m), PFT.tester.assert.isTrue(!0, message), 
            PFT.tester.done();
        },
        fail: function(message) {
            var m = message || PFT.tester.current.name;
            PFT.Logger.log(PFT.Logger.TEST, "FAIL: " + m, !0), PFT.tester.assert.isTrue(!1, message), 
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
        var duration = PFT.tester.current && PFT.tester.current.maxDuration ? PFT.tester.current.maxDuration : PFT.tester.timeOutAfter;
        if (PFT.tester.current && PFT.tester.current.startTime && new Date().getTime() - PFT.tester.current.startTime >= duration) {
            var msg = "Test '" + PFT.tester.current.name + "' exceeded timeout of " + duration;
            PFT.tester.errors.push(msg), PFT.tester.current.errors.push(msg), PFT.Logger.log(PFT.Logger.TEST, msg), 
            PFT.tester.onTimeout({
                test: PFT.tester.current,
                message: msg
            }), PFT.tester.done();
        }
        if (PFT.tester.testQueue.length > 0) {
            if (PFT.tester.ready && PFT.tester.running) try {
                PFT.tester.ready = !1;
                var test = PFT.tester.testQueue.shift();
                PFT.tester.current = test, PFT.tester.current.startTime = new Date().getTime(), 
                test.fn.call(this, test.data, PFT.tester.assert);
            } catch (e) {
                var msg = "Error due to: " + e;
                PFT.Logger.log(PFT.Logger.TEST, msg, !0), PFT.tester.errors.push(msg), PFT.tester.current.errors.push(msg), 
                PFT.tester.onError({
                    test: PFT.tester.current,
                    message: msg
                }), PFT.tester.done();
            }
        } else PFT.tester.remainingCount < 1 && PFT.tester.exit();
        PFT.tester.running && setTimeout(PFT.tester.executionLoop, 10);
    },
    done: function() {
        if (PFT.tester.current && "test" === PFT.tester.current.type) {
            var duration = PFT.convertMsToHumanReadable(new Date().getTime() - PFT.tester.current.startTime);
            PFT.tester.current.duration = duration, PFT.tester.onTestCompleted({
                test: PFT.tester.current
            });
            var msg = "Completed: '" + PFT.tester.current.name + "' in " + duration + " with " + PFT.tester.current.passes + " passes, " + PFT.tester.current.failures.length + " failures, " + PFT.tester.current.errors.length + " errors.";
            PFT.Logger.log(PFT.Logger.TEST, msg);
        }
        PFT.tester.ready = !0, "test" === PFT.tester.current.type && PFT.tester.remainingCount--;
    },
    stop: function() {
        PFT.tester.running = !1;
    },
    exit: function() {
        PFT.tester.stop();
        for (var exitCode = PFT.tester.errors.length + PFT.tester.failures.length, duration = PFT.convertMsToHumanReadable(new Date().getTime() - PFT.tester.globalStartTime), msg = "Completed all tests in " + duration + " with " + PFT.tester.passes + " passes, " + PFT.tester.failures.length + " failures, " + PFT.tester.errors.length + " errors.\n", i = 0; i < PFT.tester.failures.length; i++) {
            var failure = PFT.tester.failures[i];
            0 === i && (msg += "\nFAILURES:\n"), msg += "	" + failure + "\n";
        }
        for (var i = 0; i < PFT.tester.errors.length; i++) {
            var error = PFT.tester.errors[i];
            0 === i && (msg += "\nERRORS:\n"), msg += "	" + error + "\n";
        }
        PFT.Logger.log(PFT.Logger.TEST, msg), setTimeout(function() {
            phantom.exit(exitCode);
        }, 1e3);
    },
    onTestStarted: function() {},
    onSuiteStarted: function() {},
    onTestCompleted: function() {},
    onPageError: function() {},
    onError: function() {},
    onTimeout: function() {},
    onAssertionFailure: function() {}
}, Function.prototype.bind || (Function.prototype.bind = function(oThis) {
    if ("function" != typeof this) throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {}, fBound = function() {
        return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
    };
    return fNOP.prototype = this.prototype, fBound.prototype = new fNOP(), fBound;
});
module ? module.exports = PFT : ;