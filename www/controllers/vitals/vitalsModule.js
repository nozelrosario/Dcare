var vitalsModule = angular.module('dCare.vitals', ['ionic',
                                                     'dCare.Services.PatientsStore', 'dCare.Services.VitalsStore',
                                                     'dCare.dateTimeBoxDirectives', 'highcharts-ng', 'dCare.jqueryDynameterDirectives', 'dCare.mobiscrollDirectives', 'dCare.jqueryKnobDirectives', 'dCare.addclearDirectives']);

//Controllers
vitalsModule.controller('VitalsSummaryController', function ($scope, $ionicSideMenuDelegate, $state, $stateParams, latestVitals, currentPatient, VitalsStore) {

    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'dashboard';

    // Init Menu
    $scope.menuItems = [
                        { seq: 1, id:"dashboard", title: 'Dashboard', subTitle: 'Your summary page', icon: 'ion-home' },
                        { seq: 2, id: "vitals_list", title: 'Vitals List', subTitle: 'List of all recorded vitals', icon: 'ion-person-add' },
                        { seq: 3, id: "new_vitals", title: 'Add New', subTitle: 'Add a new Vitals record', icon: 'ion-person-add' },
                        { seq: 4, id: "height_trend", title: 'See Height Trend', subTitle: 'Height values graph', icon: 'ion-android-chat' },
                        { seq: 5, id: "weight_trend", title: 'See Weight Trend', subTitle: 'Weight values graph', icon: 'ion-android-chat' },
                        { seq: 6, id: "bmi_trend", title: 'See BMI Trend', subTitle: 'BMI values graph', icon: 'ion-android-chat' },
                        { seq: 7, id: "bp_trend", title: 'See BP Trend', subTitle: 'Blood pressure values graph', icon: 'ion-android-chat' },
                        { seq: 8, id: "alerts", title: 'Alerts / Recomendations', subTitle: 'Your Messages & Alerts', icon: 'ion-android-chat' },
                        { seq: 9, id: "settings", title: 'Settings', subTitle: 'Change Application preferences', icon: 'ion-gear-b' }
                       ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = VitalsStore.enums;

    // Init Data
    $scope.vitals = latestVitals;
    $scope.currentPatient = currentPatient;

    // Action Methods

    $scope.showHelp = function () {
        $scope.showOverlayHelp = true;
    };

    $scope.showVitalsList = function () {
        //TODO : implement height Weight page
        $state.go("vitalslist", { patientID: $scope.currentPatient.id, parentState: 'vitalsSummary' });
    };

    $scope.newVitals = function () {
        $state.go("vitalsForm", { patientID: $scope.currentPatient.id, parentState: 'vitalsSummary' });
    };

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case "dashboard":
                $state.go("dashboard", { patientID: $stateParams.patientID });
                break;
            case "vitals_list":
                $scope.showVitalsList();
                break;
            case "new_vitals":
                $scope.newVitals();
                break;
            case "height_trend":
                $state.go("vitalstrend", { patientID: $scope.currentPatient.id, trendType: 'Height', unit: 'Cm', parentState: 'vitalsSummary' });
                break;
            case "weight_trend":
                $state.go("vitalstrend", { patientID: $scope.currentPatient.id, trendType: 'Weight', unit: 'Kg', parentState: 'vitalsSummary' });
                break;
            case "bmi_trend":
                $state.go("vitalstrend", { patientID: $scope.currentPatient.id, trendType: 'BMI', unit: '', parentState: 'vitalsSummary' });
                break;
            case "bp_trend":
                $state.go("vitalstrend", { patientID: $scope.currentPatient.id, trendType: 'BP', unit: 'Cm', parentState: 'vitalsSummary' });
                break;
            case "alerts":                
                alert('Messages/Notificaions');
                break;
            case "settings":
                alert('Settings');
                break;
            default:
                alert('No Match');
        }
    };

    $scope.toggleActionsMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    //Action Methods
    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "VitalsSummaryController") $scope.navigateBack();
    });    

});

