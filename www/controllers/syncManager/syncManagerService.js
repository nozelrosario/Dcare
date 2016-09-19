angular.module('dCare.SyncManager', ['ionic',
                                     'dCare.Services.UserStore'])

.factory("SyncManagerService", function ($q, UserStore, $ionicLoading, $mdDialog) {
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
                            if (index < _dataStoresToSync.length-1) {
                                sequentialSyncInvoker(_dataStoresToSync, index + 1, deferedCaller);
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
            });
        }).catch(function () {
            app.log.info("Unable to update sync status for cluster [" + clusterID + "]");
            deferedSync.reject();
        });
        //NR: TODO: Stop any sync operation in progress, and restart
        return deferedSync.promise;
    };

    var doInitialSync = function (patientGuid,backgroundMode) {
        var deferedSync = $q.defer();
        UserStore.getPatient(patientGuid).then(function (patientEntry) {
            var syncStatus;
            if (patientEntry.initialSyncStatus != "complete") {
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

                performSync(patientGuid, "sequential", true).then(function () {
                    if (!backgroundMode) $ionicLoading.hide();
                    deferedSync.resolve();
                }).catch(function () {
                    if (!backgroundMode) $ionicLoading.hide();
                    deferedSync.reject();
                });

                if (backgroundMode) {
                    if (backgroundMode !== "silent") {   //NR: For 'silent' mode do not show nitification.
                        $mdDialog.show($mdDialog.alert()
                                   .title('Data Sync..')
                                   .content(syncStatus)
                                   .ariaLabel(syncStatus)
                                   .ok('OK!'));
                    }
                    deferedSync.reject();
                    //NR: Reject to indicate sync not complete.
                } else {
                    $ionicLoading.show({ template: '<md-progress-circular md-mode="indeterminate" md-diameter="70">' + syncStatus + '</md-progress-circular>', noBackdrop: false });
                }

            } else {
                deferedSync.resolve();
            }
        }).catch(function () {
            deferedSync.reject();
        });
        return deferedSync.promise;
    };


    return {
        performSync: performSync,
        doInitialSync: doInitialSync
    };
});