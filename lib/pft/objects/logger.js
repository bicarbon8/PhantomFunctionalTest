var PFT = PFT || {};

PFT.Logger = {
    logLevel: PFT.system.env["log_level"] || "info",
    UNKNOWN: -1, // never show
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5,
    TEST: 100, // always show

    getLogLevelInt: function (levelStr) {
        switch (levelStr.toLowerCase()) {
            case "trace":
                return PFT.Logger.TRACE;
            case "debug":
                return PFT.Logger.DEBUG;
            case "info":
                return PFT.Logger.INFO;
            case "warn":
                return PFT.Logger.WARN;
            case "error":
                return PFT.Logger.ERROR;
            case "fatal":
                return PFT.Logger.FATAL;
            case "qunit":
                return PFT.Logger.TEST;
            default:
                return PFT.Logger.UNKNOWN;
        }
    },

    getLogLevelStr: function (levelInt) {
        switch (levelInt) {
            case PFT.Logger.TRACE:
                return "TRACE";
            case PFT.Logger.DEBUG:
                return "DEBUG";
            case PFT.Logger.INFO:
                return "INFO";
            case PFT.Logger.WARN:
                return "WARN";
            case PFT.Logger.ERROR:
                return "ERROR";
            case PFT.Logger.FATAL:
                return "FATAL";
            case PFT.Logger.TEST:
                return "TEST";
            default:
                return "UNKNOWN";
        }
    },

    log: function(levelInt, message, includeStackTrace) {
        if (levelInt >= PFT.Logger.getLogLevelInt(PFT.Logger.logLevel)) {
            if (includeStackTrace) {
                message += "\n" + PFT.Logger._getStackTrace();
            }
            var msg = PFT.Logger.getLogLevelStr(levelInt) + ": " + message;
            switch (levelInt) {
                case PFT.Logger.FATAL:
                case PFT.Logger.ERROR:
                    console.error(msg);
                    break;
                case PFT.Logger.WARN:
                    console.warn(msg);
                    break;
                default:
                    console.log(msg);
            }
        }
    },

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
