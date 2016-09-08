app.classes.data.DataAdapterFactory = new Singleton({
	initialize: function() {
        this.registeredAdapters = {};
    },
    /**
    * Rgisters a new Data adapter
    * @params: adapterName: {String} : Adapter name (unique identifier for adapter)
    *          adapterClass: {IDBAdapter} : Class Definition for Creating instance of respective Data Adapter
    */
	register: function (adapterName, adapterClass) {
		this.registeredAdapters[adapterName] = adapterClass;
	},
	getAdapter: function(adapterName, adapterConfig) {
		var adapter ;
		if(this.registeredAdapters[adapterName]) {
			adapter = new (this.registeredAdapters[adapterName])(adapterConfig);
		} else {
			app.log.error("Data Adapter '" + adapterName +"' unavailable !! ");
			adapter = null;
		}
		return adapter;
	}
	
});

// Alias for DataAdapterFactory
var DataAdapterFactory = app.classes.data.DataAdapterFactory;