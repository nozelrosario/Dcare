//Application Namespaces for Classes & Singletons
app = function () {
    return {
        id: 'com.google.android.gm',
        classes: {
            data: {
                adapters: {},
                eventTriggers: {}
            }
        },
        LOGGING_LEVEL: "all",               //NR: possible values : ["off", "all", "trace", "debug", "info", "warn", "error", "fatal"]
        LOG_APPENDER: new log4javascript.BrowserConsoleAppender(),   //NR: Can use other Appenders when needed
        log: null,                           //NR: Holds the instance of log writer
        config: {                            //NR: Can be used to hold app wide shared data/preferenced.
            isFirstDashboardView: false
        },
        info: {
            developers: ['nozelrosario@gmail.com'],
            shortInfo: 'D-Care (Diabetese Management App)',
            appStoreLink: {
                ios: "itms-apps://itunes.apple.com/us/app/D-Care-APP-SLUG-URL/id1111111111111?mt=8&uo=4",
                android: "market://details?id=com.google.android.gm&hl=en",
                windows: ""
            }
        }
    };
}();

// Javascript Class Manager
var Module = JS.require('JS.Module').Module;
var Class = JS.require('JS.Class').Class;
var Singleton = JS.require('JS.Singleton').Singleton;







