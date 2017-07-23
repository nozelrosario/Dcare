angular.module('dCare.SyncManager', ['ionic',
                                     'dCare.Services.UserStore', 'dCare.ApiInvoker', 'dCare.Authentication'])

.factory("SyncManagerService", function ($q, UserStore, ApiInvokerService, AuthenticationService, $ionicLoading, $mdDialog) {
    var performSync = function (clusterID, executionMode, isInitialSync) {
        var deferedSync = $q.defer();

        var getDataStoreforSync = function (dataStoreName, clusterID) {
            var dataStore = new DataStoreFactory({
                dataStoreName: dataStoreName,
                dataAdapter: app.context.defaultDataAdapter,
                adapterConfig: { auto_compaction: true }
            });
            return dataStore.getDataStore(clusterID);
        };

        var initiateClusterSync = function (clusterID, mode) {
            var deferedClusterSync = $q.defer();
            var dataStoresToSync = app.config.syncedDataStores;
            var syncMethod = (isInitialSync) ? "syncFrom" : "sync";
            if (dataStoresToSync.length > 0) {
                if (mode === "sequential") {
                    var sequentialSyncInvoker = function (_dataStoresToSync, index, deferedCaller) {
                        var dataStoreToSync = getDataStoreforSync(_dataStoresToSync[index], clusterID);
                        ((dataStoreToSync[syncMethod]).call(dataStoreToSync, app.config.syncURI)).then(function () {
                            index = index + 1;
                            if (index < _dataStoresToSync.length) {
                                sequentialSyncInvoker(_dataStoresToSync, index, deferedCaller);
                            } else {
                                deferedCaller.resolve();
                            }
                        }).fail(function () {
                            deferedCaller.reject();
                        });
                    }
                    sequentialSyncInvoker(dataStoresToSync, 0, deferedClusterSync);
                } else {
                    var unifiedDeferedSync = [];
                    var dataStoreToSync;
                    for (var i = 0; i < dataStoresToSync.length; i++) {
                        dataStoreToSync = getDataStoreforSync(dataStoresToSync[i], clusterID);
                        unifiedDeferedSync.push(((dataStoreToSync[syncMethod]).call(dataStoreToSync, app.config.syncURI)));
                    }

                    //NR: Wait untill all DataStores sync is finished. [wait to resolve all promises]
                    $.when.apply($, unifiedDeferedSync).then(function () {
                        // All Sync success [results in argument object]
                        app.log.info(arguments);
                        deferedClusterSync.resolve();
                    }).fail(function () {
                        //Some/all Sync failed  [results in argument object]
                        app.log.info(arguments);
                        deferedClusterSync.reject();
                    });
                }

            }
            return deferedClusterSync.promise;
        };

        var syncStatusPropertyName = (isInitialSync) ? "initialSyncStatus" : "syncStatus";
        var syncStatusBusyInfo = {};
        syncStatusBusyInfo[syncStatusPropertyName] = "busy";
        syncStatusBusyInfo["syncStartDate"] = (castToLongDate(new Date()));
        app.context.syncStatus = syncStatusBusyInfo[syncStatusPropertyName];
        UserStore.setSyncStatus(clusterID, syncStatusBusyInfo).then(function () {
            initiateClusterSync(clusterID, executionMode).then(function () {
                app.log.info("Sync Complete cluster [" + clusterID + "]");
                //NR: Update the Sync Success status in User Info
                var syncStatusCompletedInfo = {};
                syncStatusCompletedInfo[syncStatusPropertyName] = "complete";
                syncStatusCompletedInfo["syncEndDate"] = (castToLongDate(new Date()));
                UserStore.setSyncStatus(clusterID, syncStatusCompletedInfo).then(function () {
                    //NR: Sync Status updated, resolve main Promise
                    deferedSync.resolve();
                }).catch(function () {
                    //NR: Sync Status update Failed, reject main Promise
                    deferedSync.reject();
                });
                app.context.syncStatus = syncStatusCompletedInfo[syncStatusPropertyName];
            }).catch(function () {
                app.log.info("Sync Failed cluster [" + clusterID + "]");
                //NR: Update the Sync Error status in User Info
                var syncStatusErrorInfo = {};
                syncStatusErrorInfo[syncStatusPropertyName] = "error";
                //syncStatusErrorInfo["syncEndDate"] = (castToLongDate(new Date()));  // not required
                UserStore.setSyncStatus(clusterID, syncStatusErrorInfo).then(function () {
                    //NR: Sync Failed Status updated, reject main Promise
                    deferedSync.reject();
                }).catch(function () {
                    //NR: Sync Status update Failed, reject main Promise
                    deferedSync.reject();
                });
                app.context.syncStatus = syncStatusErrorInfo[syncStatusPropertyName];
            });
        }).catch(function () {
            app.log.info("Unable to update sync status for cluster [" + clusterID + "]");
            deferedSync.reject();
            app.context.syncStatus = 'error';
        });
        //NR: TODO: Stop any sync operation in progress, and restart
        return deferedSync.promise;
    };

    var doInitialSync = function (patientGuid, backgroundMode) {
        var deferedSync = $q.defer();
        app.context.syncStatus = 'busy';
        //NR: Get patient(Cluster) for Sync
        UserStore.getPatient(patientGuid).then(function (patientEntry) {
            var syncStatus;
            //NR: Check if initial Sync required.
            if (patientEntry.initialSyncStatus != "complete") {
                //NR: Obtain Refreshed Auth Token Before invoking Sync.
                AuthenticationService.refreshToken().then(function () {
                    if (patientEntry.initialSyncStatus == "error") {
                        syncStatus = "There was an Error while Data Sync, Retrying Sync again...";
                    } else if (patientEntry.initialSyncStatus == "busy") {
                        // If timeout passed, stop & attempt sync again
                        if (((castToLongDate(new Date())) - patientEntry.syncStartDate) > app.config.syncTimeout) {
                            syncStatus = "Data Sync timed out, Retrying Sync again...";
                        } else {
                            syncStatus = "Data Sync is in progress, Please Wait...";
                        }
                    } else {
                        syncStatus = "Data Sync is in progress, Please Wait...";
                    }

                    if (patientEntry.isEdited) {
                        //NR: This will hit in scenario when sync is inturrupted & mean while patient data is modified.
                        //NR: If isEdited == true possiblity => new patient added / update existing ptient)
                        //    Start db-sync only after patient is saved remotely & cluster is setup on remote db. [else will face authentication issue]
                        performPatientSync().then(function () {
                            performSync(patientGuid, "sequential", true).then(function () {
                                if (!backgroundMode) $ionicLoading.hide();
                                deferedSync.resolve();
                            }).catch(function () {
                                if (!backgroundMode) $ionicLoading.hide();
                                deferedSync.reject();
                            });
                        }).catch(function (err) {
                            app.log.error("Patient Sync failed, thereby terminating DB-Sync. [Error]-" + err);
                            if (!backgroundMode) $ionicLoading.hide();
                            deferedSync.reject();
                            app.context.syncStatus = 'error';
                        });
                    } else {
                        performSync(patientGuid, "sequential", true).then(function () {
                            if (!backgroundMode) $ionicLoading.hide();
                            deferedSync.resolve();
                        }).catch(function () {
                            if (!backgroundMode) $ionicLoading.hide();
                            deferedSync.reject();
                        });
                    }

                    if (backgroundMode) {
                        if (backgroundMode !== "silent") {   //NR: For 'silent' mode do not show nitification.
                            $mdDialog.show($mdDialog.alert()
                                       .title('Data Sync..')
                                       .content(syncStatus)
                                       .ariaLabel(syncStatus)
                                       .ok('OK!'));
                        }
                        deferedSync.reject();
                        //NR: Reject immediately to indicate sync not complete.
                    } else {
                        $ionicLoading.show({ template: '<md-progress-circular md-mode="indeterminate" md-diameter="70"><label style="color:white;">' + syncStatus + '</label></md-progress-circular>', noBackdrop: false });
                    }
                }).catch(function () {
                    app.log.info("Sync Failed [Authentication Error]");
                    deferedSync.reject();
                    app.context.syncStatus = 'error';
                });
            } else {
                deferedSync.resolve();
                app.context.syncStatus = 'complete';
            }
        }).catch(function () {
            deferedSync.reject();
            app.context.syncStatus = 'error';
        });        
        
        return deferedSync.promise;
    };

    var performPatientSync = function () {
        var deferedSync = $q.defer();
        app.context.syncStatus = 'busy';
        UserStore.getUser().then(function (userData) {
            var userDataPayload = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                //photo: userData.photo,
                patients: userData.patients
            };
            ApiInvokerService.syncPatient(userDataPayload).then(function () {
                //NR: Reset is-edited flag on patients
                UserStore.resetPatientEditStatus().then(function () {
                    deferedSync.resolve();
                    app.context.syncStatus = 'complete';
                }).catch(function (error) {
                    deferedSync.reject();
                    app.context.syncStatus = 'error';
                });
            }).catch(function (error) {
                deferedSync.reject();
                app.context.syncStatus = 'error';
            });
        }).fail(function (error) {
            deferedSync.reject();
            app.context.syncStatus = 'error';
        });
        return deferedSync.promise;
    };

    var performConditionalPatientSync = function (allPatients) {
        var deferedSync = $q.defer();
        var isPatientSyncRequired = false;
        for (var i = 0; i < allPatients.length; i++) {
            patientEntry = allPatients[i];
            if (patientEntry.isEdited) {
                isPatientSyncRequired = true;
                break;
            }
        }
        if (isPatientSyncRequired) {
            performPatientSync().then(function () {
                deferedSync.resolve();
            }).catch(function () {
                app.log.error("Patient Sync failed, thereby terminating DB-Sync.");
                deferedSync.reject();
            });
        } else {
            deferedSync.resolve();
        }
        return deferedSync.promise;
    };

    var invokePatientDataSyncSequentially = function (patientsToSync) {
        var deferedSync = $q.defer();
        var sequentialSyncInvoker = function (patientsToSync, index, deferedCaller) {
            var patientEntry = patientsToSync[index];
            performSync(patientEntry.guid, "sequential", false).then(function () {
                index = index + 1;
                if (index < patientsToSync.length) {
                    sequentialSyncInvoker(patientsToSync, index, deferedCaller);
                } else {
                    deferedCaller.resolve();
                }
            }).catch(function () {
                deferedCaller.reject();
            });
        }
        if (patientsToSync && patientsToSync.length > 0) {
            sequentialSyncInvoker(patientsToSync, 0, deferedSync);
        } else {
            deferedSync.resolve();
        }        
        return deferedSync.promise;
    };

    var doFullSync = function () {
        var deferedSync = $q.defer();
        //NR: If Sync Not already running.
        if (app.context.fullSyncStatus !== 'busy') {
            app.context.fullSyncStatus = 'busy';
            var sequentialPromiseResolver = [];//$q.when();
            var isPatientSyncDoneAlready = false;
            //NR: Obtain Refreshed Auth Token Before inviking Sync.
            AuthenticationService.refreshToken().then(function () {
                var patientEntry, patientsToSync = [];
                //NR: Get all patients for syncing 
                UserStore.getAllPatients().then(function (allPatients) {
                    if (allPatients) {
                        //    Start db-sync only after patient is saved remotely (performConditionalPatientSync) & cluster is setup on remote db. [else will face authentication issue]
                        //    Sync is Required to be done only once per Sync Session.
                        performConditionalPatientSync(allPatients).then(function () {
                            for (var i = 0; i < allPatients.length; i++) {
                                patientEntry = allPatients[i];
                                if (patientEntry.isEdited) {
                                    //NR: If isEdited == true possiblity => new patient added / update existing ptient)    
                                    //NR: un-conditionally sync for edited patient data
                                    //sequentialPromiseResolver.push(performSync(patientEntry.guid, "sequential", false));
                                    patientsToSync.push(patientEntry);
                                } else if ((app.context.forceSync)          //NR: Sync Condition 1 : If Overriden
                                           || (patientEntry.syncStatus === "complete" && ((castToLongDate(new Date())) - patientEntry.syncStartDate) > app.config.syncInterval)         //NR: Sync Condition 2 : If last sync time exceeds the interval
                                           || (patientEntry.syncStatus === "busy" && ((castToLongDate(new Date())) - patientEntry.syncStartDate) > app.config.syncTimeout)              //NR: Sync Condition 3 : If last sync exceeds the timeout [hung or didnot finish in time]
                                           || (patientEntry.syncStatus === "error")         //NR: Sync Condition 4 : If last sync resulted an error
                                          ) {
                                    //sequentialPromiseResolver.push(performSync(patientEntry.guid, "sequential", false));                                    
                                    patientsToSync.push(patientEntry);
                                } //else {
                                 //   app.log.info("Sync will be attempted later for ");
                                 //   deferedSync.resolve();
                               // }
                            }
                            invokePatientDataSyncSequentially(patientsToSync).then(function () {
                                app.context.fullSyncStatus = 'complete';
                                deferedSync.resolve();
                            }).catch(function () {
                                app.context.fullSyncStatus = 'error';
                                deferedSync.reject();
                            });
                        }).catch(function () {
                            app.context.fullSyncStatus = 'error';
                            deferedSync.reject();
                        });                        
                    } else {
                        app.log.info("No Patients to sync !!");
                        app.context.fullSyncStatus = 'not-started';
                        deferedSync.resolve();
                    }

                }).catch(function (err) {
                    app.log.error("Error on Full sync !! [Error]" + err);
                    app.context.fullSyncStatus = 'error';
                    deferedSync.reject();
                });
            }).catch(function () {
                app.log.info("Sync Failed [Authentication Error]");
                app.context.fullSyncStatus = 'error';
                deferedSync.reject();
            });
        } else {
            app.log.info("Full Sync Already in Progress !! Skipping current call");
            deferedSync.resolve();
        }        
        return deferedSync.promise;
    };

    return {
        performSync: performSync,
        doInitialSync: doInitialSync,
        doFullSync: doFullSync
    };
});