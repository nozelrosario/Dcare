//Application Namespaces for Classes & Singletons
app = function () {
    return {
        id: {
            ios: "",
            android: "com.google.android.gm",
            windows: ""
        },
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
            isFirstDashboardView: false,
            confirmOnExit: false,
            toastAutoCloseDelay: 2000,   //ms
            syncedDataStores: ['glucose', 'meals', 'medications', 'notifications', 'patients', 'reminders', 'vitals'],
            syncTimeout: 600000,          // ms [10min]
            syncInterval: 600000,          // ms [10min]
            syncURI: 'http://localhost:5050/dbProxy',
            apiBaseURL: 'http://localhost:5050/',
            syncOptions: { live:false, retry:false, timeout: 500000, batch_size: 100, batches_limit:10 }
        },
        info: {
            developers: ['nozelrosario@gmail.com'],
            shortInfo: 'D-Care (Diabetese Management App)',
            appStoreLink: {
                ios: "itms-apps://itunes.apple.com/us/app/D-Care-APP-SLUG-URL/id1111111111111?mt=8&uo=4",
                android: "market://details?id=com.google.android.gm&hl=en",
                windows: ""
            }
        },
        context: {
            defaultDataAdapter: 'pouchDB',
            dbAuthCookie: '',
            clusterID: '',
            getCurrentCluster: function () {
                return app.context.clusterID;
            },
            setCurrentCluster: function (clusterID) {
                app.context.clusterID = clusterID;
            },
            forceSync: true
        }
    };
}();

// Javascript Class Manager
var Module = JS.require('JS.Module').Module;
var Class = JS.require('JS.Class').Class;
var Singleton = JS.require('JS.Singleton').Singleton;







