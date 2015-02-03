/**********************************************************************
 * This file is part of the PhantomFunctionalTest project.
 *
 * @Created: 01/28/2015
 * @Author: Jason Holt Smith <bicarbon8@gmail.com>
 * Copyright (c) 2015 Jason Holt Smith. PhantomFunctionalTest is
 * distributed under the terms of the GNU General Public License.
 *
 * PhantomFunctionalTest is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PhantomFunctionalTest is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with PhantomFunctionalTest.  If not, see <http://www.gnu.org/licenses/>.
 **********************************************************************/

/** @namespace */
var PFT = {};

/**
 * property specifying the delay between retries when waiting
 * for selectors to be displayed
 * @property {number} [PFT.POLLING_INTERVAL=1000] - the number of milliseconds
 * between retries used in any polling like {@link PFT.BasePage.waitFor}
 */
PFT.POLLING_INTERVAL = 1000; // 1 second

/**
 * property used as a default wait timeout in the 'PFT.tester' module
 * @property {number} [PFT.DEFAULT_TIMEOUT=60000] - the number of milliseconds
 * used by default for any waiting like {@link PFT.BasePage.waitFor}
 */
PFT.DEFAULT_TIMEOUT = 60000; // 1 minute

/**
 * property defining the base directory used with 'PFT.renderPage' and
 * 'PFT.BasePage.renderPage' calls
 * @property {string} [PFT.IMAGES_DIR='./img/'] - the default directory where
 * any images will be written
 */
PFT.IMAGES_DIR = './img/';

/**
 * function will create a new page in PhantomJs with the passed in
 * viewport dimensions or a default of 1024x800 and using the passed
 * in headers. If called within a PFT.tester.test the returned page
 * will also be set as the PFT.tester.current.page object
 * @param {Object} [viewport={width:1024,height:800}] - an object containing the 'width' and
 * 'height' properties to use with the new page. Ex: { width: 1024,
 * height: 768 }
 * @param {Object[]} [headers] - an array of objects containing a 'name'
 * and 'value' property which will be set as headers for all requests
 * using the returned page. Ex: [{ name: "Accept-Language", value:
 * "en-US" }]
 * @param {string} headers[].name - the header key such as "Accept-Language"
 * @param {string} headers[].value = the header value such as "en-US"
 * @returns {PhantomJs.Webpage.Page} a new page object
 */
PFT.createPage = function(viewport, headers) {
    PFT.debug("generating new page...");
    var page = null;
    page = require('webpage').create();
    if(!viewport) {
        viewport = { width: 1024, height: 800 };
    }
    PFT.resizeViewport(page, viewport);

    if (headers) {
        PFT.addHeaders(page, headers);
    }

    return page;
};

/**
 * function will resize the passed in PhantomJs.Webpage.Page to
 * the specified dimensions
 * @param {PhantomJs.Webpage.Page} page - the Page object to resize
 * @param {Object} dimensions - an Object containing a width and
 * height property set to values greater than 0
 */
PFT.resizeViewport = function (page, dimensions) {
    PFT.debug("setting viewport to: " + JSON.stringify(dimensions));
    if (page && dimensions && dimensions.width && dimensions.height) {
        page.viewportSize = dimensions;
    }
};

/**
 * function will add headers to the passed in 'PhantomJs.Webpage.Page'
 * object or overwrite them if they already exist
 * @param {PhantomJs.Webpage.Page} page - the Page object to set headers
 * on
 * @param {Object[]} headers - an array of Objects containing a name and
 * value
 * @param {string} headers[].name - the header key such as "Accept-Language"
 * @param {string} headers[].value = the header value such as "en-US"
 */
PFT.addHeaders = function (page, headers) {
    if (page && headers && headers.length > 0) {
        headers.forEach(function (header) {
            if (header.name && header.value) {
                PFT.addHeader(page, header.name, header.value);
            }
        });
    }
};

