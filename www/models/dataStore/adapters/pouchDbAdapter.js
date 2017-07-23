// Implements IDBAdapter
app.classes.data.adapters.PouchDbAdapter = new Class({
    include: app.classes.data.eventTriggers,
    initialize: function (dataStoreName, config) {
        var defaultConfig = { cache: false };
	    this.dataStoreName = (dataStoreName) ? dataStoreName : app.log.error("DataStore Name cannot be empty"),
		this.adapterConfig = $.extend(defaultConfig,config);
		this.dataStore = null;
		
    },
	openDataStore : function() {
		if(!this.dataStore){
			this.dataStore = new PouchDB(this.dataStoreName, this.adapterConfig);
		}
	},
	getDataStore: function () {
	    if (!this.dataStore) {
	        app.log.error("Data store not open, please open datastore before use.");
	    }
	    return (this.dataStore);
	},
	getDataStoreName: function () {
	    return this.dataStoreName;
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

    /** 
    * @public
    * Save : Saved Data to Data Store.
    *  @params: data: {object} json data to be saved
    *           config : {Object} Save config. Eg.{ keyFields : [field1, field2], saveEmptyValues: true,...  } }
                         optional parameter that control the data save process w.r.t insert/update , persist empty values etc.
                                keyFields : {Array} specifies an array of fieldnames that will be matched to decide whether to insert new record or update.(Default is 'id')
                                saveEmptyValues : {bool} Specifies if to save/overwrite null/empty values while updating record. Eg.
                                    when set false & oldData = {'a': 1, 'b': 2, 'c': 3 } newData = {'a': 4, 'b': 5, 'd':6 } => resultantData = {'a': 4, 'b': 5, 'd':6, 'c': 3 }
                                    when set  true & oldData = {'a': 1, 'b': 2, 'c': 3 } newData = {'a': 4, 'b': 5, 'd':6 } => resultantData = {'a': 4, 'b': 5, 'd':6 } 
    */
	save: function (data, config) {
	    var deferredSave = $.Deferred();
	    if (config && config.keyFields) {
	        var fieldName, fieldValue, queryCondition = "";
	        var me = this, newDataToBeSaved=null;
	        if (config.keyFields.length > 0) {
                //NR: Query builder
	            for (var i = 0 ; i < config.keyFields.length ; i++) {
	                fieldName = config.keyFields[i]
	                fieldValue = data[fieldName];
	                if (i > 0 && queryCondition != "") queryCondition = queryCondition + " and ";
	                if (fieldValue && fieldValue != "") {
	                    if (typeof (fieldValue) === "string") fieldValue = "'" + fieldValue + "'";      //NR: format value for string comparison in query
	                    queryCondition = queryCondition + fieldName + "=" + fieldValue;
	                } else {
	                    queryCondition = queryCondition + fieldName + "=" + "''";
	                }
	            }
	            me.search({ select: "*", where: queryCondition }).then(function (matchedDataItem) {
	                var matchedData;
                    //NR: Check records that match against query
	                if ((matchedDataItem instanceof Array) && matchedDataItem.length > 0) {
	                    matchedData = matchedDataItem[0];   //NR: ignore records other than 1st one
	                } else {
	                    matchedData = matchedDataItem;      //NR: will be null or empty array, so assign as is
	                }
                    //NR: If data matching composite keys exists, fill required data from previous copy.
	                if (matchedData && matchedData.id) {	                    
	                    if (config && config.saveEmptyValues) {
	                        //NR: do not fill empty properties with exixting data
	                        newDataToBeSaved = data;
	                    } else {
	                        $.extend(matchedData, data);    //NR: merge data properties of existing data with new data.
	                        newDataToBeSaved = matchedData;
	                    }
	                    //NR: push ID to the data object. Overwrite id & rev in order to force update.
	                    newDataToBeSaved.id = matchedData.id;           
	                    newDataToBeSaved._rev = matchedData._rev;
	                } else {
	                    //NR: If no data matching composite keys exists, Save data as is.
	                    newDataToBeSaved = data;
	                }

                    //NR: Save Data
	                me.insertOrUpdate(newDataToBeSaved).then(function (savedData) {
	                    deferredSave.resolve(savedData);
	                }).fail(function (err) {
	                    deferredSave.reject(err);
	                });
	            });

	        }
	    } else {
	        //NR: Self rectifying & recursive call to Save Data [As per PouchDB specifications i.e 'put' should be called as result of 'get' for Updates]
	        this.save(data, { keyFields: ["id"], saveEmptyValues: false }).then(function (savedData) {
	            deferredSave.resolve(savedData);
	        }).fail(function (err) {
	            deferredSave.reject(err);
	        });
	    }
	    return deferredSave;
	},
    /** 
    * @private
    * insertOrUpdate : insert Or Update Data to Data Store based on if ID exists in data object.
    *  @params: data: json data to be saved
    */
	insertOrUpdate : function (data) {
	    var deferredSave = $.Deferred();
	    var me = this;
	    var attachmentData = null;
	    var saveAttachmentIfExists = function (docId, rev, attachment) {
	        //NR: https://pouchdb.com/api.html#save_attachment
	        var deferredSaveAttachment = $.Deferred();	        
	        if (docId && attachment) {
	            if (attachment.attachmentId && attachment.binary) {
	                attachment.type = attachment.type || 'application/octet-stream'; //NR: Default to "application/octet-stream" if not supplied
	                if (rev) {
	                    me.getDataStore().putAttachment(docId, attachment.attachmentId, rev, attachment.binary, attachment.type).then(function (result) {
	                        deferredSaveAttachment.resolve();
	                    }).catch(function (err) {
	                        app.log.error("Failed add attachment on Data Store [" + me.getDataStoreName() + "]");
	                        deferredSaveAttachment.reject(err);
	                    });
	                } else {
	                    //NR: This will never be the case."rev" will always be available.
	                    //      Including this just to avoid any errors.
	                    me.getDataStore().putAttachment(docId, attachment.attachmentId, attachment.binary, attachment.type).then(function (result) {
	                        deferredSaveAttachment.resolve();
	                    }).catch(function (err) {
	                        app.log.error("Failed add attachment on Data Store [" + me.getDataStoreName() + "]");
	                        deferredSaveAttachment.reject(err);
	                    });
	                }	                
	            } else {
	                app.log.error("Attachment Data Invalid!!. Failed add attachment on Data Store [" + me.getDataStoreName() + "]");
	                app.log.error(attachment);
	                deferredSaveAttachment.reject();
	            }	            
	        } else {
                //NR: If attachment not present, skip and proceed.
	            deferredSaveAttachment.resolve();
	        }
	        return deferredSaveAttachment;
	    };

	    this.trigger("before-save", { data: data });                                // Trigger Before-Save Event	    

	    //NR: Check if data has attachment included!
	    if (data.attachment) {
	        attachmentData = data.attachment;
	        delete data.attachment; //NR: Clear attachment property from data, else it will be pushed to document as it is.
	    }
        // perform Insert Or Update
	    if (!data.id) {	        
            this.__generateNewID().then(function (id) {
                data._id = id.toString();   // maintain _id as String
                data.id = parseInt(id);              // maintain _id as Integer
                me.trigger("before-insert", { data: data });                        // Trigger Before-Insert Event                
                me.getDataStore().put(data).then(function (response) {
                    if (response.ok) {
                        saveAttachmentIfExists(response.id, response.rev, attachmentData).then(function () {
                            me.trigger("after-insert", { data: data });                 // Trigger After-Insert Event
                            me.trigger("after-save", { data: data });                   // Trigger After-Save Event
                            deferredSave.resolve(data);
                        }).fail(function (err) {
                            me.trigger("after-insert", { data: data });                 // Trigger After-Insert Event
                            me.trigger("after-save", { data: data });                   // Trigger After-Save Event
                            deferredSave.reject(response);
                        });                        
                    } else {
                        app.log.error("Failed response from insert on Data Store [" + me.getDataStoreName() + "]");
                        app.log.error(err);
                        deferredSave.reject(response);
                    }
                    
                }).catch(function (err) {
                    app.log.error("Failed call to insert on Data Store [" + me.getDataStoreName() + "]");
                    app.log.error(err);
                    deferredSave.reject(err);
                });
            }).fail(function (err) {
                app.log.error("Failed __generateNewID() while insert on Data Store [" + me.getDataStoreName() + "]");
                app.log.error(err);
                deferredSave.reject(err);
            });
        } else {
            data._id = data.id.toString();      // maintain _id as String
            this.trigger("before-update", { data: data });                          // Trigger Before-Update Event
            this.getDataStore().put(data).then(function (response) {
                if (response.ok) {
                    saveAttachmentIfExists(response.id, response.rev, attachmentData).then(function () {
                        me.trigger("after-update", { data: data });                     // Trigger After-Update Event
                        me.trigger("after-save", { data: data });                       // Trigger After-Save Event
                        deferredSave.resolve(data);
                    }).fail(function (err) {
                        me.trigger("after-update", { data: data });                     // Trigger After-Update Event
                        me.trigger("after-save", { data: data });                       // Trigger After-Save Event
                        deferredSave.reject(data);
                    });                                       
                } else {
                    app.log.error("Failed response from update on Data Store [" + me.getDataStoreName() + "]");
                    app.log.error(err);
                    deferredSave.reject(response);
                }
            }).catch(function (err) {
                app.log.error("Failed call to update on Data Store [" + me.getDataStoreName() + "]");
                app.log.error(err);
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
                app.log.error("DataStore.getDataByID : error occured while querying " + me.getDataStoreName() + " [Error: " + err + "]");
                deferredFetch.resolve(null);
            });
        } else {
            app.log.warn("DataStore.getDataByID : empty id not valid returning null data");
            deferredFetch.resolve(null);
        }
        return deferredFetch;
	},
	getAttachmentDataByID: function (id, attachmentId) {
	    var deferredFetch = $.Deferred();
	    var me = this;
	    if (id && id > 0 && attachmentId) {
	        this.getDataStore().getAttachment(id.toString(), attachmentId).then(function (data) {
	            deferredFetch.resolve(data);
	        }).catch(function (err) {
	            app.log.error("DataStore.getAttachmentDataByID : error occured while querying " + me.getDataStoreName() + " [Error: " + err + "]");
	            deferredFetch.resolve(null);
	        });
	    } else {
	        app.log.warn("DataStore.getAttachmentDataByID : empty id not valid returning null data");
	        deferredFetch.resolve(null);
	    }
	    return deferredFetch;
	},
	remove: function (id) {
	    var deferredDelete = $.Deferred(),
	        me = this;
	    this.getDataByID(id).then(function (data) {
	        me.trigger("before-delete", { data: data });                     // Trigger Before-Delete Event
	        me.getDataStore().remove(data, function (err, response) {
	            if (err) {
	                app.log.error("DataStore.deleteByID : failed to delete data from" + me.getDataStoreName() + " [Error: " + err + "]");
	                deferredDelete.reject(err);
	            } else {
	                me.trigger("after-delete", { data: data });              // Trigger After-Detele Event
	                deferredDelete.resolve(data);
	            }
	        });	        
	    }).fail(function (err) {
	        app.log.error("DataStore.deleteByID on " + me.getDataStoreName() + " : failed to delete data, Unable to find specified record");
	        deferredDelete.reject(err);
	    });
	    return deferredDelete;
	},
	getRowsCount : function () {
        var deferredCount = $.Deferred();
        this.getDataStore().allDocs({ include_docs: false,attachments: false }).then(function (data) {
            if (data.total_rows) {
                deferredCount.resolve(data.total_rows);
            } else {
                app.log.debug("DataStore.getRowsCount : total_rows not available in response data, returning 0");
                deferredCount.resolve(0);
            }
        }).catch(function (err) {
            app.log.error("DataStore.getRowsCount : error occured while querying" + this.dataStoreName + "[Error: " + err + "]");
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
                app.log.debug("DataStore.getAllRows : row count not available in response data, returning []");
                deferredFetch.resolve([]);
            }
        }).catch(function (err) {
            app.log.error("DataStore.getAllRows : error occured while querying" + this.dataStoreName + "[Error: " + err + "]");
            deferredFetch.resolve([]);
        });
        return deferredFetch;
    },

    /*
    * GQL Query Syntax based querying
    * API : https://pouchdb.com/gql.html   AND  https://cloud.google.com/datastore/docs/apis/gql/gql_reference
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
                app.log.error("DataStore.query : error occured while querying" + this.dataStoreName + "[Error: " + err + "]");
                deferredQuery.resolve(null);
            }
        });
        return deferredQuery;
	},
    /*
    *query: {fields,selector,sort,limit}
    * API : 
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
                app.log.error("DataStore.find : error occured while querying " + me.dataStoreName + "[Error: " + err + "]");
                deferredQuery.resolve(null);
            });
        }).catch(function (err) {
            app.log.error("DataStore.find : error occured while creating Index " + me.dataStoreName + "[Error: " + err + "]");
            deferredQuery.resolve(null);
        });
        return deferredQuery;
    },

    /*
    * Device => Server Sync
    */

    syncTo: function (remoteHost) {
        var deferredSync = $.Deferred();        
        var syncOptions = app.config.syncOptions;
        var dbAuthCookie = app.context.dbAuthCookie;
        var remoteDB_URI = remoteHost + '/' + this.dataStoreName;
        var remoteDB = new PouchDB(remoteDB_URI, {
            ajax: { headers: { 'x-access-token': dbAuthCookie } }
        });
        var me = this;
        var syncInfo = { remoteURI: remoteDB, dataStoreName: this.dataStoreName, mode: "push", startTime: castToLongDate(new Date()) };
        me.trigger("sync-started", { syncInfo: syncInfo }).then(function () {     // Trigger Sync-Started Event
            app.log.info("Starting Push-Sync for DataStore [" + me.dataStoreName + "]");
            me.getDataStore().replicate.to(remoteDB, syncOptions).then(function (syncResult) {
                syncInfo.result = syncResult;
                syncInfo.endTime = castToLongDate(new Date());
                // Trigger Sync-Complete Event
                me.trigger("sync-complete", { syncInfo: syncInfo }).then(function () {
                    deferredSync.resolve(syncResult);
                }).fail(function () {
                    deferredSync.reject();
                });              
                
            }).catch(function (error) {
                syncInfo.error = error;
                syncInfo.endTime = castToLongDate(new Date());
                // Trigger Sync-Error Event
                me.trigger("sync-error", { syncInfo: syncInfo }).then(function () {
                    deferredSync.resolve(syncResult);
                }).fail(function () {
                    deferredSync.reject();
                });
            });
        }).fail(function () {
            deferredSync.reject();
        });
        
        return deferredSync;
    },
    /*
    * Server => Device Sync
    */

    syncFrom: function (remoteHost) {
        var deferredSync = $.Deferred();
        var syncOptions = app.config.syncOptions;
        var dbAuthCookie = app.context.dbAuthCookie;
        var remoteDB_URI = remoteHost + '/' + this.dataStoreName;
        var remoteDB = new PouchDB(remoteDB_URI, {
            ajax: { headers: { 'x-access-token': dbAuthCookie } }
        });
        var me = this;
        var syncInfo = { remoteURI: remoteDB, dataStoreName: this.dataStoreName, mode: "pull", startTime: castToLongDate(new Date()) };
        me.trigger("sync-started", { syncInfo: syncInfo }).then(function () {     // Trigger Sync-Started Event
            app.log.info("Starting Pull-Sync for DataStore [" + me.dataStoreName + "]");
            me.getDataStore().replicate.from(remoteDB, syncOptions).then(function (syncResult) {
                syncInfo.result = syncResult;
                syncInfo.endTime = castToLongDate(new Date());
                // Trigger Sync-Complete Event
                me.trigger("sync-complete", { syncInfo: syncInfo }).then(function () {
                    deferredSync.resolve(syncResult);
                }).fail(function () {
                    deferredSync.reject();
                });              
                deferredSync.resolve(syncResult);
            }).catch(function (error) {
                syncInfo.error = error;
                syncInfo.endTime = castToLongDate(new Date());
                // Trigger Sync-Error Event
                me.trigger("sync-error", { syncInfo: syncInfo }).then(function () {
                    deferredSync.resolve(syncResult);
                }).fail(function () {
                    deferredSync.reject();
                });                 
                deferredSync.reject(error);
            });
        }).fail(function () {
            deferredSync.reject();
        });
        
        return deferredSync;
    },

    sync: function (remoteHost) {
        var deferredSync = $.Deferred();
        var me = this;
        me.syncTo(remoteHost).then(function () {
            me.syncFrom(remoteHost).then(function () {
                deferredSync.resolve();
            }).fail(function () {
                deferredSync.reject();
            });
        }).fail(function () {
            deferredSync.reject();
        });
        return deferredSync;
    }

    /*
    * Device <=> Server Sync
    */

    /*sync: function (remoteHost) {
        var deferredSync = $.Deferred();
        var syncOptions = app.config.syncOptions;
        var dbAuthCookie = app.context.dbAuthCookie;
        var remoteDB_URI = remoteHost + '/' + this.dataStoreName;
        var remoteDB = new PouchDB(remoteDB_URI, {
            ajax: { headers: { 'x-access-token': dbAuthCookie } }
        });
        var me = this;
        var syncInfo = { remoteURI: remoteDB, dataStoreName: this.dataStoreName, mode: "push-pull", startTime: castToLongDate(new Date()) };
        me.trigger("sync-started", { syncInfo: syncInfo }).then(function () {     // Trigger Sync-Started Event
            app.log.info("Starting Sync for DataStore [" + me.dataStoreName + "]");
            me.getDataStore().replicate.sync(remoteDB, syncOptions).then(function (syncResult) {
                syncInfo.result = syncResult;
                syncInfo.endTime = castToLongDate(new Date());
                // Trigger Sync-Complete Event
                me.trigger("sync-complete", { syncInfo: syncInfo }).then(function () {
                    deferredSync.resolve(syncResult);
                }).fail(function () {
                    deferredSync.reject();
                });              
                deferredSync.resolve(syncResult);
            }).catch(function (error) {
                syncInfo.error = error;
                syncInfo.endTime = castToLongDate(new Date());
                // Trigger Sync-Error Event
                me.trigger("sync-error", { syncInfo: syncInfo }).then(function () {
                    deferredSync.resolve(syncResult);
                }).fail(function () {
                    deferredSync.reject();
                });;                 
                deferredSync.reject(error);
            });
        }).fail(function () {
            deferredSync.reject();
        });
        
        return deferredSync;
    }*/
});

DataAdapterFactory.register("pouchDB", app.classes.data.adapters.PouchDbAdapter);

// POUCH DB Logging
if (app.LOGGING_LEVEL === "off") {
    PouchDB.debug.disable("*");
} else {
    PouchDB.debug.enable('*'); // "pouchdb:find","pouchdb:api"
}
