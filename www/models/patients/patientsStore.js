angular.module('dCare.Services.PatientsStore', [])

/**
* A Patient Store service that returns patient data.
*/
.factory('PatientsStore', function ($q, $filter) {
    // Will call data store api for storing/retriving patient data and returns a JSON 
    var patientDataStore = new DataStore({
        dataStoreName: 'Patients',
        dataAdapter: 'pouchDB',
        adapterConfig: { auto_compaction: true }
    });   // Initialize Patients DataStore

    // Some fake testing data
    //var patients = [
	//                { id: 1, name: 'Scruff McGruff', firstname: "Scruff", lastname: "McGruff", phone: "111111111", email: "asd@asd.com", gender: "male", birthdate: "12/12/1980", age: "26 years", photo: "img/ionic.png" },
	//                { id: 2, name: 'G.I. Joe', firstname: "G.I.", lastname: "Joe", phone: "2222222", email: "asd@qwe.com", gender: "male", birthdate: "12/12/1980", age: "26 years", photo: "img/ionic.png" },
	//                { id: 3, name: 'Miss Frizzle', firstname: "Miss", lastname: "Frizzle", phone: "3333333", email: "rty@dfg.com", gender: "female", birthdate: "12/12/1980", age: "26 years", photo: "img/ionic.png" },
	//                { id: 4, name: 'Ash Ketchum', firstname: "Ash", lastname: "Ketchum", phone: "4444444", email: "rty@dfgh.com", gender: "female", birthdate: "12/12/1980", age: "26 years", photo: "img/ionic.png" }
	//               ];

    return {
        getCount: function () {
            return patientDataStore.getRowsCount();
        },
        getAllPatients: function () {
            return patientDataStore.getAllRows();
        },
        getPatientByID: function (patientID) {
            return patientDataStore.getDataByID(patientID);
        },
        save: function (patient) {
            // Before Save dat manupulation
            patient.name = patient.firstname + " " + patient.lastname;
            patient.photo = "img/ionic.png";
            return patientDataStore.save(patient);
        }

    }
});