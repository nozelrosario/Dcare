//NR: TODO: Implement functionality for notifying Sync events - onStart, onComplete.....etc. [Observer pattern ~ evenTriggers]
app.classes.data.SyncRegistry = new Singleton({
    initialize: function () {
        //NR: Singleton Only: Should be called only once
        this.syncDataStore = new DataStoreFactory({
                dataStoreName: 'SyncRegistry',
                dataAdapter: app.context.defaultDataAdapter,             //NR: TODO: Could be configurable based on custom adapter used
                adapterConfig: { auto_compaction: true }
        });
    },
    //var patients = [
    //                { id: 1, syncEntity: 'dc_q1kg0ohiiof6hn48l40w_medications', dataStoreName: "medications", dataCluster: "dc_q1kg0ohiiof6hn48l40w", syncStatus: "busy", syncMode: "pull", startTime: "", endTime: "" },
    //               ];
    enums: {
        syncStatus: {
            'notSynced': { label: 'Sync not performed', short_label: 'Not Synced', value: 'notSynced', image: 'img/sync-not-done.png' },
            'busy': { label: 'Data Sync is in progress', short_label: 'Busy', value: 'busy', image:'img/sync-busy.gif' },
            'error': { label: 'Error occured while performing data sync', short_label: 'Error', value: 'error', image: 'img/sync-fail.png' },
            'complete': { label: 'Data Sync complete', short_label: 'Complete', value: 'complete', image: 'img/sync-success.png' }
        }
    },
    registerSyncStatus: function (syncStatusInfo) {
        return this.syncDataStore.getDataStore().save(syncStatusInfo, { keyFields: ["syncEntity"], saveEmptyValues: false });
    },
    getSyncSummary: function () {
        return this.syncDataStore.getDataStore().getAllRows();
    }
});

// Alias for DataAdapterFactory
var SyncRegistry = app.classes.data.SyncRegistry;