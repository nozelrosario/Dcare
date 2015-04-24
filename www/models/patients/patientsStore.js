angular.module('patientsStore.services', [])

/**
* A Patient Store service that returns patient data.
*/
.factory('PatientsStore', function ($q, $filter, pouchDB) {
    // Will call phonegap api for storing/retriving patient data and returns a JSON 
    var patients_DB = pouchDB('Patients');

    // Some fake testing data
    var patients = [
	                { id: 1, name: 'Scruff McGruff', firstname: "Scruff", lastname: "McGruff", phone: "111111111", email: "asd@asd.com", gender: "male", birthdate: "12/12/1980", age: "26 years", photo: "img/ionic.png" },
	                { id: 2, name: 'G.I. Joe', firstname: "G.I.", lastname: "Joe", phone: "2222222", email: "asd@qwe.com", gender: "male", birthdate: "12/12/1980", age: "26 years", photo: "img/ionic.png" },
	                { id: 3, name: 'Miss Frizzle', firstname: "Miss", lastname: "Frizzle", phone: "3333333", email: "rty@dfg.com", gender: "female", birthdate: "12/12/1980", age: "26 years", photo: "img/ionic.png" },
	                { id: 4, name: 'Ash Ketchum', firstname: "Ash", lastname: "Ketchum", phone: "4444444", email: "rty@dfgh.com", gender: "female", birthdate: "12/12/1980", age: "26 years", photo: "img/ionic.png" }
	               ];

    return {
        getCount: function () {
            var deferredCount = $q.defer();

            ////NR:TODO:  Mock  ////
            var count = 4; // fire query for count
            ////NR:TODO:  Mock  ////

            deferredCount.resolve(count);
            return deferredCount.promise;
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
            // Search on patients
            var deferredFetch = $q.defer();
            var patientByID;
            ////NR:TODO:  Mock  ////
            if (patientID && patientID !== "") {
                patientByID = ($filter('filter')(patients, { id: JSON.parse(patientID) }, true))[0];
            } else {
                patientByID = null;
            }
            // return null if not found
            ////NR:TODO:  Mock  ////

            deferredFetch.resolve(patientByID);
            return deferredFetch.promise;
        },
        save: function (patient) {
            // execute deferred / return promise
            var deferredSave = $q.defer();

            if (patient) {
                if (!patient.id || patient.id <= 0) {
                    // Insert data & get the id of inserted patient along with complete inserted data

                    ////NR:TODO:  Mock  ////

                    console.log("Mock Insert : setting id=4");
                    var newPatient = patient;
                    newPatient.id = 4;
                    patients.push(newPatient);
                    ////NR:TODO:  Mock  ////

                    deferredSave.resolve(newPatient);
                } else {
                    // update data

                    console.log("Mock Update : return as it is");
                    deferredSave.resolve(patient);
                }
            } else {

                deferredSave.reject("Error Code 00001");

            }
            return deferredSave.promise;
        }

    }
});