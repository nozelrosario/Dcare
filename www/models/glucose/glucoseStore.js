angular.module('glucoseStore.services', [])

/**
* A Patient Store service that returns patient data.
*/
.factory('GlucoseStore', function ($q, $filter) {  //NR: $filter is used for MOCK, remove it if not required later
    // Will call phonegap api for storing/retriving patient data and returns a JSON array
    var enums = {
        glucoseTypes: {
            'fasting': { label: 'Fasting blood sugar (FBS) / Before Meal', short_label: 'Fasting', value: 'fasting' },
            'postmeal': { label: 'Post Meal / 2hrs after Meal', short_label: 'Post Meal', value: 'postmeal' },
            'random': { label: 'Random / In between', short_label: 'Random', value: 'random' }
        }
    };
    // Some fake testing data
    var glucoseList = [
	                { id: 0, patientID: '1', glucosevalue: 165, type: 'fasting', datetime: '1288323623006', trend: 'high' },
	                { id: 1, patientID: '1', glucosevalue: 125, type: 'fasting', datetime: '1289323623006', trend: 'low' },
	                { id: 2, patientID: '2', glucosevalue: 140, type: 'fasting', datetime: '1298323623006', trend: 'high' },
	                { id: 3, patientID: '4', glucosevalue: 198, type: 'fasting', datetime: '1288523623006', trend: 'equal' }
	                ];

    return {
        enums: enums,
        getCount: function () {
            var deferredCount = $q.defer();

            ////NR:TODO:  Mock  ////
            var count = 4; // fire query for count
            ////NR:TODO:  Mock  ////

            deferredCount.resolve(count);
            return deferredCount.promise;
        },
        getAllglucoseForPatient: function (patientID) {
            var deferredFetchAll = $q.defer();

            ////NR:TODO:  Mock  ////
            var allglucose = $filter('filter')(glucoseList, { patientID: patientID }, true);
            ////NR:TODO:  Mock  ////

            deferredFetchAll.resolve(allglucose);
            return deferredFetchAll.promise;
        },
        getGlucoseByID: function (glucoseID) {
            // Search on patients
            var deferredFetch = $q.defer();

            ////NR:TODO:  Mock  ////
            var glucoseByID;
            if (glucoseID && glucoseID !== "") {
                glucoseByID = ($filter('filter')(glucoseList, { id: JSON.parse(glucoseID) }, true))[0];
            } else {
                glucoseByID = null;
            }
            ////NR:TODO:  Mock  ////

            deferredFetch.resolve(glucoseByID);
            return deferredFetch.promise;
        },
        glucoseSparklineData: function (patientID) {
            // Search on patients
            var deferredFetch = $q.defer();
            var glucoseSparkline = {};
            ////NR:TODO:  Mock  ////
            glucoseSparkline.data = [130, 95, 126, 150, 180, 200];
            glucoseSparkline.options = { type: 'line',
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

            deferredFetch.resolve(glucoseSparkline);
            return deferredFetch.promise;
        },
        getLineGraphDataForPatient: function (patientID) {
            // Search on patients
            var deferredFetch = $q.defer();

            ////NR:TODO:  Mock  ////
            var lineGraphData = [
                                    {
                                        name: "Fasting",
                                        data: [[1083297600000, 130], [1085976000000, 126], [1088568000000, 150], [1091246400000, 180]]
                                    },
                                    {
                                        name: "Post Meal",
                                        data: [[1083297600000, 150], [1085976000000, 186], [1088568000000, 200], [1091246400000, 150]]
                                    }
                                ];
            ////NR:TODO:  Mock  ////

            deferredFetch.resolve(lineGraphData);
            return deferredFetch.promise;
        },
        getLatestGlucoseForPatient: function (patientID) {
            // Search on patients
            var deferredFetch = $q.defer();

            ////NR:TODO:  Mock  ////
            var latestglucose = glucoseList[1];
            ////NR:TODO:  Mock  ////

            deferredFetch.resolve(latestglucose);
            return deferredFetch.promise;
        },
        getNextGlucoseForPatient: function (patientID, datetime) {
            // Search on patients
            var deferredFetch = $q.defer();

            ////NR:TODO:  Mock  ////
            var nextGlucose = glucoseList[1];
            nextGlucose.isLastEntry = false;
            nextGlucose.isFirstEntry = false;
            ////NR:TODO:  Mock  ////

            deferredFetch.resolve(nextGlucose);
            return deferredFetch.promise;
        },
        getPreviousGlucoseForPatient: function (patientID, datetime) {
            // Search on patients
            var deferredFetch = $q.defer();

            ////NR:TODO:  Mock  ////
            var previousGlucose = glucoseList[1];
            previousGlucose.isLastEntry = false;
            previousGlucose.isFirstEntry = false;
            ////NR:TODO:  Mock  ////

            deferredFetch.resolve(previousGlucose);
            return deferredFetch.promise;
        },
        save: function (glucose) {
            // execute deferred / return promise
            var deferredSave = $q.defer();

            if (glucose) {
                if (!glucose.id || glucose.id <= 0) {
                    // Insert data & get the id of inserted patient along with complete inserted data

                    ////NR:TODO:  Mock  ////

                    console.log("Mock Insert : setting id=4");
                    var newglucose = glucose;
                    newglucose.id = 4;
                    glucoseList.push(newglucose);
                    ////NR:TODO:  Mock  ////

                    deferredSave.resolve(newglucose);
                } else {
                    // update data

                    console.log("Mock Update : return as it is");
                    deferredSave.resolve(glucose);
                }
            } else {

                deferredSave.reject("Error Code 00001");

            }
            return deferredSave.promise;
        }

    }
});