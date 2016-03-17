var exec = require('cordova/exec');

var heartbeat = {};

heartbeat.take = function (options, successCallback, errorCallback) {
    var args = new Array();
    args.push(options.seconds ? options.seconds : 10);
    args.push(options.fps ? options.fps : 30);
	exec(successCallback, errorCallback, "HeartBeat", "take", args);
};

module.exports = heartbeat;
