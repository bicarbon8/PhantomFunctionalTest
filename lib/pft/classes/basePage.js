var PFT = PFT || {};

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
};

PFT.BasePage.prototype.open = function(urlParams, callback) {
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

PFT.BasePage.prototype.registerKeyElement = function (elementSelector) {
    this.keyElements.push(elementSelector);
};

PFT.BasePage.prototype.checkValidity = function(callback) {
    var selectors = this.keyElements;
    this._verify(selectors, callback);
};

PFT.BasePage.prototype._verify = function(selectors, callback) {
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

PFT.BasePage.prototype.renderPage = function(name) {
    PFT.renderPage(this.page, name);
};

PFT.BasePage.prototype.waitFor = function(selector, callback, maxMsWait) {
    PFT.debug("waiting for: '"+selector+"' or until "+maxMsWait+"ms has passed.");
    var expiry = new Date().getTime() + 10000; // default to 10 seconds from now
    if (maxMsWait && typeof maxMsWait === "number") {
        expiry = new Date().getTime() + maxMsWait;
    }
    
    return this.waitUntil(selector, callback, expiry);
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

PFT.BasePage.prototype.exists = function(selector) {
    PFT.debug("checking for: '"+selector+"' on page.");
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
    var pos = this.eval(function(s) { return document.querySelector(s).getBoundingClientRect(); }, selector.toString());
    if (pos && (pos.left !== undefined || pos.left !== null) && (pos.top !== undefined || pos.top !== null)) {
        PFT.debug("found '"+selector+"' at position: "+JSON.stringify(pos));
        return pos;
    } else {
        throw "element could not be located on the page. pos: "+JSON.stringify(pos);
    }
};

PFT.BasePage.prototype.click = function(selector) {
    PFT.debug("clicking on: '"+selector+"'...");
    var pos = this.elementPosition(selector);
    PFT.debug("using javascript click...");
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

PFT.BasePage.prototype.getAttribute = function(selector, attribute) {
    PFT.debug("returning href value for: '"+selector+"'...");
    return this.eval(function(s, a) { return document.querySelector(s).getAttribute(a); }, selector.toString(), attribute);
};

PFT.BasePage.prototype.sendKeys = function(selector, value, callback) {
    try {
        if(value) {
            var character = value.substring(0,1);
            PFT.trace("appending value of '" + character + "' to: '" + selector + "'");
            value = value.substring(1, value.length);
            this.eval(function(s) {
                var evt;
                function fireEvent(element, event) {
                    if (document.createEventObject) {
                        // dispatch for IE
                        evt = document.createEventObject();
                        return element.fireEvent('on'+event, evt);
                    } else if(document.createEvent) {
                        // dispatch for firefox + others
                        evt = document.createEvent("HTMLEvents");
                        evt.initEvent(event, true, true); // event type, bubbling, cancelable
                        return !element.dispatchEvent(evt);
                    } else {
                        // use for new browsers
                        evt = new Event(event);
                        return element.dispatchEvent(evt);
                    }
                }
                var el = document.querySelector(s.sel);
                el.value = el.value+s.ch;
                fireEvent(el, 'keydown');
                fireEvent(el, 'keyup');
                fireEvent(el, 'focus');
            }, { "sel": selector, "ch": character });
            this.page.sendEvent('keyup', character);

            if(value.length > 0) {
                setTimeout(function afterSendKey() {
                    this.sendKeys(selector, value, callback);
                }.bind(this), 25);
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
        this.eval(function(s) { document.querySelector(s).checked=true; }, selector.toString());
    } else {
        this.eval(function(s) { document.querySelector(s).checked=false; }, selector.toString());
    }
};

PFT.BasePage.prototype.eval = function() {
    if (arguments && arguments.length > 0) {
        PFT.debug("evaluating '"+arguments[0]+"' in page...");
        return this.page.evaluate.apply(this.page, arguments);
    }
};

PFT.BasePage.prototype.extend = function(module) {
    for (var k in module) {
        if (module.hasOwnProperty(k)) {
            this[k] = module[k];
        }
    }
};