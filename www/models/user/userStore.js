angular.module('dCare.Services.UserStore', [])

/**
* A Patient Store service that returns patient data.
*/
.factory('UserStore', function ($q, $filter) {  //NR: $filter is used for MOCK, remove it if not required later
    // Using normal Data store [non-synced, non-clustered]
    var userDataStore = new DataStore({
        dataStoreName: 'User',
        dataAdapter: 'pouchDB',
        adapterConfig: { auto_compaction: true }
    });  // Initialize meals  DataStore

    var enums = {
        syncStatus: {
            'notSynced': { label: 'Data not synced yet', short_label: 'Not Synced', value: 'notSynced' },
            'busy': { label: 'Data Sync is in progress', short_label: 'Busy', value: 'busy' },
            'error': { label: 'Error occured while performing data sync', short_label: 'Error', value: 'error' },
            'complete': { label: 'Data Sync complete', short_label: 'Complete', value: 'complete' }
        }
    };
    // SAMPLE data [ Will only consist of one entry corresponding to currently logged in user ]
    /*var userList = [
                    { id: 1, 
                      firstName:'Nozel',
                      lastName: 'Rosario', 
                      email: 'nozelrosario@gmail.com',
                      photo: 'img/ionic.png', 
                      authToken: '_T_O_K_E_N_', 
                      tokenExpiryDate:'1288323623006', 
                      patients:[ { guid:'_G_U_I_D_1', isEdited:'false', isDefault:'true', fullName:'Nozel Rosario', photo: 'img/ionic.png', initialSyncStatus:"complete", syncStatus:"busy" syncStartDate:'1288323623006', syncEndDate:'1288323623006' },
                                 { guid:'_G_U_I_D_2', isEdited:'true', isDefault:'false', fullName:'Michael Rosario', photo: 'img/ionic.png', initialSyncStatus:"error",syncStatus:"error" syncStartDate:'1288323623006', syncEndDate:'1288323623006'}
                               ],
                      loginDatetime: '1288323623006' }                   
    ];*/


    return {
        enums: enums,
        init: function () {
            var deferredInit = $q.defer();
            if (userDataStore.getDataStore()) {
                deferredInit.resolve();
            } else {
                deferredInit.reject();
            }
            return deferredInit.promise;
        },
        getCount: function () {
            return userDataStore.getDataStore().search({
                select: 'count(id)',
                where: "id = 1"
            });
        },
        getUser: function () {
            return userDataStore.getDataStore().getDataByID(1);
        },
        getAllPatients: function () {
            var deferredfetch = $q.defer();
            this.getUser().then(function (user) {
                deferredfetch.resolve(user.patients);
            }).fail(function (err) {
                deferredfetch.resolve([]);
            });;
            return deferredfetch.promise;
        },
        getPatient: function (guid) {
            var deferredfetch = $q.defer();
            var patient = {};
            this.getUser().then(function (user) {
                if (user.patients.length > 0) {
                    for (var i = 0; i < user.patients.length; i++) {
                        if ((user.patients[i]).guid == guid) {
                            patient = user.patients[i]                            
                            break;
                        }
                    }
                }
                deferredfetch.resolve(patient);
            }).fail(function (err) {
                deferredfetch.resolve({});
            });
            return deferredfetch.promise;
        },
        getDefaultPatient: function () {
            var deferredfetch = $q.defer();
            var defaultPatient = null, isDefaultSet = false;
            this.getUser().then(function (user) {
                if (user.patients.length > 0) {
                    for (var i = 0; i < user.patients.length; i++) {
                        if ((user.patients[i]).isDefault === true) {
                            defaultPatient = user.patients[i];
                            isDefaultSet = true;
                            break;
                        }
                    }
                    //@NR: InCase Default patient is not set, the treat 1st Patient entry as default.
                    if (!isDefaultSet) {
                        defaultPatient = user.patients[0];
                    }
                }
                deferredfetch.resolve(defaultPatient);
            }).fail(function (err) {
                deferredfetch.resolve(null);
            });
            return deferredfetch.promise;
        },
        setDefaultPatient: function (guid) {
            var deferredSet = $q.defer();
            var defaultPatient = null, isPatientFound = false;
            this.getUser().then(function (user) {
                if (user.patients.length > 0) {
                    for (var i = 0; i < user.patients.length; i++) {
                        if ((user.patients[i]).guid === guid) {
                            user.patients[i].isDefault = true;
                            isPatientFound = true;
                            break;
                        }
                    }
                    if (isPatientFound) {
                        for (var j = 0; j < user.patients.length; j++) {
                            if ((user.patients[j]).guid !== guid) {
                                user.patients[j].isDefault = false;
                            }
                        }

                        //@NR : Save patient info in User Data
                        this.save(user).then(function () {
                            deferredSet.resolve();
                        }).fail(function (err) {
                            deferredSet.reject("Error while setting Default !!.. Please Try again.");
                        });
                    } else {
                        app.log.error("Patient with GUID: [ "+ guid +" ] not found");
                        deferredSet.reject("Patient not Found !!..");
                    }                    
                }                
            }).fail(function (err) {
                deferredSet.reject("Error while setting Default !!.. Please Try again.");
            });
            return deferredSet.promise;
        },
        savePatient: function (patient) {
            var deferredSave = $q.defer();
            var generatePatientGUID = function () {
                //@NR: TODO: Write a good GUID generator function
                return (Math.random()).toString();
            };
            var me = this;

            //@NR: Set General Defaults on Patient
            patient.isEdited = true;
            patient.syncStatus = "notSynced";
            patient.syncStartDate = "";

            if (!patient.guid || patient.guid === "") {                  // Incase of New Patient Entry
                //@NR: Set Defaults on New Patient
                patient.guid = generatePatientGUID();
                patient.isDefault = false;
                patient.syncEndDate = "";
                patient.initialSyncStatus = "complete";
                app.log.debug("Adding New patient - " + patient.guid);

            } else {
                //@NR: Set Defaults on New Patient                      // Incase of Existing Patient Update
                app.log.debug("Updating patient - " + patient.guid);
            }

            this.getUser()
                .then(function (user) {
                if (user.patients.length >= 0) {
                    user.patients.push(patient);
                    //@NR: Save
                    me.save(user).then(function () { deferredSave.resolve(patient); }).fail(function () { deferredSave.reject(); });
                }
             }).fail(function (err) {
                deferredSave.reject(err);
             });
            return deferredSave.promise;
        },
        save: function (user) {
            return userDataStore.getDataStore().save(user);
        },
        remove: function () {
            return userDataStore.getDataStore().remove(1);
        }

    }
});