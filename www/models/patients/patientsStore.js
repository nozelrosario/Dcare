angular.module('patientsStore.services', [])

/**
* A Patient Store service that returns patient data.
*/
.factory('PatientsStore', function ($q) {
    // Will call phonegap api for storing/retriving patient data and returns a JSON array

    // Some fake testing data
    var patients = [
	                { id: 0, name: 'Scruff McGruff', firstname: "Scruff", lastname: "McGruff", phone: "111111111", email: "asd@asd.com", gender: "male" },
	                { id: 1, name: 'G.I. Joe', firstname: "G.I.", lastname: "Joe", phone: "2222222", email: "asd@qwe.com", gender: "male" },
	                { id: 2, name: 'Miss Frizzle', firstname: "Miss", lastname: "Frizzle", phone: "3333333", email: "rty@dfg.com", gender: "female" },
	                { id: 3, name: 'Ash Ketchum', firstname: "Ash", lastname: "Ketchum", phone: "4444444", email: "rty@dfgh.com", gender: "female" }
	                ];

    return {
        getCount: function () {
            var deferredCount = $q.defer();

            ////NR:TODO:  Mock  ////
            var count = 0; // fire query for count
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

            ////NR:TODO:  Mock  ////
            var patientByID = patients[patientID];
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