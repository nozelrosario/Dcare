var logger = log4javascript.getLogger("D-care");
var appender = new log4javascript.BrowserConsoleAppender();
logger.addAppender(appender);
logger.debug("Initialized LogForJS Logging..");