vitalsModule.controller('VitalsListController', function ($scope, $ionicSideMenuDelegate, $state, $stateParams, vitalsList, currentPatient, VitalsStore) {

    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'vitalsSummary';

    // Init Menu
    $scope.menuItems = [
                        { seq: 1, id:"dashboard", title: 'Dashboard', subTitle: 'Your summary page', icon: 'ion-home' },
                        { seq: 2, id: "vitals_summary", title: 'Vitals Summary', subTitle: 'Vitals summary page', icon: 'ion-home' },
                        { seq: 3, id: "new_vitals", title: 'Add New', subTitle: 'Add a new Vitals record', icon: 'ion-person-add' },
                        { seq: 4, id: "height_trend", title: 'See Height Trend', subTitle: 'Height values graph', icon: 'ion-android-chat' },
                        { seq: 5, id: "weight_trend", title: 'See Weight Trend', subTitle: 'Weight values graph', icon: 'ion-android-chat' },
                        { seq: 6, id: "bmi_trend", title: 'See BMI Trend', subTitle: 'BMI values graph', icon: 'ion-android-chat' },
                        { seq: 7, id: "bp_trend", title: 'See BP Trend', subTitle: 'Blood pressure values graph', icon: 'ion-android-chat' },
                        { seq: 8, id: "alerts", title: 'Alerts / Recomendations', subTitle: 'Your Messages & Alerts', icon: 'ion-android-chat' },
                        { seq: 9, id: "settings", title: 'Settings', subTitle: 'Change Application preferences', icon: 'ion-gear-b' }
    ];

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case "dashboard":
                $state.go("dashboard", { patientID: $stateParams.patientID });
                break;
            case "vitals_summary":
                $scope.showVitalsSummary();
                break;
            case "new_vitals":
                $scope.newVitals();
                break;
            case "height_trend":
                $state.go("vitalstrend", { patientID: $scope.currentPatient.id, trendType: 'Height', unit: 'Cm', parentState: 'vitalsSummary' });
                break;
            case "weight_trend":
                $state.go("vitalstrend", { patientID: $scope.currentPatient.id, trendType: 'Weight', unit: 'Kg', parentState: 'vitalsSummary' });
                break;
            case "bmi_trend":
                $state.go("vitalstrend", { patientID: $scope.currentPatient.id, trendType: 'BMI', unit: '', parentState: 'vitalsSummary' });
                break;
            case "bp_trend":
                $state.go("vitalstrend", { patientID: $scope.currentPatient.id, trendType: 'BP', unit: 'Cm', parentState: 'vitalsSummary' });
                break;
            case "alerts":
                alert('Messages/Notificaions');
                break;
            case "settings":
                alert('Settings');
                break;
            default:
                alert('No Match');
        }
    };

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    //$scope.enums = VitalsStore.enums; // No Enums currentlly, may be in future.

    // Init Data
    $scope.vitalsList = vitalsList;
    $scope.currentPatient = currentPatient;

    // Action Methods
    $scope.showVitalsSummary = function () {
        //TODO : implement summary page Fully
        $state.go("vitalsSummary", { patientID: $scope.currentPatient.id, parentState: 'dashboard' });
    };

    $scope.editVitals = function (vitalsID) {
        $state.go("vitalsForm", { patientID: $scope.currentPatient.id, vitalsID: vitalsID, parentState: 'vitalslist' });
    };

    $scope.newVitals = function () {
        $state.go("vitalsForm", { patientID: $scope.currentPatient.id, parentState: 'vitalslist' });
    };

    $scope.toggleActionsMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "VitalsListController") $scope.navigateBack();
    });

});


