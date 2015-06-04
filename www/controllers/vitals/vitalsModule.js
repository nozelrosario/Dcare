var vitalsModule = angular.module('dCare.vitals', ['ionic',
                                                     'patientsStore.services', 'vitalsStore.services',
                                                     'dCare.dateTimeBoxDirectives', 'highcharts-ng', 'dCare.jqueryDynameterDirectives', 'dCare.mobiscrollDirectives', 'dCare.jqueryKnobDirectives', 'dCare.addclearDirectives']);

//Controllers
vitalsModule.controller('VitalsSummaryController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $state, $stateParams, latestVitals, currentPatient, VitalsStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // Init Menu
    $scope.menuItems = [
                        { id: 1, title: 'Dashboard', subTitle: 'Your summary page', icon: 'ion-home' },
                        { id: 2, title: 'Vitals List', subTitle: 'List of all recorded vitals', icon: 'ion-person-add' },
                        { id: 3, title: 'Add New', subTitle: 'Add a new Vitals record', icon: 'ion-person-add' },
                        { id: 4, title: 'See Height Trend', subTitle: 'Height values graph', icon: 'ion-android-chat' },
                        { id: 5, title: 'See Weight Trend', subTitle: 'Weight values graph', icon: 'ion-android-chat' },
                        { id: 6, title: 'See BMI Trend', subTitle: 'BMI values graph', icon: 'ion-android-chat' },
                        { id: 7, title: 'See BP Trend', subTitle: 'Blood pressure values graph', icon: 'ion-android-chat' },
                        { id: 8, title: 'Alerts / Recomendations', subTitle: 'Your Messages & Alerts', icon: 'ion-android-chat' },
                        { id: 9, title: 'Settings', subTitle: 'Change Application preferences', icon: 'ion-gear-b' }
                       ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = VitalsStore.enums;

    // Init Data
    $scope.vitals = latestVitals;
    $scope.currentPatient = currentPatient;

    // Action Methods

    $scope.showVitalsList = function () {
        //TODO : implement height Weight page
        $state.go("vitalslist", { patientID: $scope.currentPatient.id, parentState: 'vitalsSummary' });
    };

    $scope.newVitals = function () {
        $state.go("vitalsForm", { patientID: $scope.currentPatient.id, parentState: 'vitalsSummary' });
    };

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 1:
                $state.go("dashboard", { patientID: $stateParams.patientID });
                break;
            case 2:
                $scope.showVitalsList();
                break;
            case 3:
                $scope.newVitals();
                break;
            case 4:
                $state.go("vitalstrend", { patientID: $scope.currentPatient.id, trendType: 'Height', unit: 'Cm', parentState: 'vitalsSummary' });
                break;
            case 5:
                $state.go("vitalstrend", { patientID: $scope.currentPatient.id, trendType: 'Weight', unit: 'Kg', parentState: 'vitalsSummary' });
                break;
            case 6:
                $state.go("vitalstrend", { patientID: $scope.currentPatient.id, trendType: 'BMI', unit: '', parentState: 'vitalsSummary' });
                break;
            case 7:
                $state.go("vitalstrend", { patientID: $scope.currentPatient.id, trendType: 'BP', unit: 'Cm', parentState: 'vitalsSummary' });
                break;
            case 8:
                alert('Messages/Notificaions');
                break;
            case 9:
                alert('Settings');
                break;
            default:
                alert('No Match');
        }
    };

    $scope.toggleActionsMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $ionicLoading.hide();
});

vitalsModule.controller('VitalsListController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $state, $stateParams, vitalsList, currentPatient, VitalsStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // Init Menu
    $scope.menuItems = [
                        { id: 1, title: 'Dashboard', subTitle: 'Your summary page', icon: 'ion-home' },
                        { id: 2, title: 'Vitals Summary', subTitle: 'Vitals summary page', icon: 'ion-home' },
                        { id: 3, title: 'Add New', subTitle: 'Add a new glucose measurement', icon: 'ion-person-add' },
                        { id: 4, title: 'Alerts / Recomendations', subTitle: 'Your Messages & Alerts', icon: 'ion-android-chat' },
                        { id: 5, title: 'Settings', subTitle: 'Change Application preferences', icon: 'ion-gear-b' }
    ];

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 1:
                $state.go("dashboard", { patientID: $stateParams.patientID });
                break;
            case 2:
                $scope.showVitalsSummary();
                break;
            case 3:
                $scope.newVitals();
                break;
            case 4:
                alert('Messages/Notificaions');
                break;
            case 5:
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
        //TODO : implement summary page
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


    $ionicLoading.hide();
});


vitalsModule.controller('VitalsFormController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $state, $stateParams, vitals, currentPatient, VitalsStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    //$scope.enums = VitalsStore.enums; // NR: nor required currently

    // Init Data
    $scope.currentPatient = currentPatient;
    if (vitals && vitals.id > 0) {
        $scope.vitals = vitals;
    } else {
        $scope.vitals = { patientID: $scope.currentPatient.id, heightunit: "Cm", weightunit: "Kg", datetime: (new Date()) };  // New entry : make any default values here if any
    }
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'vitalsSummary';

    $scope.calculateBMI = function () {
        // Metric Units: BMI = Weight (kg) / (Height (m) x Height (m))
        //English Units: BMI = Weight (lb) / (Height (in) x Height (in)) x 703
        //http://www.freebmicalculator.net/healthy-bmi.php
        if ($scope.vitals.weight > 0 && $scope.vitals.height > 0) {
            $scope.vitals.bmi = parseInt(($scope.vitals.height / $scope.vitals.weight) * $scope.vitals.height);
        } else {
            $scope.vitals.bmi = 0;
        }
    };

    $scope.validate = function () {

        //NR TODO : Validate and sow error and clear model values if needed

    };

    // Action Methods
    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
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

    $ionicLoading.hide();
});


vitalsModule.controller('VitalsTrendController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $state, $stateParams, vitalsTrendData, currentPatient, VitalsStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    

    // Init Menu


    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    //$scope.enums = VitalsStore.enums; //NR: not requred currently
    //  High Charts config

    // Init Data
    $scope.currentPatient = currentPatient;
    $scope.data = vitalsTrendData;
    $scope.trendType = $stateParams.trendType;
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'vitalsSummary';

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
    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $ionicLoading.hide();
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
                params: ['patientID', 'parentState']
            })
          .state('vitalslist', {
              resolve: {
                  vitalsList: function (VitalsStore, $stateParams) { return VitalsStore.getAllVitalsForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              //url: '/identificationInfo',  // cannot use as using params[]
              templateUrl: 'views/vitals/list.html',
              controller: 'VitalsListController',
              params: ['patientID', 'parentState']
          })
          .state('vitalsForm', {
              resolve: {
                  vitals: function (VitalsStore, $stateParams) { return VitalsStore.getVitalByID($stateParams.vitalsID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              //url: '/identificationInfo',  // cannot use as using params[]
              templateUrl: 'views/vitals/new_entry.html',
              controller: 'VitalsFormController',
              params: ['patientID','vitalsID','parentState']
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
              params: ['patientID', 'parentState','trendType', 'unit']
          });

});
