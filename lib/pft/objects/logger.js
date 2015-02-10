/** @ignore **/
var PFT_THREAD_ID = PFT_THREAD_ID || ''; // used for parallel execution

/**
 * @namespace PFT.logger
 * @memberof PFT
 */
PFT.logger = {
    /**
     * @property {string} [logLevel="info"] - the minimum level of logging to
     * output
     */
    logLevel: require('system').env.log_level || "info",

    /** @ignore */
    UNKNOWN: -1, // never show

    /**
     * @property {number} TRACE=0 - an enum used to indicate that the current
     * message is very low criticality. this should be reserved for highly
     * detailed debugging
     */
    TRACE: 0,

    /**
     * @property {number} DEBUG=1 - representing a low criticality level of logging.
     * this should be reserved for debugging
     */
    DEBUG: 1,

    /**
     * @property {number} INFO=1 - representing the normal criticality level of logging.
     * this should be reserved for helpful state change information
     */
    INFO: 2,

    /**
     * @property {number} WARN=1 - representing the moderate criticality level of logging.
     * this should be reserved for potentially problematic state changes
     */
    WARN: 3,

    /**
     * @property {number} ERROR=1 - representing the maximum criticality level of logging.
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
