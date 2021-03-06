angular.module('dCare.Services.PatientsStore', [])

/**
* A Patient Store service that returns patient data.
*/
.factory('PatientsStore', function ($q, $filter) {
    // Will call data store api for storing/retriving patient data and returns a JSON 
    var patientDataStore = new DataStoreFactory({
        dataStoreName: 'patients',
        dataAdapter: app.context.defaultDataAdapter,
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
        init: function () {
            var deferredInit = $q.defer();
            if (patientDataStore.getDataStore(app.context.getCurrentCluster())) {
                deferredInit.resolve();
            } else {
                deferredInit.reject();
            }
            return deferredInit.promise;
        },
        getCount: function () {
            return patientDataStore.getDataStore(app.context.getCurrentCluster()).getRowsCount();
        },
        getAllPatients: function () {
            return patientDataStore.getDataStore(app.context.getCurrentCluster()).getAllRows();
        },
        getPatientByID: function (patientID) {
            return patientDataStore.getDataStore(app.context.getCurrentCluster()).getDataByID(patientID);
        },        
        getPatientProfilePhoto: function (patientID) {
            var deferred = $q.defer();
            var profilePhotoUrl = '';
            patientDataStore.getDataStore(app.context.getCurrentCluster()).getAttachmentDataByID(patientID, 'profile_photo').then(function (data) {
                if (data && data instanceof Blob) {
                    if (blobUtil) {
                        profilePhotoUrl = blobUtil.createObjectURL(data);
                    } else {
                        app.log.error("Blob-Util libary required !!");
                    }                    
                }
                deferred.resolve(profilePhotoUrl);
            }).fail(function (err) {
                app.log.error("Error during getPatientProfilePhoto. [" + err + ']');
                deferred.reject();
            });            
            return deferred.promise;
        },
        getPatientProfilePhotoByGuid: function (guid) {
            var deferred = $q.defer();
            var profilePhotoUrl = '';
            var getPatientByGuid = function (guid) {
                return patientDataStore.getDataStore(guid).search({
                    select: '*',
                    where: "guid='" + guid + "'"
                });
            };

            getPatientByGuid(guid).then(function (data) {
                if (data[0] && (data[0])) {
                    patientDataStore.getDataStore(guid).getAttachmentDataByID((data[0]).id, 'profile_photo').then(function (data) {
                        if (data && data instanceof Blob) {
                            if (blobUtil) {
                                profilePhotoUrl = blobUtil.createObjectURL(data);
                            } else {
                                app.log.error("Blob-Util libary required !!");
                            }
                        }
                        deferred.resolve(profilePhotoUrl);
                    }).fail(function (err) {
                        app.log.error("Error during getPatientProfilePhoto. [" + err + ']');
                        deferred.reject();
                    });
                } else {
                    app.log.warn("Unable to load profile picture, Data not synced yet!");
                }
            }).fail(function () {
                app.log.warn("Unable to load profile picture, Data not synced yet!");
            });            
            return deferred.promise;
        },
        save: function (patient) {
            return patientDataStore.getDataStore(app.context.getCurrentCluster()).save(patient);
        }

    }
});