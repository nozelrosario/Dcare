app.classes.data.adapters.IDbAdapter = new Class({
    initialize: function (dataStoreName, config) { },
	openDataStore : function() {},
	getDataStore: function () {},
    /** 
    * @public
    * Save : Saved Data to Data Store.
    *  @params: data: {object} json data to be saved
    *           config : {Object} Save config. 
    */
	save: function (data, config) {},
    /** 
    * @public
    * insertOrUpdate : insert Or Update Data to Data Store based on if ID exists in data object.
    *  @params: data: json data to be saved
    */
	insertOrUpdate : function (data) {},
	getDataByID : function (id) {},
	remove: function (id) {},
	getRowsCount : function () {},
    /** 
    * @public
    * getAllRows : Gets all rows from DB
    */
    getAllRows : function () {},
    search: function (query) { },
    find: function (query) { }
});