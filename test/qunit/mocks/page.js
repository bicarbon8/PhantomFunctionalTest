var PageMock = function (id) {
	this.url = "";
	this.viewportSize = {};
	this.id = id;

	this.viewportSize = { width: "200", height: "100" };
    this.customHeaders = null;

	this.frame = null;
	this.urlBar = null;
	this.br = null;
};

PageMock.prototype.open = function(url, callback) {
	this.url = url;
    callback.call(this, "success");
};

PageMock.prototype.clearCookies = function() {
	// delete cookies
	try {
		var cookies = this.frame.contentDocument.cookie;
		var cookiesArray = cookies.split(/[\s]*;[\s]*/);
		for (var i in cookiesArray) {
			var cookie = cookiesArray[i];
			if (cookie && cookie.length > 0 && this.frame) {
				phantom.deleteCookie(cookie.substring(0, cookie.indexOf('=')), this.frame);
			}
		}
		phantom.updatePhantomCookies(this.frame);
	} catch (e) {
		error("call to pageMock.clearCookies failed due to: " + e);
	}
};

PageMock.prototype.includeJs = function(script) {
	// do nothing
};

PageMock.prototype.evaluate = function(javascript, value) {
	// remove the "function (s) { " and " }" wrapping the code and replace 'document' with 'iframe.contentDocument'
	var scriptStr = javascript.toString()
		.replace(/function[\s]*\(s\)[\s]*\{[\s]*/, '')
		.replace(/[\s]*\}$/, '')
		.replace(/document./g, 'document.querySelector("#'+this.id.toString()+'").contentDocument.');
    /* jshint evil:true */
    var result = new Function("s", scriptStr).call(window, value);
	phantom.updatePhantomCookies(this.frame);
	return result;
};

PageMock.prototype.sendEvent = function(eventType, posLeft, posTop, button) {
	// do nothing
};

PageMock.prototype.render = function(name, options) {
	// not supported when running in browser
};

PageMock.prototype.close = function() {
	this.url = "";
	this.viewportSize = {};
};

PageMock.prototype.goBack = function () {
	if (this.frame.contentWindow.history.length > 2) {
		this.frame.contentWindow.history.back();
	}
};

PageMock.prototype.onLoadFinished = function (status) {
	// called after page loads. override with desired functionality
};

COUNT = 0;
webpageMock = {
	create: function() {
		COUNT++;
		return new PageMock('iframe' + COUNT.toString());
	}
};

var webpage = webpageMock;
