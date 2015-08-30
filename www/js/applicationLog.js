app.log = log4javascript.getLogger("D-care");

switch (app.LOGGING_LEVEL) {
    case "off":
        app.log.setLevel(log4javascript.Level.OFF);
        console.log("Application Logging is OFF");
        break;
    case "all":
        app.log.setLevel(log4javascript.Level.ALL);
        app.log.addAppender(app.LOG_APPENDER);        
        break;
    case "trace":
        app.log.setLevel(log4javascript.Level.TRACE);
        app.log.addAppender(app.LOG_APPENDER);
        break;
    case "debug":
        app.log.setLevel(log4javascript.Level.DEBUG);
        app.log.addAppender(app.LOG_APPENDER);
        break;
    case "info":
        app.log.setLevel(log4javascript.Level.INFO);
        app.log.addAppender(app.LOG_APPENDER);
        break;
    case "warn":
        app.log.setLevel(log4javascript.Level.WARN);
        app.log.addAppender(app.LOG_APPENDER);
        break;
    case "error":
        app.log.setLevel(log4javascript.Level.ERROR);
        app.log.addAppender(app.LOG_APPENDER);
        break;
    case "fatal":
        app.log.setLevel(log4javascript.Level.FATAL);
        app.log.addAppender(app.LOG_APPENDER);
        break;
}
app.log.info("Initialized Application Logging : Logging Level set to " + app.log.getLevel().name);


