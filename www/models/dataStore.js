angular.module('dataStore.services', ['pouchdb'])
/**
* A Data Store service service that interacts with pouch DB for providing Data.
*/

.service('DataStore', function (pouchDB, $q) {
    this.dataStore = null;

    this.initDataStore = function (dataStoreName) {
        if (dataStoreName) {
            this.dataStoreName = dataStoreName;
            this.dataStore = pouchDB(dataStoreName);
        } else {
            alert('Please specify the data store name');
        }        
    };
    
    this.getDataStore = function () {
        if (this.dataStore) {
            return this.dataStore;
        } else {
            alert("Date Store not initialized");
            return null;
        }        
    };

    this.generateNewID = function () {
        var deferredQuery = $q.defer();
        var maxID,newID;
        this.getDataStore().gql({ select: "max(id)" }, function (err,data) {
            if (!err) {
                if (data.rows && data.rows.length > 0) {
                    maxID = parseInt((data.rows[0])['max(id)']);
                    newID = maxID + 1;
                    deferredQuery.resolve(newID);
                } else {
                    deferredQuery.resolve(1);
                }
                
            } else {
                deferredQuery.reject(err);
            }
        });
        return deferredQuery.promise;
    };

    this.save = function (data) {
        var deferredSave = $q.defer();
        if (!data.id) {
            var me = this;
            this.generateNewID().then(function (_id) {
                data._id = _id.toString();   // maintain _id as String
                data.id = _id;              // maintain _id as Integer
                me.getDataStore().put(data).then(function (response) {
                    if (response.ok) {
                        deferredSave.resolve(data);
                    } else {
                        me.errorHandler(err);
                        deferredSave.reject(response);
                    }
                    
                }).catch(function (err) {
                    this.errorHandler(err);
                    deferredSave.reject(err);
                });
            }, this.errorHandler);
        } else {
            data._id = data.id.toString();      // maintain _id as String
            this.getDataStore().put(data).then(function (response) {
                if (response.ok) {
                    deferredSave.resolve(data);
                } else {
                    this.errorHandler(err);
                    deferredSave.reject(response);
                }
            }).catch(function (err) {
                this.errorHandler(err);
                deferredSave.reject(err);
            });
        }
        return deferredSave.promise;
    };

    this.errorHandler = function (error) {
        console.log("DataStore :" + this.dataStoreName + "::" + error.toString());
    };

})



/*
* DataStore Config 
*/
.config(function (pouchDBProvider, POUCHDB_METHODS) {
    var PouchDBConfig = {  };
    pouchDBProvider.methods = angular.extend({}, POUCHDB_METHODS, PouchDBConfig);
});