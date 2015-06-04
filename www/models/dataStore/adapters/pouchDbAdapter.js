app.classes.data.adapters.PouchDbAdapter = new Class({
	initialize: function(config) {
        var defaultConfig = {};
		this.adapterConfig = $.extend(defaultConfig,config);
		this.dataStore = null;
		
    },
	openDataStore : function(dataStoreName) {
		if(!this.dataStore){
			this.dataStoreName = dataStoreName;
			this.dataStore = new PouchDB(dataStoreName,this.adapterConfig);
		}
	},
	getDataStore: function () {
	    if (!this.dataStore) {
	        logger.error("Data store on open, please open datastore before use.");
	    }
	    return (this.dataStore);
	},
	__generateNewID: function() {
	    var deferredGenerate = $.Deferred();
        var maxID,newID;
        this.search({ select: "max(id)" }).then(function (data) {
                if (data && data.length > 0 && (data[0])['max(id)'] > 0) {
                    maxID = parseInt((data[0])['max(id)']);
                    newID = maxID + 1;
                    deferredGenerate.resolve(newID);
                } else {
                    deferredGenerate.resolve(1);
                }
        }).fail(function (err) {
            deferredGenerate.reject(err);
        });
        return deferredGenerate;
	},
	save : function (data) {
        var deferredSave = $.Deferred();
        if (!data.id) {
            var me = this;
            this.__generateNewID().then(function (id) {
                data._id = id.toString();   // maintain _id as String
                data.id = parseInt(id);              // maintain _id as Integer
                me.getDataStore().put(data).then(function (response) {
                    if (response.ok) {
                        deferredSave.resolve(data);
                    } else {
                        logger.error(err);
                        deferredSave.reject(response);
                    }
                    
                }).catch(function (err) {
                    logger.error(err);
                    deferredSave.reject(err);
                });
            }).fail(function (err) {
                logger.error(err);
                deferredSave.reject(err);
            });
        } else {
            data._id = data.id.toString();      // maintain _id as String
            this.getDataStore().put(data).then(function (response) {
                if (response.ok) {
                    deferredSave.resolve(data);
                } else {
                    logger.error(err);
                    deferredSave.reject(response);
                }
            }).catch(function (err) {
                logger.error(err);
                deferredSave.reject(err);
            });
        }
        return deferredSave;
    },
	    getDataByID : function (id) {
        var deferredFetch = $.Deferred();
        var me = this;
        if (id && id > 0) {
            this.getDataStore().get(id.toString()).then(function (data) {
                deferredFetch.resolve(data);
            }).catch(function (err) {
                logger.error("DataStore.getDataByID : error occured while querying " + me.dataStoreName + "[Error: " + err + "]");
                deferredFetch.resolve([]);
            });
        } else {
            logger.warn("DataStore.getDataByID : empty id not valid returning null data");
            deferredFetch.resolve([]);
        }
        return deferredFetch;
    },
	getRowsCount : function () {
        var deferredCount = $.Deferred();
        this.getDataStore().allDocs({ include_docs: false,attachments: false }).then(function (data) {
            if (data.total_rows) {
                deferredCount.resolve(data.total_rows);
            } else {
                logger.debug("DataStore.getRowsCount : total_rows not available in response data, returning 0");
                deferredCount.resolve(0);
            }
        }).catch(function (err) {
            logger.error("DataStore.getRowsCount : error occured while querying" + this.dataStoreName + "[Error: " + err + "]");
            deferredCount.resolve(0);
        });
        return deferredCount;
    },
	__extractDataFromBulk : function (data) {
        var cleanedData = [];
        for (row in data.rows) {
            cleanedData.push(data.rows[row].doc);
        }
        return cleanedData;
    },

    /* Gets all rows from DB
    */
    getAllRows : function () {
        var deferredFetch = $.Deferred();
        var me = this;
        this.getDataStore().allDocs({ include_docs: true, attachments: true }).then(function (data) {
            if (data.total_rows) {
                deferredFetch.resolve(me.__extractDataFromBulk(data));
            } else {
                logger.debug("DataStore.getAllRows : row count not available in response data, returning []");
                deferredFetch.resolve([]);
            }
        }).catch(function (err) {
            logger.error("DataStore.getAllRows : error occured while querying" + this.dataStoreName + "[Error: " + err + "]");
            deferredFetch.resolve([]);
        });
        return deferredFetch;
    },
    /*
    *GQL Query Syntax based querying
    */

	search : function (query) {
        var deferredQuery = $.Deferred();
        this.getDataStore().gql(query, function (err, data) {
            if (!err) {
                if (data.rows) {
                    deferredQuery.resolve(data.rows);
                } else {
                    deferredQuery.resolve(null);
                }

            } else {
                logger.error("DataStore.query : error occured while querying" + this.dataStoreName + "[Error: " + err + "]");
                deferredQuery.resolve(null);
            }
        });
        return deferredQuery;
	},
    /*
    *query: {fields,selector,sort,limit}
    */
    find : function (query) {
        var deferredQuery = $.Deferred();
        var me = this;
        this.getDataStore().createIndex({
            index: { fields: query.fields }
        }).then(function () {
            me.getDataStore().find({
                selector: query.selector,
                sort: query.sort,
                limit: query.limit
            }).then(function (result) {
                deferredQuery.resolve(result.docs);
            }).catch(function (err) {
                logger.error("DataStore.find : error occured while querying " + me.dataStoreName + "[Error: " + err + "]");
                deferredQuery.resolve(null);
            });
        }).catch(function (err) {
            logger.error("DataStore.find : error occured while creating Index " + me.dataStoreName + "[Error: " + err + "]");
            deferredQuery.resolve(null);
        });
        return deferredQuery;
    }

});

DataAdapterFactory.register("pouchDB", app.classes.data.adapters.PouchDbAdapter);