vitalsModule.controller('VitalsFormController', function ($scope, $ionicLoading, $state, $stateParams, vitals, latestVitals, currentPatient, VitalsStore) {

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    //$scope.enums = VitalsStore.enums; // NR: nor required currently

    // Init Data
    $scope.currentPatient = currentPatient;
    if (vitals && vitals.id > 0) {
        $scope.vitals = vitals;
    } else if (latestVitals && latestVitals.id) {
        $scope.vitals = { patientID: $scope.currentPatient.id, height: latestVitals.height, heightunit: "Cm", weight: latestVitals.weight, weightunit: "Kg", datetime: castToLongDate(new Date()) };  // New entry : pre-fill with latest recorded height & weight
    } else {
        $scope.vitals = { patientID: $scope.currentPatient.id, heightunit: "Cm", weightunit: "Kg", datetime: castToLongDate(new Date()) };  // New entry : pre-fill only date
    }
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'vitalsSummary';

    $scope.calculateBMI = function () {
        // Metric Units: BMI = Weight (kg) / (Height (m) x Height (m))
        //English Units: BMI = Weight (lb) / (Height (in) x Height (in)) x 703
        //http://www.freebmicalculator.net/healthy-bmi.php
        if ($scope.vitals.weight > 0 && $scope.vitals.height > 0) {
            $scope.vitals.bmi = parseInt($scope.vitals.weight / (($scope.vitals.height / 100) * ($scope.vitals.height / 100)));   //NR: convert height to meter & calculate
        } else {
            $scope.vitals.bmi = 0;
        }
    };

    

    $scope.validate = function () {

        //NR TODO : Validate and sow error and clear model values if needed

    };
 

    $scope.changeState = function (vitals) {
        // vitals = updated new vital from DB
        //$scope.glucose = vitals;
        // transition to next state
        $scope.navigateBack();
    };

    $scope.save = function () {
        $scope.vitals.datetime = (angular.isDate($scope.vitals.datetime)) ? Date.parse($scope.vitals.datetime) : ((typeof $scope.vitals.datetime) == "number" ) ? $scope.vitals.datetime : ""; // Parse date to long format
        $scope.vitals.height = parseInt($scope.vitals.height);
        $scope.calculateBMI();
        var saveVitalsDataPromise = VitalsStore.save($scope.vitals);
        saveVitalsDataPromise.then($scope.changeState, $scope.saveFailed);

    };

    $scope.cancel = function () {
        // If required ask for confirmation
        $scope.changeState($scope.vitals);
    };

    $scope.saveFailed = function (errorMessage) {
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + errorMessage)
                               .ariaLabel(errorMessage)
                               .ok('OK!'));
    };

    $scope.getHeartRate = function () {
        var props;
        try {
            var seconds = prompt("HeartRate Config Seconds ", "10");
            var fps = prompt("HeartRate Config FPS ", "30");
            props = { seconds: parseInt(seconds), fps: parseInt(fps) };
        }
        catch (e) {
            alert("Setting Default : {seconds: 10, fps: 30}");
            props = { seconds: 10, fps: 30 };
        }

        if (cordova.plugins.heartbeat) {
            alert("cordova.plugins.heartbeat : " + JSON.stringify(props));
            $ionicLoading.show({ template: '<md-progress-circular md-mode="indeterminate" md-diameter="70"></md-progress-circular>', noBackdrop: false });
            cordova.plugins.heartbeat.take(props, function successCallback(bpm) {
                $ionicLoading.hide();
                $scope.vitals.heartRate = bpm;
                console.log("heart Rate = " + bpm);
            }, function errorCallback(err) {
                alert("Is not posible measure your heart beat : " + err);
            });
        } else {
            alert("Plugin not registered correctly");
        }
    };

    //Action Methods
    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "VitalsFormController") $scope.navigateBack();
    });
});


