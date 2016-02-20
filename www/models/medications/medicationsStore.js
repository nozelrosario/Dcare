angular.module('dCare.Services.MedicationStore', ['dCare.Services.NotificationsStore'])

/**
* A Patient Store service that returns medication data.
*/
.factory('MedicationsStore', function ($q, $filter, RemindersStore) {  //NR: $filter is used for MOCK, remove it if not required later
    // Will call phonegap api for storing/retriving patient data and returns a JSON array
    var medicationsDataStore = new DataStore({
        dataStoreName: 'Medications',
        dataAdapter: 'pouchDB',
        adapterConfig: { auto_compaction: true }
    });  // Initialize Medications  DataStore

    var enums = {
        doseFrequency: {
            1: { label: 'Every 6 Hours', short_label: 'Every 6 Hours', image:'', value: 1 },
            2: { label: 'Every 8 Hours', short_label: 'Every 8 Hours', image: '', value: 2 },
            3: { label: 'Every 12 Hours', short_label: 'Every 12 Hours', image: '', value: 3 },
            4: { label: 'Every 24 Hours', short_label: 'Every 24 Hours', image: '', value: 4 },
            5: { label: 'Every Week', short_label: 'Every Week', image: '', value: 5 },
            6: { label: 'Every Month', short_label: 'Every Month', image: '', value: 6 },
            7: { label: 'Every Year', short_label: 'Every Year', image: '', value: 7 }
        },
        medicationRoute: {
            1: { label: 'Oral', short_label: 'Swallowed though mouth', image: 'img/extra/drugs5.png', value: 1 },
            2: { label: 'Intramuscular', short_label: 'Given via. an injection into muscle', image: 'img/extra/injection.png', value: 2 },
            3: { label: 'Intranevenous', short_label: 'Given via. an injection into a vein', image: 'img/extra/syringe.png', value: 3 },
            4: { label: 'Eye Drops', short_label: 'Apply into the Eye via. dropper', image: 'img/extra/human90.png', value: 4 },
            5: { label: 'Nasal', short_label: 'Apply into the Nose via. dropper', image: 'img/extra/drugs.png', value: 5 },
            6: { label: 'Subcutaneous', short_label: 'An injection into the fat layer, underneath the skin', image: 'img/extra/testtube1.png', value: 6 },
            7: { label: 'Dermal', short_label: 'An injection into the upper skin layer', image: 'img/extra/water12.png', value: 7 },
            8: { label: 'Inhalation', short_label: 'Inhaled into lungs via nose/mouth', image: 'img/extra/pill11.png', value: 8 }
        }
    };
    // Some fake testing data
    //var medicationList = [
	//                { id: 0, patientID: '1', name: 'Crocin 250', dose: '1 tablet', dosefrequency: 1, startdate: '1288323623006', enddate: '1288323623006', route: 2, notes: '', status: 'active' },
	//                { id: 1, patientID: '1', name: 'Ibuprofen 500', dose: '1/2 tablet', dosefrequency: 3, startdate: '1289323623006', enddate: '1288323623006', route: 3, notes: '', status: 'active' },
	//                { id: 2, patientID: '2', name: 'Asprin', dose: '5ml', dosefrequency: 2, startdate: '1298323623006', enddate: '1288323623006', route: 4, notes: '', status: 'active' },
	//                { id: 3, patientID: '4', name: 'Lanta Reflux li', dose: '1 drop', dosefrequency: 1, startdate: '1288523623006', enddate: '1288323623006', route: 3, notes: '', status: 'active' }
	//                ];

    return {
        enums: enums,
        getCount: function (patientID) {
            return medicationsDataStore.search({
                select: 'count(id)',
                where: "patientID = " + patientID
            });
        },
        getAllMedicationsForPatient: function (patientID) {
            return medicationsDataStore.search({
                select: '*',
                where: "patientID=" + patientID + ""
            });
        },
        getActiveMedicationsForPatient: function (patientID) {
            return medicationsDataStore.search({
                select: '*',
                where: "patientID=" + patientID + " and status= 'active'"
            });
        },
        getMedicationByID: function (medicationID) {
            return medicationsDataStore.getDataByID(medicationID);
        },
        save: function (medication) {
            return medicationsDataStore.save(medication);
        },
        setMedicationReminder: function (medicationID) {
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
                        if (!endDate) endDate = 0;
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
                        deferredReminder.resolve("Could not set Reminder!! Please fill in 'Frequency' for medication to set reminder");
                    }
                } else {
                    deferredReminder.resolve("Could not set Reminder!! Medication not found");
                }
            }).fail(function (err) {                
                deferredReminder.resolve("Could not set Reminder!! please try again.");
               });
            
            return deferredReminder.promise;
        },
        removeMedicationReminder: function (medicationID) {
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
        }
    }
});