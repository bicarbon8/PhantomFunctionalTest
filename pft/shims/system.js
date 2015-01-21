var PFT = PFT || {};

PFT.systemMock = {
	env: [],
	mock: true
};

PFT.system = require('system') || PFT.systemMock;