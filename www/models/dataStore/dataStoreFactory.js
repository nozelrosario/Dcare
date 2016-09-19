app.classes.data.DataStoreFactory = new Class({
    initialize: function (config) {
        this.cachedStores = {};
        this.dataStoreConfig = config;
        this.dataStoreName = (config.dataStoreName) ? config.dataStoreName : app.log.error("DataStore Name cannot be empty"),
        this.dataAdapter = (config.dataAdapter) ? config.dataAdapter : "pouchDB",
        this.adapterConfig = (config.adapterConfig) ? config.adapterConfig : "";
    },
    __instantiate_DataStore: function (dataStoreName) {
        var dataStoreAdapter;
        dataStoreAdapter = DataAdapterFactory.getAdapter(this.dataAdapter, dataStoreName, this.adapterConfig);
        dataStoreAdapter.openDataStore();
        return dataStoreAdapter;
    },
    __create_Clusterized_DataStoreName: function (clusterID) {
        //NR: clusterID used as part of DB name so following constraints applies. 
        //    => Only lowercase characters (a-z), digits (0-9) --[Enforced during GUID generation]
        //    => Any of the characters _, $, (, ), +, -, and / are allowed.  --[Enforced during GUID generation]
        //    => Must begin with a letter.  --[Enforced here]
        return "dc_" + clusterID + "_" + this.dataStoreName;
    },
    __bind_Sync_Events_For_Sync_Registration: function (dataStoreAdapter) {
        var me = this;
        dataStoreAdapter.addTrigger("sync-started", "register_sync_started", function (evtData) {
            var deferredStatusSaveCall = $.Deferred();
            SyncRegistry.registerSyncStatus({
                syncEntity: dataStoreAdapter.getDataStoreName(),
                dataStoreName: me.dataStoreName,
                dataCluster: dataStoreAdapter.clusterID,
                syncStatus: "busy",
                syncMode: evtData.syncInfo.mode,
                startTime: evtData.syncInfo.startTime
            }).then(function () {
                deferredStatusSaveCall.resolve();
            }).fail(function () {
                deferredStatusSaveCall.reject();
            });

            return deferredStatusSaveCall;
        });
        dataStoreAdapter.addTrigger("sync-complete", "register_sync_complete", function (evtData) {
            var deferredStatusSaveCall = $.Deferred();
            SyncRegistry.registerSyncStatus({
                syncEntity: dataStoreAdapter.getDataStoreName(),
                dataStoreName: me.dataStoreName,
                dataCluster: dataStoreAdapter.clusterID,
                syncStatus: "complete",
                syncMode: evtData.syncInfo.mode,
                endTime: evtData.syncInfo.endTime
            }).then(function () {
                deferredStatusSaveCall.resolve();
            }).fail(function () {
                deferredStatusSaveCall.reject();
            });

            return deferredStatusSaveCall;;
        });
        dataStoreAdapter.addTrigger("sync-error", "register_sync_error", function (evtData) {
            var deferredStatusSaveCall = $.Deferred();
            SyncRegistry.registerSyncStatus({
                syncEntity: dataStoreAdapter.getDataStoreName(),
                dataStoreName: me.dataStoreName,
                dataCluster: dataStoreAdapter.clusterID,
                syncStatus: "error",
                syncMode: evtData.syncInfo.mode,
                endTime: evtData.syncInfo.endTime
            }).then(function () {
                deferredStatusSaveCall.resolve();
            }).fail(function () {
                deferredStatusSaveCall.reject();
            });

            return deferredStatusSaveCall;;
        });
    },
    getDataStore: function (clusterID) {
        var requestedStore;
        if (clusterID) {
            app.log.debug("Switching to Cluster[" + clusterID + "] For [" + this.dataStoreName + "]");
            requestedStore = this.cachedStores[clusterID];
            if (!requestedStore) {
                //NR: switch Store name to Clustered Store Name  [ dataStoreName_clusterID ]
                
                requestedStore = this.__instantiate_DataStore(this.__create_Clusterized_DataStoreName(clusterID));  //NR: Initialize DataStore based on current Cluster
                this.cachedStores[clusterID] = requestedStore;
                //NR: Set cluster ID on dataStore for Reference
                requestedStore.clusterID = clusterID;
                this.__bind_Sync_Events_For_Sync_Registration(requestedStore);
            }            
        } else {
            //NR: create a non_clustered Data store instead
            if (this.dataStoreName) {
                app.log.debug("Switching to DataStore[" + this.dataStoreName + "]");
                requestedStore = this.cachedStores[this.dataStoreName];
                if (!requestedStore) {
                    requestedStore = this.__instantiate_DataStore(this.dataStoreName);  //NR: Initialize  DataStore
                    this.cachedStores[this.dataStoreName] = requestedStore;
                    //NR: Clear cluster ID on dataStore for non-clustered mode
                    requestedStore.clusterID = '';
                    this.__bind_Sync_Events_For_Sync_Registration(requestedStore);
                }
            } else {
                app.log.error("DataStore Name cannot be empty");
            }
        }
        return requestedStore;
    }

});

// Alias for DataAdapterFactory
var DataStoreFactory = app.classes.data.DataStoreFactory;