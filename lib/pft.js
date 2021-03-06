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
 * @property {boolean} [PFT.IGNORE_PAGE_ERRORS=false] - by default all page
 * errors (script errors on the page) will result in an error and halting of
 * current processing. if set to true these will be ignored
 */
PFT.IGNORE_PAGE_ERRORS = false;

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
    if (PFT.tester._tests.length > 0) {
        PFT.tester.handleError(msg);
    } else {
        // exit immediately
        MutexJs._reset();
        PFT.logger.log(PFT.logger.ERROR, msg, false);

        phantom.exit(1);
    }
};
