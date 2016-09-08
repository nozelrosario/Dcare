angular.module('dCare.SyncManager', ['ionic',
                                     'dCare.Services.UserStore'])

.factory("SyncManagerService", function ($q, UserStore, $ionicLoading, $mdDialog) {
    var performSync = function (clusterID) {
        //NR: TODO: Stop any sync operation in progress, and restart
        //NR: TODO: update sync status upon sync start. [Detect if its an initial-Sync call or a Regular Sync. Based on it update both sync statuses]
        //NR: TODO: make dummy calls to local DB so as to create all the right Clustered-DB instances [Call DatastoreServices.init()]
    };

    var doInitialSync = function (clusterID,backgroundMode) {
        var deferedSync = $q.defer();
        UserStore.getPatient(clusterID).then(function (patientEntry) {
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

                performSync(clusterID).then(function () {
                    if (!backgroundMode) $ionicLoading.hide();
                    deferedSync.resolve();
                }).fail(function () {
                    if (!backgroundMode) $ionicLoading.hide();
                    deferedSync.reject();
                });

                if (backgroundMode) {
                    $mdDialog.show($mdDialog.alert()
                               .title('Data Sync..')
                               .content(syncStatus)
                               .ariaLabel(syncStatus)
                               .ok('OK!'));
                    deferedSync.reject();
                    //NR: Reject to indicate sync not complete.
                } else {
                    $ionicLoading.show({ template: '<md-progress-circular md-mode="indeterminate" md-diameter="70">' + syncStatus + '</md-progress-circular>', noBackdrop: false });
                }

            } else {
                deferedCheck.resolve();
            }
        }).fail(function () {
            deferedCheck.reject();
        });
        return deferedCheck.promise;
    };


    return {
        performSync: performSync,
        doInitialSync: doInitialSync
    };
});