angular.module('remindersStore.services', [])

/**
* A Patient Store service that returns reminders data.
*/
.factory('RemindersStore', function ($q, $filter) {  //NR: $filter is used for MOCK, remove it if not required later
    // Will call phonegap api for storing/retriving patient data and returns a JSON array
    var enums = {
        reminderType: {
            1: { label: 'Medicine', short_label: 'Medicine', image: 'img/no-image.png', value: 1 },
            2: { label: 'Insulin', short_label: 'Insulin', image: 'img/no-image.png', value: 2 },
            3: { label: 'Dr. Appointment', short_label: 'Dr. Appointment', image: 'img/no-image.png', value: 3 },
            4: { label: 'Glucose test', short_label: 'Glucose test', image: 'img/no-image.png', value: 4 },
            5: { label: 'BP check', short_label: 'BP check', image: 'img/no-image.png', value: 5 },
            6: { label: 'Recommendation', short_label: 'Recommendation', image: 'img/no-image.png', value: 6 },
            7: { label: 'Other', short_label: 'Other', image: 'img/no-image.png', value: 7 }
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
    var remindersList = [
	                { id: 0, patientID: '1', text: 'Reminder 1', title: 'Reminder 1', reminderType: 1, startdate: '1288323623006', enddate: '1288323623006', isRecursive: true, frequencyUnit: 1, frequency: 1, status: 'active' },
	                { id: 1, patientID: '1', text: 'Reminder 2', title: 'Reminder 2', reminderType: 3, startdate: '1289323623006', enddate: '1288323623006', isRecursive: false, frequencyUnit: null, frequency: null, status: 'active' },
	                { id: 2, patientID: '2', text: 'Reminder 3', title: 'Reminder 3', reminderType: 2, startdate: '1298323623006', enddate: '1288323623006', isRecursive: false, frequencyUnit: null, frequency: null, status: 'active' },
	                { id: 3, patientID: '4', text: 'Reminder 4', title: 'Reminder 4', reminderType: 1, startdate: '1288523623006', enddate: '1288323623006', isRecursive: true, frequencyUnit: 3, frequency: 1, status: 'active' }
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
        getAllRemindersForPatient: function (patientID) {
            var deferredFetchAll = $q.defer();

            ////NR:TODO:  Mock  ////
            var allReminders = $filter('filter')(remindersList, { patientID: patientID }, true);
            ////NR:TODO:  Mock  ////

            deferredFetchAll.resolve(allReminders);
            return deferredFetchAll.promise;
        },
        getActiveRemindersForPatient: function (patientID) {
            var deferredFetchAll = $q.defer();

            ////NR:TODO:  Mock  ////
            var allReminders = $filter('filter')(remindersList, { patientID: patientID, status: 'active' }, true);
            ////NR:TODO:  Mock  ////

            deferredFetchAll.resolve(allReminders);
            return deferredFetchAll.promise;
        },
        getReminderByID: function (reminderID) {
            // Search on patients
            var deferredFetch = $q.defer();

            ////NR:TODO:  Mock  ////
            var reminderByID;
            if (reminderID && reminderID !== "") {
                reminderByID = ($filter('filter')(remindersList, { id: JSON.parse(reminderID) }, true))[0];
            } else {
                reminderByID = null;
            }
            ////NR:TODO:  Mock  ////

            deferredFetch.resolve(reminderByID);
            return deferredFetch.promise;
        },
        save: function (reminder) {
            // execute deferred / return promise
            var deferredSave = $q.defer();

            if (reminder) {
                if (!reminder.id || reminder.id <= 0) {
                    // Insert data & get the id of inserted patient along with complete inserted data

                    ////NR:TODO:  Mock  ////

                    console.log("Mock Insert : setting id=4");
                    var newReminder = reminder;
                    reminder.id = 4;
                    remindersList.push(newReminder);
                    ////NR:TODO:  Mock  ////

                    deferredSave.resolve(newReminder);
                } else {
                    // update data

                    console.log("Mock Update : return as it is");
                    deferredSave.resolve(reminder);
                }
            } else {

                deferredSave.reject("Error Code 00001");

            }
            return deferredSave.promise;
        }

    }
});