angular.module('dCare.Services.NotificationService', [])

.factory("NotificationService", function ($q, $injector) {
    // difference between Notification & reminder is , reminders will not be deleted, ?Notification will be detelted upon due datetime
    // bind the trigger event of notification to checke if the notification is out of end date and to reschedule based on reminder ID
    
    var isNotificationServiceAvailable = function () {
        if ((typeof cordova !== "undefined") && cordova.plugins.notification) {   //NR:Re-think can use ionic.Platform.platform()
            return true;
        } else {
            app.log.error("Notification Support Unavailable. Application will not be able to show native Notifications");
            return false;
        }
    };

    var scheduleNotification = function (notificationConfig) {
        var deferredSchedule = $q.defer();
        if (isNotificationServiceAvailable()) {
            var notificationSuccess = function () {
                app.log.info("Done adding Notification via. Cordova plugin");
            };
            notificationPermissionCheck().then(function (permisionExists) {
                if (!permisionExists) {
                    // if Not exists, then request for it
                    requestNotificationPermission().then(function (permissionGranted) {
                        // Permission Granted
                        // check if notification already present [Create else Update]
                        cordova.plugins.notification.local.isPresent(id, function (notificationPresent) {
                            if (notificationPresent) {
                                cordova.plugins.notification.local.update(notificationConfig, notificationSuccess);
                            } else {
                                cordova.plugins.notification.local.schedule(notificationConfig, notificationSuccess);
                            }
                        });

                        deferredSchedule.resolve();
                    }).catch(function (permissionGranted) {
                        // Permission Rejected
                        var err = "Notification Permission does not exists. Application will not be able to show Notifications";
                        app.log.error(err);
                        deferredSchedule.reject(err);
                    });
                } else {
                    // Permission already Exists
                    cordova.plugins.notification.local.schedule(notificationConfig, notificationSuccess);
                    deferredSchedule.resolve();
                }
            });
        } else {
            // Notification Support Unavailable
            deferredSchedule.reject();
        }
        return deferredSchedule.promise;
    };

    var removeNotification = function (notificationID) {
        var deferredCancel = $q.defer();
        if (isNotificationServiceAvailable()) {
            if (notificationID > 0) {
                cordova.plugins.notification.local.isPresent(notificationID, function (exists) {
                    if (exists) {
                        cordova.plugins.notification.local.cancel(notificationID, function () {
                            deferredCancel.resolve();
                        });
                    } else {
                        app.log.warn("Notification doesnot exist");
                        deferredCancel.resolve();
                    }
                });
            } else {
                app.log.error("Error while removing notification, notificationID cannot be empty!!");
                deferredCancel.reject();
            }
        } else {
            // Notification Support Unavailable
            deferredCancel.reject();
        }
        return deferredCancel.promise;
    };

    var reScheduleIfRecurringNotification = function (notification) {
        // NR: Injecting Notification Store explicitly, as injecting at init causes Circular dependency issue.
        //     Following the Service Locator pattern of Angular
        var NotificationsStore = $injector.get('NotificationsStore');  
        // Mark current notification expired and save
        NotificationsStore.save(angular.extend({}, notification, { status: "expired" }));
        // Check for Recursive notifications
        var nextOccuringNotification = NotificationsStore.computeNextRecurringNotification(notification);
        if (nextOccuringNotification) {
            // If recurring notification exists, then push notification to Notification Store => which in turn will add a local notification
            NotificationsStore.save(nextOccuringNotification);
        }
    };

    //NR: Add a service Listener. Try Re-Shedule notification when triggered
    if (isNotificationServiceAvailable()) {
        cordova.plugins.notification.local.on('trigger', function (notification) {
            reScheduleIfRecurringNotification(notification.data);
        });
    }

    var notificationPermissionCheck = function () {
        var deferredCheck = $q.defer();
        cordova.plugins.notification.local.hasPermission(function (permissionExists) {
                deferredCheck.resolve(permissionExists);
        });
        return deferredCheck.promise;
    };

    var requestNotificationPermission = function () {
        var deferredCheck = $q.defer();
        cordova.plugins.notification.local.registerPermission(function (permissionGranted) {
            if (permissionGranted) {
                deferredCheck.resolve(true);
            } else {
                deferredCheck.reject(false);
            }
        });
        return deferredCheck.promise;
    };

    return {
        /* Checks if native Notification Service available */
        isNotificationServiceAvailable: isNotificationServiceAvailable,

        /* Schedules a Notification
        * @params: notificationConfig {object} : object.id - id for notification [blank for new & Int for edit]
        *                                       object.text - text for notification
        *                                       object.title - title for notification
        *                                       object.every - The interval at which to reschedule the local notification. That can be a value of second, minute, hour, day, week, month or year
        *                                       object.date - date at which the nitification should trigger [If the specified value is nil or is a date in the past, the local notification is delivered immediately.]
        *                                       object.data - data associated with the notification
        */
        scheduleNotification: scheduleNotification,
        /* Removes a Notiication
        * @params: notificationID {number}  : unique ID of notification to be removed
        */
        removeNotification: removeNotification
    };
});