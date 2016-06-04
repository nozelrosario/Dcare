angular.module('dCare.Services.RemindersStore', ['dCare.Services.NotificationsStore'])

/**
* A Patient Store service that returns reminders data.
*/
.factory('RemindersStore', function ($q, $filter, NotificationsStore) {  //NR: $filter is used for MOCK, remove it if not required later
    // Will call phonegap api for storing/retriving patient data and returns a JSON array
    var remindersDataStore = new DataStore({
        dataStoreName: 'Reminders',
        dataAdapter: 'pouchDB',
        adapterConfig: { auto_compaction: true }
    });  // Initialize Reminders  DataStore

    var enums = {
        reminderType: {
            1: { label: 'Medicine', short_label: 'Medicine', image: 'img/medicines-reminder.png', value: 1 },
            2: { label: 'Insulin', short_label: 'Insulin', image: 'img/syringe.png', value: 2 },
            3: { label: 'Dr. Appointment', short_label: 'Dr. Appointment', image: 'img/doctor-app.png', value: 3 },
            4: { label: 'Glucose test', short_label: 'Glucose test', image: 'img/glucose.png', value: 4 },
            5: { label: 'BP check', short_label: 'BP check', image: 'img/blood-pressure-gauge.png', value: 5 },
            6: { label: 'Recommendation', short_label: 'Recommendation', image: 'img/alerts-recommendations.png', value: 6 },
            7: { label: 'Other', short_label: 'Other', image: 'img/other.png', value: 7 }
        },
        frequencyUnit: {
            1: { label: 'Year', short_label: 'Yearly', image: 'img/year.png', value: 1 },
            2: { label: 'Month', short_label: 'Monthly', image: 'img/month.png', value: 2 },
            3: { label: 'Week', short_label: 'Weekly', image: 'img/week.png', value: 3 },
            4: { label: 'Hour', short_label: 'Hourly', image: 'img/clock.png', value: 4 },
            5: { label: 'Minutes', short_label: 'Minutes', image: 'img/clock.png', value: 5 }
        }
    };
    //// Some fake testing data
    //var remindersList = [
    //                { id: 0, patientID: '1', text: 'Reminder 1', title: 'Reminder 1', reminderType: 1, startdate: '1288323623006', enddate: '1288323623006', isRecursive: true, frequencyUnit: 1, frequency: 1, status: 'active' sourceID:'Medication_13'},
	//                { id: 1, patientID: '1', text: 'Reminder 2', title: 'Reminder 2', reminderType: 3, startdate: '1289323623006', enddate: '1288323623006', isRecursive: false, frequencyUnit: null, frequency: null, status: 'active' },
	//                { id: 2, patientID: '2', text: 'Reminder 3', title: 'Reminder 3', reminderType: 2, startdate: '1298323623006', enddate: '1288323623006', isRecursive: false, frequencyUnit: null, frequency: null, status: 'active' },
	//                { id: 3, patientID: '4', text: 'Reminder 4', title: 'Reminder 4', reminderType: 1, startdate: '1288523623006', enddate: '1288323623006', isRecursive: true, frequencyUnit: 3, frequency: 1, status: 'active' sourceID:'Medication_12' }
	//                ];

    // ===== TRIGGERS ======
    // Trigger new notification upon insert
    remindersDataStore.addTrigger("after-insert", "trigger_new_notification", function (evtData) {
        var reminderData = evtData.data;
        var notification = { 
            patientID: reminderData.patientID,
            text: reminderData.text,
            title: reminderData.title,
            notificationType: reminderData.reminderType,
            startdate: reminderData.startdate,
            enddate: reminderData.enddate,
            frequencyUnit: reminderData.frequencyUnit,
            frequency: reminderData.frequency,
            status: ((reminderData.status) ? reminderData.status : "active"),
            data: {},
            reminderID: reminderData.id
        };
        NotificationsStore.save(notification);
    });

    // Trigger update notification upon reminder Update/re-configure
    remindersDataStore.addTrigger("after-update", "trigger_update_notification", function (evtData) {
        var reminderData = evtData.data;
        NotificationsStore.getNotificationForReminder(reminderData.id).then(function (matching_Notifications) {            
            var new_Notification = {                
                patientID: reminderData.patientID,
                text: reminderData.text,
                title: reminderData.title,
                notificationType: reminderData.reminderType,
                startdate: reminderData.startdate,
                enddate: reminderData.enddate,
                frequencyUnit: reminderData.frequencyUnit,
                frequency: reminderData.frequency,
                status: ((reminderData.status) ? reminderData.status : "active") ,
                data: {},
                reminderID: reminderData.id
            };
            if (matching_Notifications.length > 0) {
                var existing_Notification = matching_Notifications[0];  //NR: Take the first match by default
                // Fill in id & _rev to force for update
                if (existing_Notification.id > 0) {
                    new_Notification.id = existing_Notification.id;
                    new_Notification._rev = existing_Notification._rev;
                }
            }            

            NotificationsStore.save(new_Notification);
        });        
    });

    // Trigger remove notification upon Delete
    remindersDataStore.addTrigger("after-delete", "trigger_remove_notification", function (evtData) {
        var reminderData = evtData.data;
        NotificationsStore.getNotificationForReminder(reminderData.id).then(function (existing_Notifications) {
            if (existing_Notifications) {
                var existing_Notification;
                for (var i = 0; i < existing_Notifications.length; i++) {
                    existing_Notification = existing_Notifications[i];
                    if (existing_Notification.id > 0) NotificationsStore.remove(existing_Notification.id);
                }
            }            
        });        
    });


    return {
        enums: enums,
        getCount: function (patientID) {
            return remindersDataStore.search({
                select: 'count(id)',
                where: "patientID = " + patientID
            });
        },
        getAllRemindersForPatient: function (patientID) {
            return remindersDataStore.search({
                select: '*',
                where: "patientID=" + patientID + ""
            });
        },
        getActiveRemindersForPatient: function (patientID) {
            return remindersDataStore.search({
                select: '*',
                where: "patientID=" + patientID + " and status= 'active'" + " and (enddate >=" + castToLongDate(new Date()) + " or enddate='')"
            });
        },
        getPastRemindersForPatient: function (patientID) {
            return remindersDataStore.search({
                select: '*',
                where: "patientID=" + patientID + " and enddate <" + castToLongDate(new Date())
            });
        },
        getReminderBySourceID: function (sourceID) {
            return remindersDataStore.search({
                select: '*',
                where: "status= 'active'" + " and sourceID ='" + sourceID + "'"       //TODO: check if PatientID constraint is required here for security reasons.
            });
        },
        getReminderByID: function (reminderID) {
            return remindersDataStore.getDataByID(reminderID);
        },
        save: function (reminder,config) {
            return remindersDataStore.save(reminder,config);
        },
        remove: function (reminderID) {
            return remindersDataStore.remove(reminderID);
        }

    }
});