angular.module('patientsStore.services', ['dataStore.services'])

/**
* A Patient Store service that returns patient data.
*/
.factory('PatientsStore', function ($q, $filter, DataStore) {
    // Will call data store api for storing/retriving patient data and returns a JSON 
    DataStore.initDataStore('Patients');   // Initialize Patients DataStore

    // Some fake testing data
    var patients = [
	                { id: 1, name: 'Scruff McGruff', firstname: "Scruff", lastname: "McGruff", phone: "111111111", email: "asd@asd.com", gender: "male", birthdate: "12/12/1980", age: "26 years", photo: "img/ionic.png" },
	                { id: 2, name: 'G.I. Joe', firstname: "G.I.", lastname: "Joe", phone: "2222222", email: "asd@qwe.com", gender: "male", birthdate: "12/12/1980", age: "26 years", photo: "img/ionic.png" },
	                { id: 3, name: 'Miss Frizzle', firstname: "Miss", lastname: "Frizzle", phone: "3333333", email: "rty@dfg.com", gender: "female", birthdate: "12/12/1980", age: "26 years", photo: "img/ionic.png" },
	                { id: 4, name: 'Ash Ketchum', firstname: "Ash", lastname: "Ketchum", phone: "4444444", email: "rty@dfgh.com", gender: "female", birthdate: "12/12/1980", age: "26 years", photo: "img/ionic.png" }
	               ];

    return {
        getCount: function () {
            return DataStore.getRowsCount();
        },
        getAllPatients: function () {
            var deferredFetchAll = $q.defer();

            ////NR:TODO:  Mock  ////
            var allPatients = patients;
            ////NR:TODO:  Mock  ////

            deferredFetchAll.resolve(allPatients);
            return deferredFetchAll.promise;
        },
        getPatientByID: function (patientID) {
            return DataStore.getDataByID(patientID);
        },
        save: function (patient) {
            // Before Save dat manupulation
            patient.name = patient.firstname + " " + patient.lastname;
            patient.photo = "img/ionic.png";
            return DataStore.save(patient);
        }

    }
});