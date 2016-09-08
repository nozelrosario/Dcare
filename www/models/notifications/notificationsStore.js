angular.module('dCare.Services.NotificationsStore', ['dCare.Services.NotificationService'])

/**
* A Patient Store service that returns notification data.
*/
.factory('NotificationsStore', function ($q, $filter, NotificationService) {  //NR: $filter is used for MOCK, remove it if not required later
    // Will call phonegap api for storing/retriving patient data and returns a JSON array
    var notificationsDataStore = new DataStoreFactory({
        dataStoreName: 'Notifications',
        dataAdapter: 'pouchDB',
        adapterConfig: { auto_compaction: true }
    });  // Initialize Reminders  DataStore

    //var NotificationService = $injector.get('NotificationService');

    var enums = {
        notificationType: {
            1: { label: 'Medicine', short_label: 'Medicine', image: 'img/medicines-reminder.png', value: 1 },
            2: { label: 'Insulin', short_label: 'Insulin', image: 'img/syringe.png', value: 2 },
            3: { label: 'Dr. Appointment', short_label: 'Dr. Appointment', image: 'img/doctor-app.png', value: 3 },
            4: { label: 'Glucose test', short_label: 'Glucose test', image: 'img/glucose.png', value: 4 },
            5: { label: 'BP check', short_label: 'BP check', image: 'img/blood-pressure-gauge.png', value: 5 },
            6: { label: 'Recommendation', short_label: 'Recommendation', image: 'img/alerts-recommendations.png', value: 6 },
            7: { label: 'Other', short_label: 'Other', image: 'img/other.png', value: 7 }
        },
        frequencyUnit: {
            1: { label: 'Year', short_label: 'Yearly', image: '', value: 1 },
            2: { label: 'Month', short_label: 'Monthly', image: '', value: 2 },
            3: { label: 'Week', short_label: 'Weekly', image: '', value: 3 },
            4: { label: 'Hour', short_label: 'Hourly', image: '', value: 4 },
            5: { label: 'Minutes', short_label: 'Minutes', image: '', value: 5 }
        }
    };
    // Some fake testing data
    //var notificationList = [
    //                { id: 0, patientID: '1', text: 'Notification 1', title: 'Notification 1', notificationType: 1, startdate: '1288323623006', duedate: '1288523623006', enddate: '1288323623006', frequencyUnit: 1, frequency: 1, status: 'active' data: "some Data" reminderID:3},
    //                { id: 1, patientID: '1', text: 'Notification 2', title: 'Notification 2', notificationType: 3, startdate: '1289323623006', duedate: '1288523623006', enddate: '1288323623006', frequencyUnit: null, frequency: null, status: 'expired' data: "some Data" reminderID:3},
    //                { id: 2, patientID: '2', text: 'Notification 3', title: 'Notification 3', notificationType: 2, startdate: '1298323623006', duedate: '1288523623006', enddate: '1288323623006', frequencyUnit: null, frequency: null, status: 'expired' data: "some Data" reminderID:3},
    //                { id: 3, patientID: '4', text: 'Notification 4', title: 'Notification 4', notificationType: 1, startdate: '1288523623006', duedate: '1288523623006', enddate: '1288323623006', frequencyUnit: 1, frequency: 1, status: 'active' data: "some Data" reminderID:3}
	//                ];

    var scheduleNativeNotification = function (notification) {
        var deferredScheduleNotification = $q.defer();
        //if (NotificationService.isNotificationServiceAvailable()) {
            var nativeNotificationCofig = {
                id: notification.id,
                text: notification.text,
                title: notification.title,
                data: notification
            };

            if (notification.frequencyUnit) {
                delete nativeNotificationCofig.at;
                nativeNotificationCofig.firstAt = new Date(notification.startdate);
                switch (notification.frequencyUnit) {
                    case 1: //Yearly
                        nativeNotificationCofig.every = "year";
                        break;
                    case 2: //Monthly
                        nativeNotificationCofig.every = "month";
                        break;
                    case 3: //Weekly
                        nativeNotificationCofig.every = "week";
                        break;
                    case 4: //Hourly
                        nativeNotificationCofig.every = "hour";
                        break;
                    case 5: //Minute
                        nativeNotificationCofig.every = "minute";
                        break;
                        // 'day' & 'second' also possible
                }
            } else {
                delete nativeNotificationCofig.firstAt;
                nativeNotificationCofig.at = new Date(notification.startdate);
            }
            if (notification.notificationType && (enums.notificationType[notification.notificationType]).image) {
                nativeNotificationCofig.icon = "file://" + (enums.notificationType[notification.notificationType]).image
            }


        NotificationService.scheduleNotification(nativeNotificationCofig).then(function () {
                deferredScheduleNotification.resolve(notification);
            }).catch(function (err) {                   // NR: Catch corresponds to relative $q promise of angular. Hence Required.
                deferredScheduleNotification.reject(err);
            });
        //} else {
        //    deferredScheduleNotification.reject("Notification Service Unavailable!!");
        //}
        return deferredScheduleNotification.promise;
    };

    return {
        enums: enums,
        init: function () {
            var deferredInit = $q.defer();
            if (notificationsDataStore.getClusteredDataStore()) {
                deferredInit.resolve();
            } else {
                deferredInit.reject();
            }
            return deferredInit.promise;
        },
        getCount: function (patientID) {
            return notificationsDataStore.getClusteredDataStore().search({
                select: 'count(id)',
                where: "patientID = " + patientID
            });
        },
        getAllNotificationsForPatient: function (patientID) {
            return notificationsDataStore.getClusteredDataStore().search({
                select: '*',
                where: "patientID=" + patientID + ""
            });
        },
        getActiveNotificationsForPatient: function (patientID) {
            return notificationsDataStore.getClusteredDataStore().search({
                select: '*',
                where: "patientID=" + patientID + " and status= 'active'" + "and ((startdate >= " + castToLongDate(new Date()) + ") or (frequency>0 and (enddate >=" + castToLongDate(new Date()) + " or enddate='')))"
            });
        },
        getNotificationForReminder: function (reminderID) {
            return notificationsDataStore.getClusteredDataStore().search({
                select: '*',
                where: "status= 'active' and reminderID=" + reminderID + ""
            });
        },
        getNotificationByID: function (notificationID) {
            return notificationsDataStore.getClusteredDataStore().getDataByID(notificationID);
        },
        remove: function (notificationID) {
            // Just delete the notification & its native counter-part
            var deferredDelete = $q.defer();
            var me = this; 
            this.getNotificationByID(notificationID).then(function (notificationToBeDeleted) {
                if (notificationToBeDeleted && notificationToBeDeleted.id > 0) {
                    notificationsDataStore.getClusteredDataStore().remove(notificationToBeDeleted.id).then(function () {     // Delete current notification from data store
                            if (NotificationService.isNotificationServiceAvailable()) {                     // Delete native counter-part
                                NotificationService.removeNotification(notificationToBeDeleted.id);
                            }
                            deferredDelete.resolve();
                        }).fail(function (err) {
                            app.log.error("Could not delete notification." + " [Error: " + err + "]");
                            deferredDelete.reject(err);
                        });
                } else {
                    app.log.error("Could not find notification with ID: " + notificationID);
                    deferredDelete.resolve();
                }
            }).fail(function (err) {
                deferredDelete.reject(err);
            });
            return deferredDelete.promise;
        },
        save: function (notification) {
            var deferredSave = $q.defer();
            if (notification.status && notification.status === "expired") {
                notificationsDataStore.getClusteredDataStore().save(notification).then(function (notificationSavedData) {
                    if (notificationSavedData.id > 0) {
                        if (NotificationService.isNotificationServiceAvailable()) {                     // Delete native counter-part
                            NotificationService.removeNotification(notificationSavedData.id);
                        }
                    }
                    deferredSave.resolve(notificationSavedData);
                }).fail(function (err) {
                    deferredSave.reject(err);
                });
            } else {
                notification.status = "active";
                notificationsDataStore.getClusteredDataStore().save(notification).then(function (notificationSavedData) {
                        scheduleNativeNotification(notificationSavedData).then(function () {                // Add a native counter-part
                        deferredSave.resolve(notificationSavedData);
                    }).catch(function (err) {                        
                        deferredSave.resolve(notificationSavedData);
                    });
                }).fail(function (err) {
                    deferredSave.reject(err);
                });
            }           

            return deferredSave.promise;
        }
    }
});