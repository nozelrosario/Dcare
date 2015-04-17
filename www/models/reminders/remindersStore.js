angular.module('remindersStore.services', [])

/**
* A Patient Store service that returns reminders data.
*/
.factory('remindersStore', function ($q, $filter) {  //NR: $filter is used for MOCK, remove it if not required later
    // Will call phonegap api for storing/retriving patient data and returns a JSON array
    var enums = {
        reminderType: {
            1: { label: 'Medicine', short_label: 'Medicine', image: '', value: 1 },
            2: { label: 'Insulin', short_label: 'Insulin', image: '', value: 2 },
            3: { label: 'Dr. Appointment', short_label: 'Dr. Appointment', image: '', value: 3 },
            4: { label: 'Glucose test', short_label: 'Glucose test', image: '', value: 4 },
            5: { label: 'BP check', short_label: 'BP check', image: '', value: 5 },
            6: { label: 'Recommendation', short_label: 'Recommendation', image: '', value: 6 },
            7: { label: 'Other', short_label: 'Other', image: '', value: 7 }
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
    var notificationList = [
	                { id: 0, patientID: '1', text: 'Reminder 1', title: 'Reminder 1', notificationType: 1, startdate: '1288323623006', enddate: '1288323623006', isRecursive: true, frequencyUnit: 1, frequency: 1,  status: 'active' },
	                { id: 1, patientID: '1', text: 'Reminder 2', title: 'Reminder 2', notificationType: 3, startdate: '1289323623006', enddate: '1288323623006', isRecursive: false, frequencyUnit: null, frequency: null, status: 'active' },
	                { id: 2, patientID: '2', text: 'Reminder 3', title: 'Reminder 3', notificationType: 2, startdate: '1298323623006', enddate: '1288323623006', isRecursive: false, frequencyUnit: null, frequency: null, status: 'active' },
	                { id: 3, patientID: '4', text: 'Reminder 4', title: 'Reminder 4', notificationType: 1, startdate: '1288523623006', enddate: '1288323623006', isRecursive: true, frequencyUnit: 3, frequency: 1, status: 'active' }
	                ];

    return {
        enums: enums,
        getCount: function () {
            var deferredCount = $q.defer();

            ////NR:TODO:  Mock  ////
            var count = 4; // fire query for count
            ////NR:TODO:  Mock  ////

            deferredCount.resolve(count);
            return deferredCount.promise;
        },
        getAllnotificationsForPatient: function (patientID) {
            var deferredFetchAll = $q.defer();

            ////NR:TODO:  Mock  ////
            var allnotifications = $filter('filter')(notificationList, { patientID: patientID }, true);
            ////NR:TODO:  Mock  ////

            deferredFetchAll.resolve(allnotifications);
            return deferredFetchAll.promise;
        },
        getActivenotificationsForPatient: function (patientID) {
            var deferredFetchAll = $q.defer();

            ////NR:TODO:  Mock  ////
            var allnotifications = $filter('filter')(notificationList, { patientID: patientID, status:'active'}, true);
            ////NR:TODO:  Mock  ////

            deferredFetchAll.resolve(allnotifications);
            return deferredFetchAll.promise;
        },
        getnotificationByID: function (notificationID) {
            // Search on patients
            var deferredFetch = $q.defer();

            ////NR:TODO:  Mock  ////
            var notificationByID;
            if (notificationID && notificationID !== "") {
                notificationByID = ($filter('filter')(notificationList, { id: JSON.parse(notificationID) }, true))[0];
            } else {
                notificationByID = null;
            }
            ////NR:TODO:  Mock  ////

            deferredFetch.resolve(notificationByID);
            return deferredFetch.promise;
        },
        save: function (notification) {
            // execute deferred / return promise
            var deferredSave = $q.defer();

            if (notification) {
                if (!notification.id || notification.id <= 0) {
                    // Insert data & get the id of inserted patient along with complete inserted data

                    ////NR:TODO:  Mock  ////

                    console.log("Mock Insert : setting id=4");
                    var newnotification = notification;
                    notification.id = 4;
                    notificationList.push(newnotification);
                    ////NR:TODO:  Mock  ////

                    deferredSave.resolve(newnotification);
                } else {
                    // update data

                    console.log("Mock Update : return as it is");
                    deferredSave.resolve(notification);
                }
            } else {

                deferredSave.reject("Error Code 00001");

            }
            return deferredSave.promise;
        }

    }
});