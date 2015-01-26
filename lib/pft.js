var PFT = {};

PFT.POLLING_INTERVAL = 1000; // 1 second
PFT.DEFAULT_TIMEOUT = 60000; // 1 minute
PFT.IMAGES_DIR = './img/';

PFT.createPage = function(viewport, headers) {
    PFT.debug("generating new page...");
    var page = null;
    page = PFT.webpage.create();
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
    
    if (PFT.tester.running && PFT.tester.current) {
        PFT.tester.current.page = page;
    }
    return page;
};

PFT.addHeader = function(page, name, value) {
    var headers = page.customHeaders;
    if(!headers) {
        headers = {};
    }
    headers[name] = value;
    page.customHeaders = headers;
    return page;
};

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

PFT.trace = function(message) {
    PFT.Logger.log(PFT.Logger.TRACE, message);
};

PFT.debug = function(message) {
    PFT.Logger.log(PFT.Logger.DEBUG, message);
};

PFT.info = function(message) {
    PFT.Logger.log(PFT.Logger.INFO, message);
};

PFT.warn = function(message) {
    PFT.Logger.log(PFT.Logger.WARN, message);
};

PFT.error = function(message, page) {
    PFT.Logger.log(PFT.Logger.ERROR, message, true);
    if (page) {
        page.renderPage();
    }
};

PFT.guid = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4();
};

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

phantom.onError = function(msg, trace) {
    // only exit on unexpected errors
    if (!(PFT.tester.running && PFT.tester.current && PFT.tester.current.halt)) {
        // if any exceptions make it past the page handle them here
        // capture errors and log
        var msgStack = [msg];
        if (trace && trace.length) {
            trace.forEach(function(t) {
                msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
            });
        }
        PFT.Logger.log(PFT.Logger.ERROR, msgStack.join('\n'), false);
        PFT.tester.onError({ message: msgStack.join('\n') });
        
        phantom.exit(1);
    }
};