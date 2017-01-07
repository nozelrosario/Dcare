angular.module('dCare.Services.SettingsStore', [])

/**
* A Patient Store service that returns patient data.
*/
.factory('SettingsStore', function ($q, $filter) {  //NR: $filter is used for MOCK, remove it if not required later
    // Will call phonegap api for storing/retriving patient data and returns a JSON array
    var settingsDataStore = new DataStoreFactory({
        dataStoreName: 'settings',
        dataAdapter: app.context.defaultDataAdapter,
        adapterConfig: { auto_compaction: true }
    });  // Initialize meals  DataStore

    var enums = {};
    // SAMPLE data
    /*var mealsList = [
                    { id: 0, key: 'syncInterval', value: '0' }
    ];*/
    
    return {
        enums: enums,
        init: function () {
            var deferredInit = $q.defer();
            if (settingsDataStore.getDataStore()) {
                deferredInit.resolve();
            } else {
                deferredInit.reject();
            }
            return deferredInit.promise;
        },
        exists: function (key) {
            var deferredGet = $q.defer();
            settingsDataStore.getDataStore().search({
                select: 'count(id)',
                where: "key = '" + key + "'"
            }).then(function (settingData) {
                if (settingData && settingData.length > 0) {
                    if ((settingData[0])['count(id)'] > 0) {
                        deferredGet.resolve(true);
                    } else {
                        deferredGet.resolve(false);
                    }                    
                } else {
                    deferredGet.resolve(false);
                }
            }).fail(function (settingData) {
                deferredGet.reject();
            });
            return deferredGet.promise;
        },
        get: function (key) {
            var deferredGet = $q.defer();
            settingsDataStore.getDataStore().search({
                select: '*',
                where: "key = '" + key + "'"
            }).then(function (settingData) {
                if (settingData && settingData.length > 0) {
                    deferredGet.resolve((settingData[0]).value);
                } else {
                    deferredGet.reject();
                }
            }).fail(function () {
                deferredGet.reject();
            });
            return deferredGet.promise;
        },
        save: function (key, value) {
            var setting = {'key': key, 'value': value };
            var deferredSave = $q.defer();
            settingsDataStore.getDataStore().save(setting, { keyFields: ["key"], saveEmptyValues: true }).then(function (settingData) {
                deferredSave.resolve("Setting saved successfully!");
            }).fail(function (err) {
                deferredSave.resolve("Settings save failed!!");
            });
            return deferredSave.promise;            
        }//,
        //remove: function (key) {
        //    return settingsDataStore.getDataStore().remove(mealID);
        //}

    }
});