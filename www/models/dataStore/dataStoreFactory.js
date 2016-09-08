app.classes.data.DataStoreFactory = new Class({
    initialize: function (config) {
        this.cachedStores = {};
        this.dataStoreConfig = config;
    },
    getCluster: function () {
        return app.context.clusterID;
    },
    getDataStore: function () {
        var requestedStore;
        if (app.context.clusterID) {
            app.log.debug("Switching to Cluster[" + this.getCluster() + "]");
            requestedStore = this.cachedStores[this.getCluster()];
            if (!requestedStore) {
                //NR: switch Store name to Clustered Store Name
                var clustered_dataStoreConfig = $.extend({}, this.dataStoreConfig, { dataStoreName: this.dataStoreConfig.dataStoreName + "_" + this.getCluster() });
                requestedStore = new DataStore(clustered_dataStoreConfig);  //NR: Initialize Glucose  DataStore from current Cluster
                this.cachedStores[app.context.clusterID] = requestedStore;
            }
        } else {
            //NR: create a non_clustered Data store instead
            app.log.debug("Using Clustered Data store approach for non-clustered one. Please ");
            requestedStore = this.cachedStores['non-clustered'];
            if (!requestedStore) {
                requestedStore = new DataStore(this.dataStoreConfig);  //NR: Initialize Glucose  DataStore
            }
        }
        return requestedStore;
    }

});

// Alias for DataAdapterFactory
var DataStoreFactory = app.classes.data.DataStoreFactory;