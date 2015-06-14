var glucoseModule = angular.module('dCare.glucose', ['ionic',
                                                     'patientsStore.services', 'glucoseStore.services',
                                                     'dCare.dateTimeBoxDirectives', 'highcharts-ng']);

//Controllers
glucoseModule.controller('GlucoseListController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $state, $stateParams, glucoseList, currentPatient, GlucoseStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // Init Menu
    $scope.menuItems = [
                        { id: 1, title: 'Dashboard', subTitle: 'Your summary page', icon: 'ion-home' },
                        { id: 2, title: 'Add New', subTitle: 'Add a new glucose measurement', icon: 'ion-person-add' },
                        { id: 3, title: 'See Trend', subTitle: 'Blood glucose graph', icon: 'ion-android-chat' },
                        { id: 4, title: 'Alerts / Recomendations', subTitle: 'Your Messages & Alerts', icon: 'ion-android-chat' },
                        { id: 5, title: 'Settings', subTitle: 'Change Application preferences', icon: 'ion-gear-b' }
                       ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = GlucoseStore.enums;

    // Init Data
    $scope.glucoseList = glucoseList;
    $scope.currentPatient = currentPatient;

    // Action Methods

    $scope.editGlucose = function (glucoseID) {
        $state.go("glucoseForm", { patientID: $scope.currentPatient.id, glucoseID: glucoseID, parentState: 'glucoselist' });
    };

    $scope.newGlucose = function () {
        $state.go("glucoseForm", { patientID: $scope.currentPatient.id, parentState: 'glucoselist' });
    };

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 1:
                $state.go("dashboard", { patientID: $stateParams.patientID });
                break;
            case 2:
                $scope.newGlucose();
                break;
            case 3:
                $state.go("glucosetrend", { patientID: $scope.currentPatient.id, parentState: 'glucoselist' });
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

    $scope.toggleActionsMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $ionicLoading.hide();
});



glucoseModule.controller('GlucoseFormController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $mdDialog, $state, $stateParams, glucose, currentPatient, GlucoseStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = GlucoseStore.enums;

    // Init Data
    $scope.currentPatient = currentPatient;
    if (glucose) {
        $scope.glucose = glucose;
    } else {
        $scope.glucose = { patientID: $scope.currentPatient.id };  // New entry : make any default values here if any
    }
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'glucoselist';

    // Action Methods
    $scope.changeState = function (glucose) {
        //$scope.glucose = glucose;
        // transition to next state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.save = function () {
        $scope.glucose.datetime = castToLongDate($scope.glucose.datetime)
        var saveGlucoseDataPromise = GlucoseStore.save($scope.glucose);
        saveGlucoseDataPromise.then($scope.changeState, $scope.saveFailed);

    };

    $scope.cancel = function () {
        // If required ask for confirmation
        $scope.changeState($scope.glucose);
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


glucoseModule.controller('GlucoseTrendController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $state, $stateParams, glucoseTrendData, currentPatient, GlucoseStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // Init Menu


    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = GlucoseStore.enums;
    //  High Charts config

    // Init Data
    $scope.currentPatient = currentPatient;
    $scope.data = glucoseTrendData;

    //  High Charts options

    $scope.glucoseChartConfig = {
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
                text: 'Glucose mg/dL'
            },
            min: 0,
            plotBands: [{ // Extreme High
                from: 180,
                to: 500,
                color: 'rgba(255, 137, 137, 0.15)',
                label: {
                    text: 'High Blood Glucose',
                    style: {
                        color: '#606060'
                    }
                }
            },
                 { // 
                from: 150,
                to: 180,
                color: 'rgba(255, 197, 70, 0.15)',
                label: {
                    text: 'Borderline Diabetic',
                    style: {
                        color: '#606060'
                    }
                }
            }, { // Normal
                from: 90,
                to: 150,
                color: 'rgba(70, 255, 30, 0.15)',
                label: {
                    text: 'Normal',
                    style: {
                        color: '#606060'
                    }
                }
            }, { // Low blood sugar
                from: 0,
                to: 90,
                color: 'rgba(255, 137, 137, 0.15)',
                label: {
                    text: 'Low Blood Sugar',
                    style: {
                        color: '#606060'
                    }
                }
            }]
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%e. %b}: {point.y:.2f} mg/dL'
        },
        title: {
            text: 'Glucose Trend over time'
        },
        subtitle: {
            text: 'Shows how did your glucose values perform'
        },
        series: $scope.data
    };

    

    // Action Methods

    $ionicLoading.hide();
});



// Routings
glucoseModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
          .state('glucoselist', {
              resolve: {
                  glucoseList: function (GlucoseStore, $stateParams) { return GlucoseStore.getAllglucoseForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              //url: '/identificationInfo',  // cannot use as using params[]
              templateUrl: 'views/glucose/list.html',
              controller: 'GlucoseListController',
              params: ['patientID']
          })
          .state('glucoseForm', {
              resolve: {
                  glucose: function (GlucoseStore, $stateParams) { return GlucoseStore.getGlucoseByID($stateParams.glucoseID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              //url: '/identificationInfo',  // cannot use as using params[]
              templateUrl: 'views/glucose/new_entry.html',
              controller: 'GlucoseFormController',
              params: ['patientID','glucoseID','parentState']
          })
          .state('glucosetrend', {
              resolve: {
                  glucoseTrendData: function (GlucoseStore, $stateParams) { return GlucoseStore.getLineGraphDataForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              //url: '/identificationInfo',  // cannot use as using params[]
              templateUrl: 'views/glucose/trend.html',
              controller: 'GlucoseTrendController',
              params: ['patientID', 'parentState']
          });

});
