var dashboardModule = angular.module('dCare.dashboard', ['ionic',
                                                         'patientsStore.services', 'vitalsStore.services', 'glucoseStore.services',
                                                         'dCare.glucose', 'dCare.medications',
                                                         'dCare.dateTimeBoxDirectives', 'dCare.jqSparklineDirectives']);

//Controllers
dashboardModule.controller('DashboardController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $state, $stateParams, allPatients, defaultPatient, latestVitals, latestGlucose, glucoseSparklineData, PatientsStore, VitalsStore, GlucoseStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // Init Menu
    $scope.menuItems = [
                        { id: 1, title: 'Dashboard', subTitle: 'Your summary page', icon: 'ion-home' },
                        { id: 2, title: 'Add a Loved one', subTitle: 'Add a new person you care for', icon: 'ion-person-add' },
                        { id: 3, title: 'Blood Glucose', subTitle: 'Blood glucose tracker', icon: 'ion-android-chat' },
                        { id: 4, title: 'Medications', subTitle: 'Medications', icon: 'ion-android-chat' },
                        { id: 5, title: 'Messages/Notificaions', subTitle: 'Your Messages & Alerts', icon: 'ion-android-chat' },
                        { id: 6, title: 'Settings', subTitle: 'Change Application preferences', icon: 'ion-gear-b' },
                        { id: 7, title: 'About', subTitle: 'Know more about contributers', icon: 'ion-information-circled' }
                       ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = GlucoseStore.enums;

    // Init Data
    $scope.patients = allPatients;
    $scope.latestVitals = latestVitals;
    $scope.glucose = latestGlucose;
    $scope.glucoseTrend = glucoseSparklineData; // glucoseSparklineData = {data:[], options:{}}


    if (!defaultPatient) {
        $scope.currentPatient = allPatients[0];
    } else {
        $scope.currentPatient = defaultPatient;
    }


    // Action Methods
    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 1:
                alert('Dashboard');
                break;
            case 2:
                alert('Add Patient');
                break;
            case 3:
                $state.go("glucoselist", { patientID: $scope.currentPatient.id });
                break;
            case 4:
                $state.go("medicationslist", { patientID: $scope.currentPatient.id });
                break;
            case 5:
                alert('Messages/Notificaions');
                break;
            case 6:
                alert('Settings');
                break;
            case 7:
                alert('About');
                break;
            default:
                alert('No Match');
        }
    };

    $scope.switchDashboardForPatient = function (patientID) {
        var vitalsDataPromise = VitalsStore.getLatestVitalsForPatient(patientID);
        vitalsDataPromise.then(function (vitals) {
            $scope.latestVitals = vitals;
        });

        var patientDataPromise = PatientsStore.getPatientByID(patientID);
        patientDataPromise.then(function (patient) {
            $scope.currentPatient = patient;
        });

        var glucoseDataPromise = GlucoseStore.getLatestGlucoseForPatient(patientID);
        glucoseDataPromise.then(function (glucose) {
            $scope.glucose = glucose;
        });
    };

    $scope.addNewGlucoseEntry = function () {
        $state.go("glucoseForm", { patientID: $scope.currentPatient.id, parentState: 'dashboard' });

    };


    $scope.getNextGlucose = function () {
        var glucoseNextDataPromise = GlucoseStore.getNextGlucoseForPatient($scope.currentPatient.id, $scope.glucose.datetime);
        glucoseNextDataPromise.then(function (glucose) {
            $scope.glucose = glucose;
        });
    };

    $scope.getPreviousGlucose = function (patientID, datetime) {
        var glucosePreviousDataPromise = GlucoseStore.getPreviousGlucoseForPatient($scope.currentPatient.id, $scope.glucose.datetime);
        glucosePreviousDataPromise.then(function (glucose) {
            $scope.glucose = glucose;
        });
    };

    $scope.toggleActionsMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.togglePatientsList = function () {
        $ionicSideMenuDelegate.toggleRight();
    };

    $scope.openTrend = function () {
        $state.go("glucosetrend", { patientID: $scope.currentPatient.id, parentState: 'dashboard' });
    };

    $ionicLoading.hide();
});





// Routings
dashboardModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('dashboard', {
            resolve: {
                defaultPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); },
                allPatients: function (PatientsStore) { return PatientsStore.getAllPatients(); },
                latestVitals: function (VitalsStore, $stateParams) { return VitalsStore.getLatestVitalsForPatient($stateParams.patientID); },
                latestGlucose: function (GlucoseStore, $stateParams) { return GlucoseStore.getLatestGlucoseForPatient($stateParams.patientID); },
                glucoseSparklineData: function (GlucoseStore, $stateParams) { return GlucoseStore.glucoseSparklineData($stateParams.patientID); }
            },
            //url: '/identificationInfo',  // cannot use as using params[]
            templateUrl: 'views/dashboard/dashboard.html',
            controller: 'DashboardController',
            params: ['patientID']
        });

});
