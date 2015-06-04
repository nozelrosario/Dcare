app.classes.data.DataAdapterFactory = new Singleton({
	initialize: function() {
        this.registeredAdapters = {};
    },
	register: function(adapterName, adapterClass) {
		this.registeredAdapters[adapterName] = adapterClass;
	},
	getAdapter: function(adapterName, adapterConfig) {
		var adapter ;
		if(this.registeredAdapters[adapterName]) {
			adapter = new (this.registeredAdapters[adapterName])(adapterConfig);
		} else {
			logger.error("Data Adapter '" + adapterName +"' unavailable !! ");
			adapter = null;
		}
		return adapter;
	}
	
});

// Alias for DataAdapterFactory
var DataAdapterFactory = app.classes.data.DataAdapterFactory;