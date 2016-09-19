angular.module('dCare.Services.MealsStore', [])

/**
* A Patient Store service that returns patient data.
*/
.factory('MealsStore', function ($q, $filter) {  //NR: $filter is used for MOCK, remove it if not required later
    // Will call phonegap api for storing/retriving patient data and returns a JSON array
    var mealsDataStore = new DataStoreFactory({
        dataStoreName: 'meals',
        dataAdapter: app.context.defaultDataAdapter,
        adapterConfig: { auto_compaction: true }
    });  // Initialize meals  DataStore

    var enums = {
        quantityUnit: {
            'gm': { label: 'Gram', short_label: 'gm', value: 'gm' },
            'ml': { label: 'ML', short_label: 'ml', value: 'ml' },
            'tablespoon': { label: 'Tablespoon', short_label: 'tbl.Sp', value: 'tablespoon' },
            'piece': { label: 'Piece(s)', short_label: 'pc', value: 'piece' },
            'cup': { label: 'Cup(s)', short_label: 'cup', value: 'cup' },
            'glass': { label: 'glass(s)', short_label: 'glass', value: 'glass' }
        }
    };
    // SAMPLE data
    /*var mealsList = [
                    { id: 0, patientID: '1', mealSummary: '25gm Rice & 1glass Milk', mealDetails: [{ foodItem: 'Rice', quantityUnit: 'gm',quantity: '25', calories: '105' }, { foodItem: 'Milk', quantityUnit: 'glass',quantity: '1', calories: '100' }], totalCalories: '205', datetime: '1288323623006' },
                    { id: 1, patientID: '1', mealSummary: '1glass Milk', mealDetails: [{ foodItem: 'Milk', quantityUnit: 'glass',quantity: '1', calories: '100' }], totalCalories: '100', datetime: '1289323623006' },
                    { id: 2, patientID: '2', mealSummary: '3Piece(s) Pizza & 2tablespoon Syrup', mealDetails: [{ foodItem: 'Pizza', quantityUnit: 'piece',quantity: '3', calories: '200' }, { foodItem: 'Syrup', quantityUnit: 'tablespoon',quantity: '2', calories: '14' }], totalCalories: '214', datetime: '1298323623006' },
                    { id: 3, patientID: '4', mealSummary: '3Piece(s) Pizza', mealDetails: [{ foodItem: 'Pizza', quantityUnit: 'piece',quantity: '3', calories: '200' }], totalCalories: '200', datetime: '1288523623006' }
    ];*/
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
        init: function () {
            var deferredInit = $q.defer();
            if (mealsDataStore.getDataStore(app.context.getCurrentCluster())) {
                deferredInit.resolve();
            } else {
                deferredInit.reject();
            }
            return deferredInit.promise;
        },
        getCount: function (patientID) {
            return mealsDataStore.getDataStore(app.context.getCurrentCluster()).search({
                select: 'count(id)',
                where: "patientID = " + patientID
            });
        },
        getAllMealsForPatient: function (patientID, fromDate, toDate) {
            var dataPromise;
            if (fromDate || toDate) {
                var query = "patientID=" + patientID;
                if (fromDate) query += " and datetime >=" + fromDate;
                if (toDate) query += " and datetime <=" + toDate;
                dataPromise = mealsDataStore.getDataStore(app.context.getCurrentCluster()).search({
                    select: '*',
                    where: query + ""
                });

            } else {
                dataPromise = mealsDataStore.getDataStore(app.context.getCurrentCluster()).search({
                    select: '*',
                    where: "patientID=" + patientID + ""
                });
            }
            return dataPromise;
        },
        getMealByID: function (mealID) {
            return mealsDataStore.getDataStore(app.context.getCurrentCluster()).getDataByID(mealID);
        },
        getLatestMealForPatient: function (patientID) {
            var deferredFetch = $q.defer();
            mealsDataStore.getDataStore(app.context.getCurrentCluster()).find({
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
        getLineGraphDataForPatient: function (patientID, fromDate, toDate) {
            // Search on patients
            var deferredFetch = $q.defer();
            this.getAllMealsForPatient(patientID, fromDate, toDate).then(function (data) {
                var calorieseData = $filter('filter')(data, { totalCalories: '!' }, true);
                var lineGraphData = [{ data: prepareLineGraphSeriesData(calorieseData, "datetime", "totalCalories"), name: "Calories Consumed" }];
                deferredFetch.resolve(lineGraphData);
            });
            //SAMPLE// lineGraphData = [ {
            //                            name: "Calories",
            //                            data: [[1083297600000, 130], [1085976000000, 126], [1088568000000, 150], [1091246400000, 180]]
            //                           }];
            return deferredFetch.promise;
        },
        save: function (meal) {
            return mealsDataStore.getDataStore(app.context.getCurrentCluster()).save(meal);
        },
        remove: function (mealID) {
            return mealsDataStore.getDataStore(app.context.getCurrentCluster()).remove(mealID);
        }

    }
});