/**
 * function will add a header to the passed in 'PhantomJs.Webpage.Page'
 * object or overwrite an existing header with the passed in value
 * @param {PhantomJs.Webpage.Page} page - the Page object to set headers
 * on
 * @param {string} name - the name of the header such as "Accept-Language"
 * @param {string} value - the value of the header such as "en-US"
 */
PFT.addHeader = function(page, name, value) {
    PFT.debug("setting header of '" + name + "' to: " + value);
    var headers = page.customHeaders;
    if(!headers) {
        headers = {};
    }
    headers[name] = value;
    page.customHeaders = headers;
};

/**
 * function will return the value of the specified Cookie if it exists
 * @param {string} cookieName - the name of the Cookie to be retrieved
 * @returns {string} the value of the specified Cookie or undefined if
 * not found
 */
PFT.getCookieValue = function(cookieName) {
    PFT.debug("checking for cookie '"+cookieName+"' in cookies...");
    for(var key in phantom.cookies) {
        var cookie = phantom.cookies[key];
        if(cookie.name.toLowerCase() == cookieName.toLowerCase()) {
            PFT.debug("found '"+cookieName+"' cookie with value of: '"+cookie.value+"'");
            return cookie.value;
        }
    }
};

/**
 * convenience method for {@link PFT.logger.log} with a value of
 * {@link PFT.logger.TRACE} passed as the first parameter
 */
PFT.trace = function(message) {
    PFT.logger.log(PFT.logger.TRACE, message);
};

/**
 * convenience method for {@link PFT.logger.log} with a value of
 * {@link PFT.logger.DEBUG} passed as the first parameter
 */
PFT.debug = function(message) {
    PFT.logger.log(PFT.logger.DEBUG, message);
};

/**
 * convenience method for {@link PFT.logger.log} with a value of
 * {@link PFT.logger.INFO} passed as the first parameter
 */
PFT.info = function(message) {
    PFT.logger.log(PFT.logger.INFO, message);
};

/**
 * convenience method for {@link PFT.logger.log} with a value of
 * {@link PFT.logger.WARN} passed as the first parameter
 */
PFT.warn = function(message) {
    PFT.logger.log(PFT.logger.WARN, message);
};

/**
 * convenience method for {@link PFT.logger.log} with a value of
 * {@link PFT.logger.ERROR} passed as the first parameter and a
 * boolean value of 'true' passed as the last parameter
 */
PFT.error = function(message) {
    PFT.logger.log(PFT.logger.ERROR, message, true);
};

/**
 * function will generate a GUID or UUID complete with dashes
 * between the sections
 * @returns {string} a guid in the form of XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
PFT.guid = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4();
};

/**
 * function will convert a passed in millisecond value to a more
 * human-readable output format of HHH hours MM minutes SS seconds
 * mmm milliseconds
 * @param {Integer} milliseconds - the milliseconds to be converted
 * @returns {string} a human-readable string representing the passed
 * in value
 */
PFT.convertMsToHumanReadable = function (milliseconds) {
    var date = new Date(milliseconds);
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var ms = date.getMilliseconds();
    var out = "";

    if(h > 0) {
        out+=h;
        if(h==1) {
            out+=" hour ";
        } else {
            out+=" hours ";
        }
    }
    if(m > 0) {
        out+=m;
        if(m==1) {
            out+=" minute ";
        } else {
            out+=" minutes ";
        }
    }
    if(s > 0) {
        out+=s;
        if(s==1) {
            out+=" second ";
        } else {
            out+=" seconds ";
        }
    }
    if(ms > 0) {
        out+=ms;
        if(ms==1) {
            out+=" millisecond";
        } else {
            out+=" milliseconds";
        }
    }

    return out;
};

/**
 * function will create a JPG with a quality of 50% using either
 * the passed in name or the passed in 'PhantomJs.Webpage.Page'
 * url if no name is passed. The image will be written to the
 * {@link PFT.IMAGES_DIR} directory with the name formatted to remove
 * spaces and illegal characters
 * @param {PhantomJs.Webpage.Page} page - the Page object to be rendered
 * @param {string} [name=page.url] - a name to be used for the image
 */
