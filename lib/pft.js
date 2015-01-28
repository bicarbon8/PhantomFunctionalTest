/** @namespace */
var PFT = {};

/**
 * property specifying the delay between retries when waiting
 * for selectors to be displayed
 */
PFT.POLLING_INTERVAL = 1000; // 1 second

/**
 * property used as a default wait timeout in the 'PFT.tester' module
 */
PFT.DEFAULT_TIMEOUT = 60000; // 1 minute

/**
 * property defining the base directory used with 'PFT.renderPage' and
 * 'PFT.BasePage.renderPage' calls
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
        viewport = {
            width: 1024,
            height: 800
        };
    }
    PFT.debug("setting viewport to: " + JSON.stringify(viewport));
    page.viewportSize = viewport;
    if (headers) {
        PFT.debug("setting headers to: " + JSON.stringify(headers));
        for (var i=0; i<headers.length; i++) {
            var header = headers[i];
            page = PFT.addHeader(page, header.name, header.value);
        }
    }

    return page;
};

/**
 * function will add headers to the passed in 'PhantomJs.Webpage.Page'
 * object or overwrite them if they already exist
 * @param {PhantomJs.Webpage.Page} page - the Page object to set headers
 * on
 * @param {string} name - the name of the header such as "Accept-Language"
 * @param {string} value - the value of the header such as "en-US"
 * @returns {PhantomJs.Webpage.Page} the Page object with headers updated
 */
PFT.addHeader = function(page, name, value) {
    var headers = page.customHeaders;
    if(!headers) {
        headers = {};
    }
    headers[name] = value;
    page.customHeaders = headers;
    return page;
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
        page.render(name, { quality: '50' });
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
    var msgStack = [msg];
    if (trace && trace.length) {
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
        });
    }
    msg = msgStack.join('\n');

    // only exit on unexpected errors
    if (PFT.tester.running && PFT.tester.outQueue.length > 0 && PFT.tester.outQueue[0].halt) {
        // halt current test and go to next
        PFT.tester.outQueue[0].errors.push(msg);
        PFT.tester.done();
    } else {
        // exit immediately
        PFT.logger.log(PFT.logger.ERROR, msg, false);
        PFT.tester.onError({ message: msg });

        phantom.exit(1);
    }
};
