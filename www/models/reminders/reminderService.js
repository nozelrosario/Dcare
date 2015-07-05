angular.module('dCare.Services.ReminderService', ['dCare.Services.RemindersStore'])

.factory("ReminderService", function ($q, RemindersStore) {
    // difference between Notification & reminder is , reminders will not be deleted, ?Notification will be detelted upon due datetime
    return {
        scheduleReminder: function (reminderConfig) {
            // will push entry to reminder store
            // check in NotificationsStore if a notification with this reminderID exists
            // if relate Notification Exists , update [ID remiains]
            // Else should add a notification to Notification Store with refrence to current reminder id
        },
        getAllReminders: function (patientID) {

        }


    };
});