vitalsModule.controller('VitalsTrendController', function ($scope, $ionicSideMenuDelegate, $state, $stateParams, vitalsTrendData, currentPatient, VitalsStore) {

    // Init Menu


    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    //$scope.enums = VitalsStore.enums; //NR: not requred currently
    //  High Charts config

    // Init Data
    $scope.currentPatient = currentPatient;
    $scope.data = vitalsTrendData;
    $scope.trendType = $stateParams.trendType;
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'vitalsSummary';
    $scope.dateFilter = {};

    //  High Charts options

    $scope.vitalsChartConfig = {
        chart: {
                   type: 'lineChart',
                   spacingTop:0,
                   spacingBottom:0,
                   spacingRight:50,
                   spacingLeft:0,
                   marginTop:0,
                   marginBottom:0,
                   marginRight:50,
                   marginLeft:0
               },
        xAxis: {
                   type: 'datetime',
                   dateTimeLabelFormats: { // don't display the dummy year
                                        month: '%e. %b',
                                        year: '%b'
                                     },
                   title: {
                          text: 'Date'
                   }
               },
     yAxis: {
        title: {
            text: 'Height (' + $stateParams.unit + ')'
            },
        min: 0
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%e. %b}: {point.y:.2f} ' + $stateParams.unit
        },
        title: {
            text: $stateParams.trendType + ' Trend over time'
        },
        subtitle: {
            text: 'Shows range of ' + $stateParams.trendType  + ' values over time'
        },
        series: $scope.data
    };

    
    

    // Action Methods

    $scope.filterDataOnDate = function () {
        fromDate = castToLongDate($scope.dateFilter.fromDate);
        toDate = castToLongDate($scope.dateFilter.toDate);
        var graphDataPromise;
        switch ($stateParams.trendType) {
            case "Height": graphDataPromise = VitalsStore.getGraphDataForHeight($scope.currentPatient.id, fromDate, toDate); break;
            case "Weight": graphDataPromise = VitalsStore.getGraphDataForWeight($scope.currentPatient.id, fromDate, toDate); break;
            case "BMI": graphDataPromise = VitalsStore.getGraphDataForBMI($scope.currentPatient.id, fromDate, toDate); break;
            case "BP": graphDataPromise = VitalsStore.getGraphDataForBP($scope.currentPatient.id, fromDate, toDate); break;
        }
        if (graphDataPromise) {
            graphDataPromise.then(function (filteredData) {
                $scope.data = filteredData;
                $scope.vitalsChartConfig.series = $scope.data;
            });
        }
    };


    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "VitalsTrendController") $scope.navigateBack();
    });
});



// Routings
vitalsModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
            .state('vitalsSummary', {
                resolve: {
                    latestVitals: function (VitalsStore, $stateParams) { return VitalsStore.getLatestVitalsForPatient($stateParams.patientID); },
                    currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
                },
                //url: '/identificationInfo',  // cannot use as using params[]
                templateUrl: 'views/vitals/vitals_summary.html',
                controller: 'VitalsSummaryController',
                params: { 'patientID': null, 'parentState': null }
            })
          .state('vitalslist', {
              resolve: {
                  vitalsList: function (VitalsStore, $stateParams) { return VitalsStore.getAllVitalsForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              //url: '/identificationInfo',  // cannot use as using params[]
              templateUrl: 'views/vitals/list.html',
              controller: 'VitalsListController',
              params: { 'patientID': null, 'parentState': null }
          })
          .state('vitalsForm', {
              resolve: {
                  vitals: function (VitalsStore, $stateParams) { return VitalsStore.getVitalByID($stateParams.vitalsID); },
                  latestVitals: function (VitalsStore, $stateParams) { return VitalsStore.getLatestVitalsForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              //url: '/identificationInfo',  // cannot use as using params[]
              templateUrl: 'views/vitals/new_entry.html',
              controller: 'VitalsFormController',
              params: { 'patientID': null, 'vitalsID': null, 'parentState': null }
          })
          .state('vitalstrend', {
              resolve: {
                  vitalsTrendData: function (VitalsStore, $stateParams) {
                      if ($stateParams.trendType) {
                          switch ($stateParams.trendType) {
                              case "Height": return VitalsStore.getGraphDataForHeight($stateParams.patientID);
                              case "Weight": return VitalsStore.getGraphDataForWeight($stateParams.patientID);
                              case "BMI": return VitalsStore.getGraphDataForBMI($stateParams.patientID);
                              case "BP": return VitalsStore.getGraphDataForBP($stateParams.patientID);
                          }
                      } else {
                          alert("TrendType empty for Vitals Trend.");
                      }
                      
                  },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              //url: '/identificationInfo',  // cannot use as using params[]
              templateUrl: 'views/vitals/trend.html',
              controller: 'VitalsTrendController',
              params: { 'patientID': null, 'parentState': null, 'trendType': null, 'unit': null }
          });

});