PFT.renderPage = function (page, name) {
    if (page) {
        if (!name) {
            name = page.url;
        }
        name = name.replace(/\//g,'_').replace(/([%:?&\[\]{}\s\W\\])/g,'');
        name = PFT.IMAGES_DIR + name + "." + new Date().getTime() + ".jpg";

        PFT.info("capturing page image: " + name);
        try {
            page.render(name, { quality: '50' });
        } catch (e) {
            PFT.error("could not render image due to: " + e);
        }
    }
};

/**
 * function hook allowing for "listening" to any console messages sent
 * by the 'PhantomJs.Webpage.Page' objects
 */
PFT.onPageConsoleMessage = function (details) {
    // hook for handling page console messages
};

/** @ignore */
phantom.onError = function(msg, trace) {
    // if any exceptions make it past the page handle them here
    var stack = '';
    if (trace && trace.length > 0) {
        trace.forEach(function(t) {
            stack += '\t-> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : '') + '\n';
        });
    } else {
        stack += '\n' + PFT.logger._getStackTrace();
    }

    msg += stack;

    // only exit on unexpected errors
    if (PFT.tester.running && PFT.tester.outQueue.length > 0) {
        // halt current test and go to next
        if (!PFT.tester.outQueue[0].halt) {
            // non-assertion exception
            PFT.tester.outQueue[0].errors.push(msg);
        }
        PFT.tester.done();
    } else {
        // exit immediately
        PFT.logger.log(PFT.logger.ERROR, msg, false);
        PFT.tester.onError({ message: msg });

        phantom.exit(1);
    }
};

/** @ignore **/
var PFT_THREAD_ID = PFT_THREAD_ID || ''; // used for parallel execution

/** @namespace */
PFT.logger = {
    /**
     * property representing the string value of the minimum
     * logging level to output
     */
    logLevel: require('system').env.log_level || "info",

    /** @ignore */
    UNKNOWN: -1, // never show

    /**
     * property representing the minimum criticality level of logging.
     * this should be reserved for highly detailed debugging
     */
    TRACE: 0,

    /**
     * property representing a low criticality level of logging.
     * this should be reserved for debugging
     */
    DEBUG: 1,

    /**
     * property representing the normal criticality level of logging.
     * this should be reserved for helpful state change information
     */
    INFO: 2,

    /**
     * property representing the moderate criticality level of logging.
     * this should be reserved for potentially problematic state changes
     */
    WARN: 3,

    /**
     * property representing the maximum criticality level of logging.
     * this should be reserved for problems with execution that will
     * block functionality
     */
    ERROR: 4,

    /** @ignore */
    TEST: 100, // always show

    /** @ignore */
    getLogLevelInt: function (levelStr) {
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

    /** @ignore */
    getLogLevelStr: function (levelInt) {
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

    /**
     * function will log the passed in message to the console
     * based on the {@link PFT.logger.logLevel} where higher
     * criticality of levels will be output
     * @param {Integer} levelInt - a value of {@link PFT.logger.TRACE},
     * {@link PFT.logger.DEBUG}, {@link PFT.logger.INFO},
     * {@link PFT.logger.WARN}, or {@link PFT.logger.ERROR} to specify
     * the criticality of the message
     * @param {string} message - the message to be output if the level
     * is equal to or higher than {@link PFT.logger.logLevel}
     * @param {boolean} [includeStackTrace=false] - if set to true the
     * output message will be appended with the current execution stack
     */
    log: function(levelInt, message, includeStackTrace) {
        if (levelInt && !isNaN(levelInt) && levelInt > PFT.logger.UNKNOWN && levelInt >= PFT.logger.getLogLevelInt(PFT.logger.logLevel)) {
            if (includeStackTrace) {
                message += "\n" + PFT.logger._getStackTrace();
            }
            var msg = PFT.logger.getLogLevelStr(levelInt) + ": " + message;
            switch (levelInt) {
                case PFT.logger.FATAL:
                case PFT.logger.ERROR:
                    console.error(PFT_THREAD_ID + msg);
                    break;
                case PFT.logger.WARN:
                    console.warn(PFT_THREAD_ID + msg);
                    break;
                default:
                    console.log(PFT_THREAD_ID + msg);
            }
        }
    },

    /** @ignore */
    _getStackTrace: function () {
        var callstack = "";
        var isCallstackPopulated = false;
        try {
            i.dont.exist+=0; //doesn't exist- that's the point
        } catch(e) {
            var lines,
                i;
            if (e.stack) {
                lines = e.stack.split('\n');
                for (i=2; i<lines.length; i++) {
                    callstack += lines[i] + "\n";
                }
                isCallstackPopulated = true;
            }
        }
        if (!isCallstackPopulated) { //IE and Safari
            var currentFunction = arguments.callee.caller;
            while (currentFunction) {
                var fn = currentFunction.toString();
                var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('')) || 'anonymous';
                callstack += "\t" + fname + "\n";
                currentFunction = currentFunction.caller;
            }
        }
        return callstack;
    }
};

/**
 * a base object to be used for navigating and validating a site
 * @param {PhantomJs.Webpage.Page} [page=PFT.createPage()] - an
 * existing Page object to be used by this class
 * @param {string} [baseUrl=""] - a URI root that can form the
 * base for all extending classes
 * @class Represents a base object to extend from for UI testing.
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
    PFT.debug("using javascript click...");
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
        return this.page.evaluate.apply(this.page, arguments);
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

/** @namespace */
PFT.tester = {
    /**
     * @property {number} [timeOutAfter=PFT.DEFAULT_TIMEOUT] - the default max
     * amount of time allowed for tests to run before they are marked as a fail.
     * this can be overridden for a specific test by passing a 'maxDuration'
     * option to the {@link PFT.tester.test} function
     */
    timeOutAfter: PFT.DEFAULT_TIMEOUT,

    /** @ignore */
    ready: true,

    /** @ignore */
    running: false,

    /** @ignore */
    inQueue: [],

    /**
     * @property {Array} outQueue - the array of running and already run tasks
     * where index 0 is the currently running task
     */
    outQueue: [],

    /** @ignore */
    _currentSuite: null,

    /** @ignore */
    remainingCount: 0,

    /** @ignore */
    globalStartTime: null,

    /** @ignore */
    SUITE: 0,

    /** @ignore */
    SETUP: 1,

    /** @ignore */
    TEST: 2,

    /** @ignore */
    TEARDOWN: 3,

    /** @ignore */
    _reset: function () {
        PFT.tester.running = false;
        PFT.tester.ready = true;
        PFT.tester.inQueue = [];
        PFT.tester.outQueue = [];
        PFT.tester.globalStartTime = null;
        PFT.tester.timeOutAfter = PFT.DEFAULT_TIMEOUT;
        PFT.tester._currentSuite = null;
        PFT.tester.remainingCount = 0;
    },

    /**
     * function will set the suite of any subsequent tests to
     * this suite name
     */
    suite: function (name, options) {
        PFT.tester.appendToExecutionQueue(name, PFT.tester.SUITE, undefined, function suite() {
            PFT.tester._currentSuite = name;
            PFT.logger.log(PFT.logger.TEST, "Suite: " + name);
            PFT.tester.onSuiteStarted({ suite: name });
            PFT.tester.done();
        });
    },

    /**
     * function will schedule the passed in {@link testCallback} for execution.
     * When the test is complete it MUST call {@link PFT.tester.done} to indicate
     * that the next step should proceed
     * @param {string} name - the name of the test
     * @param {Object} [options={}] - a set of options specific to this test
     * @param {Integer} [options.maxDuration] - the maximum amount of time this
     * test will be allowed to execute in milliseconds
     * @param {function} [options.setup] - a function to be called prior to execution
     * of this test. When complete a setup function MUST call {@link PFT.tester.done}
     * to indicate that the setup is complete
     * @param {Integer} [options.tearDown] - a function to be called after execution
     * of this test. When complete a tearDown function MUST call {@link PFT.tester.done}
     * to indicate that the tearDown is complete
     * @param {Object} [data=undefined] - an Object to be passed to the test upon
     * execution. This can be used for parameterization of tests.
     * @param {testCallback} callback - the function to execute as a test. when
     * executed this function will be passed three arguments, a PhantomJs.Webpage.Page,
     * a data object and a reference to the {@link PFT.tester.assert} object
     */
    test: function (name, options, data, callback) {
        if (arguments.length === 2) {
            callback = options;
            options = undefined;
        }
        if (!options) {
            options = {};
        }
        var maxDuration;
        if (options.maxDuration) {
            maxDuration = options.maxDuration;
        }

        if (options.setup) {
            PFT.tester.appendToExecutionQueue("Setup - " + name, PFT.tester.SETUP, data, function setup(data) {
                options.setup.call(this, data);
            }, maxDuration);
        }
        PFT.tester.remainingCount++;
        PFT.tester.appendToExecutionQueue(name, PFT.tester.TEST, data, function runTest(page, data, assert) {
            var msg = "Starting: '" + PFT.tester.outQueue[0].name + "'...";
            if (data) {
                msg += "\n\tData: " + JSON.stringify(data);
            }
            PFT.logger.log(PFT.logger.TEST, msg);
            PFT.tester.onTestStarted({ test: PFT.tester.outQueue[0] });
            callback.call(this, page, data, assert);
        }, maxDuration, PFT.tester._currentSuite);
        if (options.tearDown) {
            PFT.tester.appendToExecutionQueue("TearDown - " + name, PFT.tester.TEARDOWN, data, function tearDown(data) {
                options.tearDown.call(this, data);
            }, maxDuration);
        }
    },

    /** @ignore */
    appendToExecutionQueue: function (name, type, data, fn, maxDuration, suite) {
        PFT.tester.inQueue.push({
            fn: fn,
            type: type,
            name: name,
            data: data,
            passes: 0,
            failures: [],
            errors: [],
            maxDuration: maxDuration,
            suite: suite,
        });
    },

    /** @namespace */
    assert: {
        /**
         * function to test the value of a passed in boolean is true
         * and to signal a halt to the current test if it is not.
         * function will also call {@link PFT.tester.done} so that any
         * subsequent tests can continue. triggers the {@link PFT.tester.onAssertionFailure}
         * function call if passed in value is false
         * @param {boolean} value - the boolean value to be compared to 'true'
         * @param {string} message - a message to display describing the failure in the
         * case of a failed comparison. this message is referenced in the current test as well
         * as globally in {@link PFT.tester.failures}
         */
        isTrue: function (value, message) {
            if (!value) {
                var m = message || "expected 'true' but was 'false'";
                m = "'" + PFT.tester.outQueue[0].name + "'\n\t" + m;
                PFT.tester.outQueue[0].failures.push(m);
                PFT.tester.outQueue[0].halt = true;
                PFT.logger.log(PFT.logger.TEST, "Assert failed - " + m);
                PFT.tester.onAssertionFailure({ test: PFT.tester.outQueue[0], message: m });
                // halt execution, but continue with other tests
                throw m;
            } else {
                PFT.tester.outQueue[0].passes++;
            }
        },

        /**
         * function to test the value of a passed in boolean is false
         * and to signal a halt to the current test if it is not.
         * function will also call {@link PFT.tester.done} so that any
         * subsequent tests can continue. triggers the {@link PFT.tester.onAssertionFailure}
         * function call if passed in value is true
         * @param {boolean} value - the boolean value to be compared to 'false'
         * @param {string} message - a message to display describing the failure in the
         * case of a failed comparison. this message is referenced in the current test as well
         * as globally in {@link PFT.tester.failures}
         */
        isFalse: function (value, message) {
            var m = message || "expected 'false' but was 'true'";
            PFT.tester.assert.isTrue(!value, message);
        },

        /**
         * function to signal a successful completion of a test and increment
         * the current number of passes by 1.
         * function will also call {@link PFT.tester.done} so that any
         * subsequent tests can continue.
         * @param {string} message - a message to display describing the pass.
         */
        pass: function (message) {
            var m = message || PFT.tester.outQueue[0].name;
            PFT.logger.log(PFT.logger.TEST, "PASS: " + m);
            PFT.tester.assert.isTrue(true, message);
            PFT.tester.done();
        },

        /**
         * function to signal a failed completion of a test and increment
         * the current number of failures by 1.
         * function will also call {@link PFT.tester.done} so that any
         * subsequent tests can continue.
         * @param {string} message - a message to display describing the pass.
         */
        fail: function (message) {
            var m = message || PFT.tester.outQueue[0].name;
            PFT.logger.log(PFT.logger.TEST, "FAIL: " + m, true);
            PFT.tester.assert.isTrue(false, message);
            PFT.tester.done();
        },
    },

    /**
     * function calls to {@link PFT.tester.assert.pass}
     */
    pass: function (message) {
        PFT.tester.assert.pass(message);
    },

    /**
     * function calls to {@link PFT.tester.assert.fail}
     */
    fail: function (message) {
        PFT.tester.assert.fail(message);
    },

    /**
     * function that will start the execution of all tests added through the
     * {@link PFT.tester.test} function. Calling this method while already
     * running has no side effects
     */
    start: function () {
        if (!PFT.tester.running) {
            PFT.tester.globalStartTime = new Date().getTime();
            PFT.tester.running = true;
            PFT.tester.executionLoop();
        }
    },

    /** @ignore */
    executionLoop: function () {
        var duration = (PFT.tester.outQueue[0] && PFT.tester.outQueue[0].maxDuration) ? PFT.tester.outQueue[0].maxDuration : PFT.tester.timeOutAfter;
        if (PFT.tester.outQueue[0] && PFT.tester.outQueue[0].startTime && (new Date().getTime() - PFT.tester.outQueue[0].startTime) >= duration) {
            var msg = "Test '" + PFT.tester.outQueue[0].name + "' exceeded timeout of " + duration;
            PFT.tester.outQueue[0].errors.push(msg);
            PFT.logger.log(PFT.logger.TEST, msg);
            PFT.tester.onTimeout({ test: PFT.tester.outQueue[0], message: msg });
            PFT.tester.done();
        }
        if (PFT.tester.inQueue.length > 0) {
            if (PFT.tester.ready && PFT.tester.running) {
                try {
                    PFT.tester.ready = false;
                    PFT.tester.outQueue.unshift(PFT.tester.inQueue.shift());
                    PFT.tester.outQueue[0].startTime = new Date().getTime();
                    if (PFT.tester.outQueue[0].type === PFT.tester.TEST) {
                        PFT.tester.outQueue[0].page = PFT.createPage();
                    }
                    PFT.tester.outQueue[0].data = PFT.tester.outQueue[0].data;
                    PFT.tester.outQueue[0].fn.call(this, PFT.tester.outQueue[0].page, PFT.tester.outQueue[0].data, PFT.tester.assert);
                } catch(e) {
                    phantom.onError(e);
                }
            }
        } else {
            if (PFT.tester.ready && PFT.tester.remainingCount < 1) {
                PFT.tester.exit();
            }
        }

        if (PFT.tester.running) {
            setTimeout(PFT.tester.executionLoop, 10);
        }
    },

    /**
     * function to be called at the end of asynchronous test, setup and tearDown.
     * This indicates that the next scheduled item can be executed. Only call this
     * function when all tasks are complete within a {@link PFT.tester.test}
     */
    done: function () {
        if (PFT.tester.outQueue[0] && PFT.tester.outQueue[0].type === PFT.tester.TEST) {
            var duration = PFT.convertMsToHumanReadable(new Date().getTime() - PFT.tester.outQueue[0].startTime);
            PFT.tester.outQueue[0].duration = duration;
            var msg = "Completed: '" + PFT.tester.outQueue[0].name + "' in " + duration + " with " + PFT.tester.outQueue[0].passes + " passes, " +
                PFT.tester.outQueue[0].failures.length + " failures, " + PFT.tester.outQueue[0].errors.length + " errors.";
            PFT.logger.log(PFT.logger.TEST, msg);
        }

        if (PFT.tester.outQueue[0].type === PFT.tester.TEST) {
            PFT.tester.remainingCount--;
            PFT.tester.outQueue[0].page.close();
            PFT.tester.onTestCompleted({ test: PFT.tester.outQueue[0] });
        }

        PFT.tester.ready = true;
    },

    /**
     * function will halt the triggering of any additional tests following
     * completion of the existing task
     */
    stop: function () {
        PFT.tester.running = false;
    },

    /** @ignore */
    exit: function () {
        PFT.tester.stop();
        var duration = PFT.convertMsToHumanReadable(new Date().getTime() - PFT.tester.globalStartTime);

        var i,
            j,
            wroteFailures = false,
            wroteErrors = false,
            passes = 0,
            failures = 0,
            errors = 0,
            failuresMsg = "",
            errorsMsg = "";
        for (i=0; i<PFT.tester.outQueue.length; i++) {
            passes += PFT.tester.outQueue[i].passes;
            failures += PFT.tester.outQueue[i].failures.length;
            errors += PFT.tester.outQueue[i].errors.length;
            for (j=0; j<PFT.tester.outQueue[i].failures.length; j++) {
                var failure = PFT.tester.outQueue[i].failures[j];
                if (!wroteFailures) {
                    wroteFailures = true;
                    failuresMsg += "\nFAILURES:\n";
                }
                failuresMsg += "\t" + failure + "\n";
            }
            for (j=0; j<PFT.tester.outQueue[i].errors.length; j++) {
                var error = PFT.tester.outQueue[i].errors[j];
                if (!wroteErrors) {
                    wroteErrors = true;
                    errorsMsg += "\nERRORS:\n";
                }
                errorsMsg += "\t" + error + "\n";
            }
        }

        var msg = "Completed '" + PFT.tester.outQueue.filter(function (i) { return i.type === PFT.tester.TEST; }).length +
            "' tests in " + duration + " with " + passes + " passes, " +
            failures + " failures, " + errors + " errors.\n";
        msg += failuresMsg;
        msg += errorsMsg;
        PFT.logger.log(PFT.logger.TEST, msg);
        PFT.tester.onExit({ message: msg });
        var exitCode = errors + failures;
        // ensure message gets out before exiting
        setTimeout(function () {
            phantom.exit(exitCode);
        }, 1000);
    },

    /**
     * function hook that is called when a new test is started
     * @param {Object} details - an object containing a 'test' property for the
     * currently started test object
     */
    onTestStarted: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when a new suite is started
     * @param {Object} details - an object containing a 'suite' property with
     * the current suite's name
     */
    onSuiteStarted: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when a test completes. this
     * includes anything resulting in {@link PFT.tester.done}
     * being called
     * @param {Object} details - an object containing a 'test' property for the
     * currently started test object
     */
    onTestCompleted: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when the underlying page
     * experiences an error
     */
    onPageError: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when there is a test error
     */
    onError: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when a test times out
     */
    onTimeout: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when an assertion fails
     * @param {Object} details - an object containing a 'test' property for the
     * currently started test object and a 'message' property for the failure
     * message
     */
    onAssertionFailure: function (details) {
        // hook for testing
    },

    /**
     * function hook that is called when program exits
     */
    onExit: function (details) {
        // hook for testing
    },
};

/**
 * This callback is executed as a test and will only be run when
 * any previous test has completed. If Setup and TearDown methods
 * are specified in the test options those will be run before and
 * after the test
 * @callback testCallback
 * @param {PhantomJs.Webpage.Page} page - a PhantomJs Page object for use in
 * testing
 * @param {Object} data - the data object passed to the {@link PFT.tester.test}
 * function
 * @param {PFT.tester.assert} assert - a convenience object for
 * accessing {@link PFT.tester.assert}
 */

// polyfill for .bind() call (not supported in PhantomJs)
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
            aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

// polyfill for .trim() call
if (!String.prototype.trim) {
  (function() {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function() {
      return this.replace(rtrim, '');
    };
  })();
}

module.exports = PFT;