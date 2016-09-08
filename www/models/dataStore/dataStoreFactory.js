app.classes.data.DataStoreFactory = new Class({
    initialize: function (config) {
        this.cachedStores = {};
        this.dataStoreConfig = config;
        this.dataStoreName = (config.dataStoreName) ? config.dataStoreName : app.log.error("DataStore Name cannot be empty"),
        this.dataAdapter = (config.dataAdapter) ? config.dataAdapter : "pouchDB",
        this.adapterConfig = (config.adapterConfig) ? config.adapterConfig : "";
    },
    getCluster: function () {
        return app.context.clusterID;
    },
    __instantiate_DataStore: function (dataStoreName) {
        var dataStoreAdapter;
        dataStoreAdapter = DataAdapterFactory.getAdapter(this.dataAdapter, dataStoreName, this.adapterConfig);
        dataStoreAdapter.openDataStore();
        return dataStoreAdapter.getDataStore();
    },
    getClusteredDataStore: function () {
        var requestedStore;
        if (app.context.clusterID) {
            app.log.debug("Switching to Cluster[" + this.getCluster() + "]");
            requestedStore = this.cachedStores[this.getCluster()];
            if (!requestedStore) {
                //NR: switch Store name to Clustered Store Name  [ dataStoreName_clusterID ]
                var clusterized_dataStoreName = this.dataStoreName + "_" + this.getCluster();
                requestedStore = this.__instantiate_DataStore(clusterized_dataStoreName);  //NR: Initialize DataStore based on current Cluster
                this.cachedStores[app.context.clusterID] = requestedStore;
            }
        } else {
            //NR: create a non_clustered Data store instead
            app.log.error("Cluster ID not set. Please Set a ClusterID in Application Context");            
        }
        return requestedStore;
    },
    getDataStore: function () {
        var requestedStore;
        if (this.dataStoreName) {
            requestedStore = this.cachedStores[this.dataStoreName];
            if (!requestedStore) {
                requestedStore = this.__instantiate_DataStore(this.dataStoreName);  //NR: Initialize  DataStore
                this.cachedStores[this.dataStoreName] = requestedStore;
            }
        } else {
            app.log.error("DataStore Name cannot be empty");
        }
        return requestedStore;
    }

});

// Alias for DataAdapterFactory
var DataStoreFactory = app.classes.data.DataStoreFactory;