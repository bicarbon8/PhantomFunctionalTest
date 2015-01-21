var PFT = PFT || {};

PFT.PageMock = function (id) {
	this.url = "";
	this.viewportSize = {};
	this.id = id;

	this.viewportSize = { width: "200", height: "100" };

	this.frame = null;
	this.urlBar = null;
	this.br = null;
};

PFT.PageMock.prototype.open = function(url, callback) {
	this.url = url;
	if (!this.urlBar) {
		this.urlBar = document.createElement('div');
		this.urlBar.style.width = this.viewportSize.width + "px";
		this.urlBar.style.border = "solid 1px black";
		this.urlBar.id = "url" + this.id;
		this.urlBar.innerHTML = url;
		document.body.appendChild(this.urlBar);
		this.br = document.createElement('br');
		document.body.appendChild(this.br);
	}
	if(!this.frame) {
		this.frame = document.createElement('iframe');
		this.frame.width = this.viewportSize.width+"px";
		this.frame.height = this.viewportSize.height+"px";
		document.body.appendChild(this.frame);
		this.frame.id = this.id;
	}
	this.frame.onload = function() {
		this.onLoadFinished("success");
		PFT.phantom.updatePhantomCookies(this.frame);
		this.frame.onload = function () {
			this.onLoadFinished("success");
			this.urlBar.innerHTML = this.frame.contentWindow.location.href;
		}.bind(this);
		this.urlBar.innerHTML = this.frame.contentWindow.location.href;
		callback("success");
	}.bind(this);
	this.frame.src = this.url;
};

PFT.PageMock.prototype.clearCookies = function() {
	// delete cookies
	try {
		var cookies = this.frame.contentDocument.cookie;
		var cookiesArray = cookies.split(/[\s]*;[\s]*/)
		for (var i in cookiesArray) {
			var cookie = cookiesArray[i];
			if (cookie && cookie.length > 0 && this.frame) {
				PFT.phantom.deleteCookie(cookie.substring(0, cookie.indexOf('=')), this.frame);
			}
		}
		PFT.phantom.updatePhantomCookies(this.frame);
	} catch (e) {
		PFT.error("call to pageMock.clearCookies failed due to: " + e);
	}
};

PFT.PageMock.prototype.includeJs = function(script) {
	// do nothing
};

PFT.PageMock.prototype.evaluate = function(javascript, value) {
	// remove the "function (s) { " and " }" wrapping the code and replace 'document' with 'iframe.contentDocument'
	var scriptStr = javascript.toString()
		.replace(/function[\s]*\(s\)[\s]*\{[\s]*/, '')
		.replace(/[\s]*\}$/, '')
		.replace(/document./g, 'document.querySelector("#'+this.id.toString()+'").contentDocument.');
	var result = new Function("s", scriptStr).call(window, value);
	PFT.phantom.updatePhantomCookies(this.frame);
	return result;
};

PFT.PageMock.prototype.sendEvent = function(eventType, posLeft, posTop, button) {
	// do nothing
};

PFT.PageMock.prototype.render = function(name, options) {
	// not supported when running in browser
};

PFT.PageMock.prototype.close = function() {
	this.url = "";
	this.viewportSize = {};
	document.body.removeChild(this.frame);
	document.body.removeChild(this.urlBar);
	document.body.removeChild(this.br);
	this.frame = null;
	this.urlBar = null;
	this.br = null;
};

PFT.PageMock.prototype.goBack = function () {
	if (this.frame.contentWindow.history.length > 2) {
		this.frame.contentWindow.history.back();
	}
};

PFT.PageMock.prototype.onLoadFinished = function (status) {
	// called after page loads. override with desired functionality
};

PFT.COUNT = 0;
PFT.webpageMock = {
	create: function() {
		PFT.COUNT++;
		return new PageMock('iframe' + PFT.COUNT.toString());
	}
};

PFT.webpage = require('webpage') || PFT.webpageMock;