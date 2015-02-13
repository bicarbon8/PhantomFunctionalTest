/**
 * a base object to be used for navigating and validating a site
 * @param {PhantomJs.Webpage.Page} [page=PFT.createPage()] - an
 * existing Page object to be used by this class
 * @param {string} [baseUrl=""] - a URI root that can form the
 * base for all extending classes
 * @class PFT.BasePage - Represents a base object to extend from for UI testing.
 * Ex:
 * <p><code>
 * function HomePage(page, url) {<br />
 * &nbsp; PFT.BasePage.call(this, page, url);<br />
 * &nbsp; this.HEADERLINK_CSS = '.header';<br />
 * &nbsp; this.registerKeyElement(this.HEADERLINK_CSS);<br />
 * }<br />
 * HomePage.prototype = Object.create(PFT.BasePage.prototype);<br />
 * HomePage.prototype.constructor = HomePage;<br />
 * </code></p>
 * @memberof PFT
 */
PFT.BasePage = function(page, baseUrl) {
    this.page = page || PFT.createPage();
    this.baseUrl = baseUrl || "";
    this.keyElements = [];

    // handle errors that happen on the actual website
    this.page.onError = function (msg, trace) {
        // capture errors and log
        var msgStack = [msg];
        if (trace && trace.length) {
            trace.forEach(function(t) {
                msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
            });
        }
        PFT.trace(msgStack.join('\n'));
        PFT.tester.onPageError({ message: msgStack.join('\n') });

        if (!PFT.IGNORE_PAGE_ERRORS) {
            phantom.onError(msg, trace);
        }
    };

    this.page.onConsoleMessage = function (msg, lineNum, sourceId) {
        PFT.trace('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
        var output = {
            "message": msg,
            "line": lineNum,
            "source": sourceId
        };
        PFT.onPageConsoleMessage(output);
    };
};

/**
 * function will navigate to the 'baseUrl' specified on object creation
 * @param {string} [urlParams=""] - a string of URL Encoded values to be appended
 * to the 'baseUrl'
 * @param {function} callback - the function to execute after the page is loaded.
 * on success the callback will be passed a boolean of 'true' otherwise 'false' and
 * an error message will be passed to the callback
 */
PFT.BasePage.prototype.open = function (urlParams, callback) {
    if (urlParams && !callback && typeof(urlParams) === "function") {
        callback = urlParams;
        urlParams = undefined;
    }
    var p = urlParams || "";
    this.page.open(this.baseUrl + p, function afterOpen(status) {
        PFT.debug('opened page: ' + this.baseUrl + " = " + status);
        if(status == 'success') {
            callback.call(this, true);
        } else {
            callback.call(this, false, "opening '" + this.baseUrl + p + "' returned: " + status);
        }
    }.bind(this));
};

PFT.BasePage.prototype.close = function () {
    this.page.clearCookies();
    this.page.close();
    for (var key in this) {
        if (this.hasOwnProperty(key)) {
            this[key] = undefined;
        }
    }
};

/**
 * function allows for registering key selectors that must be present on the
 * page. this can then be verified through the {@link PFT.BasePage.checkValidity}
 * function
 */
PFT.BasePage.prototype.registerKeyElement = function (elementSelector) {
    this.keyElements.push(elementSelector);
};

/**
 * function will ensure that each of the key elements are present on the
 * page by looping through all selectors passed to {@link PFT.BasePage.registerKeyElement}
 * and passing a boolean of 'true' if all exist otherwise 'false' and an error
 * message
 */
PFT.BasePage.prototype.checkValidity = function (callback) {
    var selectors = this.keyElements;
    this._verify(selectors, callback);
};

/** @ignore */
PFT.BasePage.prototype._verify = function (selectors, callback) {
    if (selectors.length > 0) {
        var selector = selectors.shift();
        PFT.debug("verifying '" + selector + "' exists on page...");
        this.waitFor(selector, function elementFound(success, msg) {
            if (!success) {
                callback.call(this, false, "unable to locate selector: " + msg);
            } else {
                if (selectors.length > 0) {
                    this._verify(selectors, callback);
                } else {
                    callback.call(this, true);
                }
            }
        }.bind(this), PFT.DEFAULT_TIMEOUT);
    } else {
        callback.call(this, false, "nothing to verify");
    }
};

PFT.BasePage.prototype.withinPage = function(selector) {
    PFT.debug("checking for: '"+selector+"' within page.");
    try {
        var pos = this.elementPosition(selector);
        if(pos.left >=0 && pos.top >= 0 && pos.left <= this.page.viewportSize.width && pos.top <= this.page.viewportSize.height) {
            return true;
        } else {
            return false;
        }
    } catch(e) {
        return false;
    }
};

PFT.BasePage.prototype.visible = function(selector) {
    PFT.debug("checking for: '"+selector+"' visible.");
    try {
        /* jshint evil:true */
        var display = this.eval(function getDisplay(s) {
            var el = document.querySelector(s);
            if (typeof window.getComputedStyle !== "undefined") {
                return window.getComputedStyle(el, null).display;
            } else if (el.currentStyle !== "undefined") {
                return el.currentStyle.display;
            }
        }, selector);
        if(display === "none") {
            return false;
        } else {
            return true;
        }
    } catch(e) {
        return false;
    }
};

/**
 * function will pass the current 'PhantomJs.Webpage.Page' to
 * {@link PFT.renderPage}
 * @param {string} [name=page.url] - an optional name to use for
 * the image name
 */
PFT.BasePage.prototype.renderPage = function(name) {
    PFT.renderPage(this.page, name);
};

/**
 * function will verify the presence of the passed in selector by polling
 * the page up to the 'maxMsWait' and will pass a boolean 'true' to the
 * callback if found otherwise 'false' and an error message
 * @param {string} selector - the CSS selector used to identify the element
 * on the page
 * @param {function} callback - a function to be called when the element is
 * found or when the maximum wait time has passed
 * @param {Integer} [maxMsWait=PFT.DEFAULT_TIMEOUT] - the maximum number of
 * milliseconds to wait while attempting to locate the passed in selector
 */
PFT.BasePage.prototype.waitFor = function(selector, callback, maxMsWait) {
    var wait = maxMsWait || PFT.DEFAULT_TIMEOUT;
    if (isNaN(wait)) {
        callback.call(this, false, "invalid value of '" + wait + "' passed to function");
    } else {
        PFT.debug("waiting for: '" + selector + "' or until " + wait + "ms has passed.");
        var expiry = new Date().getTime() + wait;
        this.waitUntil(selector, callback, expiry);
    }
};

PFT.BasePage.prototype.waitUntil = function(selector, callback, timeInMilliseconds) {
    PFT.debug("waiting for: '"+selector+"' or for "+(timeInMilliseconds-(new Date().getTime()))+" milliseconds");

    if(this.exists(selector)) {
        PFT.debug("selector found.");
        callback.call(this, true);
    } else {
        PFT.debug("selector not found.");
        // ensure we haven't (or won't have) exceeded our timeout
        if((new Date().getTime() + PFT.POLLING_INTERVAL) < timeInMilliseconds) {
            // wait for polling interval milliseconds then check again
            PFT.debug("retrying...");
            setTimeout(function() {
                this.waitUntil(selector, callback, timeInMilliseconds);
            }.bind(this), PFT.POLLING_INTERVAL);
        } else {
            PFT.info("timing out. '"+selector+"' not found by: "+new Date(timeInMilliseconds));
            callback.call(this, false, "'"+selector+"' not found by: "+new Date(timeInMilliseconds));
        }
    }
};

/**
 * function verifies that the passed in selector exists on the page
 * @param {string} selector - the CSS selector used to identify the element
 */
PFT.BasePage.prototype.exists = function(selector) {
    PFT.debug("checking for: '"+selector+"' on page.");
    /* jshint evil:true */
    var condition = this.eval(function(s) { return (document.querySelector(s) !== null); }, selector.toString()); // returns (true|false)
    if (condition) {
        PFT.debug("condition met.");
        return true;
    } else {
        PFT.debug("condition failed.");
        return false;
    }
};

PFT.BasePage.prototype.elementPosition = function(selector) {
    PFT.debug("retrieving: '"+selector+"' position page.");
    /* jshint evil:true */
    var pos = this.eval(function(s) { return document.querySelector(s).getBoundingClientRect(); }, selector.toString());
    if (pos && (pos.left !== undefined || pos.left !== null) && (pos.top !== undefined || pos.top !== null)) {
        PFT.debug("found '"+selector+"' at position: "+JSON.stringify(pos));
        return pos;
    } else {
        throw "element could not be located on the page. pos: "+JSON.stringify(pos);
    }
};

/**
 * function will issue a PhantomJs click event on the specified selector
 * @param {string} selector - the CSS selector to use in identifying which
 * element to click
 */
PFT.BasePage.prototype.click = function(selector) {
    PFT.debug("clicking on: '"+selector+"'...");
    var pos = this.elementPosition(selector);
    /* jshint evil:true */
    this.eval(function(s) {
        var ev = document.createEvent("MouseEvent");
        ev.initMouseEvent(
            "click",
            true /* bubble */,
            true /* cancelable */,
            window,
            null,
            0, 0, 0, 0, /* coordinates */
            false, false, false, false, /* modifier keys */
            0 /*left*/,
            null
        );
        document.querySelector(s).dispatchEvent(ev);
    }, selector);
};

/**
 * function will return the text content of the specified element.
 * @param {string} selector - the CSS selector to use in identifying which
 * element to return the text content from within. The returned text will be
 * from the specified element and any child elements and will not include HTML
 */
PFT.BasePage.prototype.getText = function (selector) {
    PFT.debug("getting textContent for: '" + selector + "'...");
    /* jshint evil:true */
    return this.eval(function(s) { return document.querySelector(s).textContent; }, selector.toString());
};

PFT.BasePage.prototype.getAttribute = function(selector, attribute) {
    PFT.debug("returning href value for: '"+selector+"'...");
    /* jshint evil:true */
    return this.eval(function(s, a) { return document.querySelector(s).getAttribute(a); }, selector.toString(), attribute);
};

/**
 * function will place focus on the specified selector and then send a keydown
 * followed by a keyup event for each character of the passed in value string.
 * when completed the callback will be called with a value of true
 * @param {string} selector - the CSS selector to use in identifying which
 * element will have focus for the keys
 * @param {string} value - the text string to be typed
 * @param {Function} callback - the callback function to be called after all
 * characters have been sent
 * @param {Integer} [keyDelay=25] - the delay in milliseconds between each
 * keypress
 */
PFT.BasePage.prototype.sendKeys = function(selector, value, callback, keyDelay) {
    var delay = keyDelay || 25;
    try {
        if(value) {
            var character = value.substring(0,1);
            PFT.trace("appending value of '" + character + "' to: '" + selector + "'");
            value = value.substring(1, value.length);
            /* jshint evil:true */
            this.eval(function (s) {
                document.querySelector(s).focus();
            }, selector.toString());
            this.page.sendEvent('keydown', character);
            this.page.sendEvent('keyup', character);

            if(value.length > 0) {
                setTimeout(function afterSendKey() {
                    this.sendKeys(selector, value, callback);
                }.bind(this), delay);
            } else {
                callback.call(this, true);
            }
        } else {
            callback.call(this, false, "no value passed to method: "+value);
        }
    } catch(e) {
        callback.call(this, false, e);
    }
};

PFT.BasePage.prototype.setCheckboxState = function(selector, enabled) {
    PFT.debug("setting state of checkbox for: '"+selector+"' to: "+enabled);

    if(enabled) {
        /* jshint evil:true */
        this.eval(function(s) { document.querySelector(s).checked=true; }, selector.toString());
    } else {
        this.eval(function(s) { document.querySelector(s).checked=false; }, selector.toString());
    }
};

/**
 * function will evaluate the passed in javascript function within the page. Any
 * arguments passed in after the function will be passed as arguments to the
 * function
 * @param {Function} script - the javascript function to be evaluated on the
 * page
 * @param {Object} arguments - an object to be passed to the function when
 * executed
 */
/* jshint evil:true */
PFT.BasePage.prototype.eval = function() {
    if (arguments && arguments.length > 0) {
        PFT.debug("eval called with '" + arguments.length + "' arguments");
        PFT.trace("evaluating: '" + JSON.stringify(arguments) + "' in page...");
        var result;
        try {
            result = this.page.evaluate.apply(this.page, arguments);
        } catch (e) {
            PFT.warn(e);
        }
        return result;
    }
};

/**
 * function provides a MixIn ability for the {@link PFT.BasePage}
 * and any subclasses which can be useful in splitting out sections
 * of page functionality into separate modules such as those used
 * to describe header, footer and body interactions within a page
 * @param {Object} module - the javascript Object to be mixed in to
 * this page
 */
PFT.BasePage.prototype.extend = function(module) {
    for (var k in module) {
        if (module.hasOwnProperty(k)) {
            this[k] = module[k];
        }
    }
};
