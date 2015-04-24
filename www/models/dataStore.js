angular.module('dataStore.services', ['pouchdb'])
/**
* A Data Store service service that interacts with pouch DB for providing Data.
*/

.service('service', function (pouchDB) {
    var db = pouchDB('name');
})



/*
* DataStore Config 
*/
.config(function ($logProvider, pouchDBProvider, POUCHDB_METHODS) {
    $logProvider.debugEnabled(true);
    var authMethods = {
        login: 'qify',
        logout: 'qify',
        getUser: 'qify'
    };
    pouchDBProvider.methods = angular.extend({}, POUCHDB_METHODS, authMethods);
});