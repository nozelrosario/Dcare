angular.module('dCare.Services.MedicationStore', ['dCare.Services.NotificationsStore'])

/**
* A Patient Store service that returns medication data.
*/
.factory('MedicationsStore', function ($q, $filter, RemindersStore) {  //NR: $filter is used for MOCK, remove it if not required later
    // Will call phonegap api for storing/retriving patient data and returns a JSON array
    var medicationsDataStore = new DataStoreFactory({
        dataStoreName: 'medications',
        dataAdapter: app.context.defaultDataAdapter,
        adapterConfig: { auto_compaction: true }
    });  // Initialize Medications  DataStore

    var enums = {
        doseFrequency: {
            1: { label: 'Every 6 Hours', short_label: 'Every 6 Hours', image: 'img/6hr.png', value: 1 },
            2: { label: 'Every 8 Hours', short_label: 'Every 8 Hours', image: 'img/8hr.png', value: 2 },
            3: { label: 'Every 12 Hours', short_label: 'Every 12 Hours', image: 'img/12hr.png', value: 3 },
            4: { label: 'Every 24 Hours', short_label: 'Every 24 Hours', image: 'img/24hr.png', value: 4 },
            5: { label: 'Every Week', short_label: 'Every Week', image: 'img/week.png', value: 5 },
            6: { label: 'Every Month', short_label: 'Every Month', image: 'img/month.png', value: 6 },
            7: { label: 'Every Year', short_label: 'Every Year', image: 'img/year.png', value: 7 }
        },
        medicationRoute: {
            1: { label: 'Oral', short_label: 'Swallowed though mouth', image: 'img/oral.png', value: 1 },
            2: { label: 'Intramuscular', short_label: 'Given via. an injection into muscle', image: 'img/injection.png', value: 2 },
            3: { label: 'Intranevenous', short_label: 'Given via. an injection into a vein', image: 'img/syringe.png', value: 3 },
            4: { label: 'Eye Drops', short_label: 'Apply into the Eye via. dropper', image: 'img/eye-drops.png', value: 4 },
            5: { label: 'Nasal', short_label: 'Apply into the Nose via. dropper', image: 'img/nose-drops.png', value: 5 },
            6: { label: 'Subcutaneous', short_label: 'An injection into the fat layer, underneath the skin', image: 'img/syringe.png', value: 6 },
            7: { label: 'Dermal', short_label: 'An injection into the upper skin layer', image: 'img/skin-hair.png', value: 7 },
            8: { label: 'Inhalation', short_label: 'Inhaled into lungs via nose/mouth', image: 'img/inhalator.png', value: 8 }
        }
    };
    // Some fake testing data
    //var medicationList = [
	//                { id: 0, patientID: '1', name: 'Crocin 250', dose: '1 tablet', dosefrequency: 1, startdate: '1288323623006', enddate: '1288323623006', route: 2, notes: '', status: 'active' },
	//                { id: 1, patientID: '1', name: 'Ibuprofen 500', dose: '1/2 tablet', dosefrequency: 3, startdate: '1289323623006', enddate: '1288323623006', route: 3, notes: '', status: 'active' },
	//                { id: 2, patientID: '2', name: 'Asprin', dose: '5ml', dosefrequency: 2, startdate: '1298323623006', enddate: '1288323623006', route: 4, notes: '', status: 'active' },
	//                { id: 3, patientID: '4', name: 'Lanta Reflux li', dose: '1 drop', dosefrequency: 1, startdate: '1288523623006', enddate: '1288323623006', route: 3, notes: '', status: 'active' }
	//                ];
    var setMedicationReminder = function (medicationID) {
        var deferredReminder = $q.defer();
        this.getMedicationByID(medicationID).then(function (medication) {
            if(medication) {
                var startDate = medication.startdate;
                var endDate = medication.enddate;
                var frequency, frequencyUnit;
                var newReminder = null, reminderText="", reminderTitle = "";
                //NR: map medication.doseFrequency <=> reminder.frequencyUnit & reminder.frequency
                switch (medication.dosefrequency) {
                    case 1: frequency = 6;
                        frequencyUnit = 4; //6 hourly
                        break;
                    case 2: frequency = 8;
                        frequencyUnit = 4; //8 hourly
                        break;
                    case 3: frequency = 12;
                        frequencyUnit = 4; //12 hourly
                        break;
                    case 4: frequency = 24;
                        frequencyUnit = 4; //24 hourly
                        break;
                    case 5: frequency = 1;
                        frequencyUnit = 3; // weekly
                        break;
                    case 6: frequency = 1;
                        frequencyUnit = 2; // monthly
                        break;
                    case 7: frequency = 1;
                        frequencyUnit = 1; // yearly
                        break;
                    default: frequency = "";
                        frequencyUnit = ""; 
                        break;
                }

                if (frequency !== "" && frequencyUnit !== "") {
                    if (!startDate) startDate = castToLongDate(new Date());
                    if (!endDate) endDate = "";
                    reminderText = "Reminder for having your medication: " + medication.name;
                    reminderTitle = "Medication: " + medication.name;
                    newReminder = {
                        patientID: medication.patientID,
                        text: reminderText,
                        title: reminderTitle,
                        reminderType: 1,    //NR: medication reminder
                        startdate: startDate,
                        enddate: endDate,
                        isRecursive: true,
                        frequencyUnit: frequencyUnit,
                        frequency: frequency,
                        status: 'active',
                        sourceID: 'Medication_' + medication.id
                    };
                    RemindersStore.save(newReminder, { keyFields: ["sourceID"], saveEmptyValues: true } ).then(function (reminder) {
                        deferredReminder.resolve("Reminder set successfully!");
                    }).fail(function (err) {                        
                        deferredReminder.resolve("Could not set Reminder!!");
                    });

                } else {
                    deferredReminder.resolve("Could not set Reminder!! Please fill in 'Frequency' for this medication and try again.");
                }
            } else {
                deferredReminder.resolve("Could not set Reminder!! Medication not found");
            }
        }).fail(function (err) {                
            deferredReminder.resolve("Could not set Reminder!! please try again.");
        });
            
        return deferredReminder.promise;
    };


    var removeMedicationReminder = function (medicationID) {
        var deferredReminder = $q.defer(),
            sourceID = 'Medication_' + medicationID;
        RemindersStore.getReminderBySourceID(sourceID).then(function (matchingReminders) {   
            if (matchingReminders && (matchingReminders.length > 0) && matchingReminders[0].id) {
                RemindersStore.remove(matchingReminders[0].id).then(function () {
                    deferredReminder.resolve("Reminder removed successfully!");
                }).fail(function (err) {
                    deferredReminder.resolve("Could not remove Reminder!! please try again.");
                });                    
            } else {
                deferredReminder.resolve("Could not remove Reminder!! Reminder not found");
            }
        }).fail(function (err) {
            deferredReminder.resolve("Could not remove Reminder!! please try again.");
        });

        return deferredReminder.promise;
    };

    // Trigger remove reminder upon Delete
    medicationsDataStore.getDataStore(app.context.getCurrentCluster()).addTrigger("after-delete", "trigger_remove_reminder", function (evtData) {
        var deletedMedication = evtData.data;
        removeMedicationReminder(deletedMedication.id);        
    });

    return {
        enums: enums,
        init: function () {
            var deferredInit = $q.defer();
            if (medicationsDataStore.getDataStore(app.context.getCurrentCluster())) {
                deferredInit.resolve();
            } else {
                deferredInit.reject();
            }
            return deferredInit.promise;
        },
        getCount: function (patientID) {
            return medicationsDataStore.getDataStore(app.context.getCurrentCluster()).search({
                select: 'count(id)',
                where: "patientID = " + patientID
            });
        },
        getAllMedicationsForPatient: function (patientID) {
            return medicationsDataStore.getDataStore(app.context.getCurrentCluster()).search({
                select: '*',
                where: "patientID=" + patientID + ""
            });
        },
        getActiveMedicationsForPatient: function (patientID) {
            return medicationsDataStore.getDataStore(app.context.getCurrentCluster()).search({
                select: '*',
                where: "patientID=" + patientID + " and status= 'active'"
            });
        },
        getMedicationByID: function (medicationID) {
            return medicationsDataStore.getDataStore(app.context.getCurrentCluster()).getDataByID(medicationID);
        },
        save: function (medication) {
            return medicationsDataStore.getDataStore(app.context.getCurrentCluster()).save(medication);
        },
        setMedicationReminder: setMedicationReminder,
        removeMedicationReminder: removeMedicationReminder,
        remove: function (medicationID) {
            return medicationsDataStore.getDataStore(app.context.getCurrentCluster()).remove(medicationID);
        }
    }
});