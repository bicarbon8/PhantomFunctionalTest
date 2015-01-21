var PFT = PFT || {};

PFT.phantomMock = {
	injectJs: function(script) {
		var s = document.createElement('script');
		s.setAttribute('src', script);
		document.head.appendChild(s);
	},
	exit: function() {
		// do nothing
	},
	cookies: [],
	mock: true,
	updatePhantomCookies: function (frame) {
		try {
			var cookiesStrs = frame.contentDocument.cookie.split(/[\s]*;[\s]*/);
			var cookies = [];
			cookiesStrs.forEach(function(cookieStr) {
				var cookie = {
					name: cookieStr.substring(0, cookieStr.indexOf('=')),
					value: cookieStr.substring(cookieStr.indexOf('=')+1, cookieStr.length)
				};
				cookies.push(cookie);
			});
			phantom.cookies = cookies;
			// console.log("PHANTOM COOKIES: "+JSON.stringify(phantom.cookies));
		} catch (e) {
			PFT.warn("could not update phantom cookies due to: " + e);
		}
	},
	deleteCookie: function (cookie_name, frame)
	{
		try {
			// console.log("DELETING COOKIE: "+cookie_name);
			var cookie_date = new Date();  // current date & time
			cookie_date.setTime(cookie_date.getTime() - 1);
			frame.contentDocument.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
			document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
		} catch (e) {
			PFT.warn("could not delete phantom cookies due to: " + e);
		}
	}
};

PFT.phantom = phantom || PFT.phantomMock;