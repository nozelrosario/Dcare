angular.module('dCare.Services.GlucoseStore', [])

/**
* A Patient Store service that returns patient data.
*/
.factory('GlucoseStore', function ($q, $filter) {  //NR: $filter is used for MOCK, remove it if not required later
    // Will call phonegap api for storing/retriving patient data and returns a JSON array
    var glucoseDataStore = new DataStore({
        dataStoreName: 'Glucose',
        dataAdapter: 'pouchDB',
        adapterConfig: { auto_compaction: true }
    });  // Initialize Glucose  DataStore

    var enums = {
        glucoseTypes: {
            'fasting': { label: 'Fasting blood sugar (FBS) / Before Meal', short_label: 'Fasting', value: 'fasting' },
            'postmeal': { label: 'Post Meal / 2hrs after Meal', short_label: 'Post Meal', value: 'postmeal' },
            'random': { label: 'Random / In between', short_label: 'Random', value: 'random' }
        }
    };
    // SAMPLE data
    //var glucoseList = [
	//                { id: 0, patientID: '1', glucosevalue: 165, glucoseType: 'fasting', datetime: '1288323623006', trend: 'high' },
	//                { id: 1, patientID: '1', glucosevalue: 125, glucoseType: 'fasting', datetime: '1289323623006', trend: 'low' },
	//                { id: 2, patientID: '2', glucosevalue: 140, glucoseType: 'fasting', datetime: '1298323623006', trend: 'high' },
	//                { id: 3, patientID: '4', glucosevalue: 198, glucoseType: 'fasting', datetime: '1288523623006', trend: 'equal' }
    //];

    var prepareLineGraphSeriesData = function (data, xFieldName, yFieldName) {
        var dataSeries = [];

        if (data && xFieldName && yFieldName) {
            for (var i = 0 ; i < data.length ; i++) {
                var row = data[i];
                dataSeries.push([(((row[xFieldName]) ? row[xFieldName] : "")), (((row[yFieldName]) ? row[yFieldName] : ""))]);
            }
        } else {
            dataSeries.push([]);
        }
        return (dataSeries);
    };
    return {
        enums: enums,
        getCount: function (patientID) {
            return glucoseDataStore.search({
                select: 'count(id)',
                where: "patientID = " + patientID
            });
        },
        getAllglucoseForPatient: function (patientID, fromDate, toDate) {
            var dataPromise;
            if (fromDate || toDate) {
                var query = "patientID=" + patientID;
                if (fromDate) query += " and datetime >=" + fromDate;
                if (toDate) query += " and datetime <=" + toDate;
                dataPromise = glucoseDataStore.search({
                    select: '*',
                    where: query + ""
                });

            } else {
                dataPromise = glucoseDataStore.search({
                    select: '*',
                    where: "patientID=" + patientID + ""
                });
            }
            return dataPromise;
        },
        getGlucoseByID: function (glucoseID) {
            return glucoseDataStore.getDataByID(glucoseID);
        },
        glucoseSparklineData: function (patientID) {
            // Search on patients
            var deferredFetch = $q.defer();
            var glucoseSparkline = {};
            glucoseSparkline.options = {
                type: 'line',
                height: '100%',
                width: '100%',
                lineColor: 'orange',
                spotColor: 'orange',
                spotRadius: 4,
                valueSpots: { ':100': 'red', '101:180': 'green', '180:': 'red' },
                fillColor: false,
                lineWidth: 3,
                normalRangeColor: 'rgba(70, 255, 30, 0.55)',
                normalRangeMin: 100, normalRangeMax: 160,
                chartRangeMin: 30,
                chartRangeMax: 200
            };
            ////NR:TODO:  Mock  ////
            var deferredFetch = $q.defer();
            glucoseDataStore.find({
                fields: ['datetime', 'glucoseType', 'patientID'],
                selector: { datetime: { '$exists': true }, patientID: { "$eq": parseInt(patientID) }, glucoseType: {"$eq":"fasting"}},
                sort: [{ 'datetime': 'desc' }],
                limit: 6
            }).then(function (data) {
                var glucoseValues = [];
                if (data) {
                    for (var i = 0 ; i < data.length ; i++) {
                        glucoseValues.push(data[i].glucosevalue);
                    }
                }                 
                glucoseSparkline.data = glucoseValues;
                deferredFetch.resolve(glucoseSparkline);  // glucoseSparkline.data = [130, 95, 126, 150, 180, 200];
            });
            return deferredFetch.promise;
        },
        getLineGraphDataForPatient: function (patientID, fromDate, toDate) {
            // Search on patients
            var deferredFetch = $q.defer();
            this.getAllglucoseForPatient(patientID, fromDate, toDate).then(function (data) {
                var fastingGlucoseData = $filter('filter')(data, { glucoseType: 'fasting' }, true);
                var postMealGlucoseData = $filter('filter')(data, { glucoseType: 'postmeal' }, true);
                var lineGraphData = [ { data: prepareLineGraphSeriesData(fastingGlucoseData, "datetime", "glucosevalue"), name: "Fasting" },
                                      { data: prepareLineGraphSeriesData(postMealGlucoseData, "datetime", "glucosevalue"), name: "Post-Meal" }
                                    ];
                deferredFetch.resolve(lineGraphData);
            });
            //SAMPLE// lineGraphData = [ {
            //                            name: "Fasting",
            //                            data: [[1083297600000, 130], [1085976000000, 126], [1088568000000, 150], [1091246400000, 180]]
            //                           },
            //                           {
            //                            name: "Post Meal",
            //                            data: [[1083297600000, 150], [1085976000000, 186], [1088568000000, 200], [1091246400000, 150]]
            //                           } ];
            return deferredFetch.promise;
        },
        getLatestGlucoseForPatient: function (patientID) {
            var deferredFetch = $q.defer();
            glucoseDataStore.find({
                fields: ['datetime', 'patientID'],
                selector: { datetime: { '$exists': true }, patientID: { "$eq": parseInt(patientID) } },
                sort: [{ 'datetime': 'desc' }],
                limit: 1
            }).then(function (data) {
                if (data) {
                    deferredFetch.resolve(data[0]);
                } else {
                    deferredFetch.resolve([]);
                }
            });
            return deferredFetch.promise;
        },
        getNextGlucoseForPatient: function (patientID, datetime) {
            var deferredFetch = $q.defer();
            glucoseDataStore.find({
                fields: ['datetime', 'patientID'],
                selector: { patientID: { "$eq": parseInt(patientID) }, datetime: {"$gt":datetime}},
                sort: [{ 'datetime': 'asc' }],
                limit: 1
            }).then(function (data) {
                if (data) {
                    deferredFetch.resolve(data[0]);
                } else {
                    deferredFetch.resolve([]);
                }
            });
            return deferredFetch.promise;
        },
        getPreviousGlucoseForPatient: function (patientID, datetime) {
            var deferredFetch = $q.defer();
            glucoseDataStore.find({
                fields: ['glucoseType', 'datetime', 'patientID'],
                selector : {    $and: [
                                        { datetime: { "$lte": datetime } },
                                        { datetime: { "$ne": datetime } },
                                        { patientID: { "$eq": parseInt(patientID) } },
                                        { glucoseType: { "$eq": 'fasting' } }
                                      ]
                            },
                //selector: { datetime: { "$lt": datetime }, patientID: { "$eq": parseInt(patientID) } , glucoseType: { "$eq": 'fasting' }},  // NR: </$lt operator has issues with pouch-find pliugin. hence using workaround [ < == (<= & !=)]
                sort: [{ 'datetime': 'desc' }],
                limit: 1
            }).then(function (data) {
                if (data) {
                    deferredFetch.resolve(data[0]);
                } else {
                    deferredFetch.resolve([]);
                }
            });
            return deferredFetch.promise;
        },
        save: function (glucose) {
            return glucoseDataStore.save(glucose);
        }

    }
});