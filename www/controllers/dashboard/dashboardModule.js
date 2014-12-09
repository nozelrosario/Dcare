var dashboardModule = angular.module('dCare.dashboard', ['ionic', 'patientsStore.services', 'vitalsStore.services']);

//Controllers
dashboardModule.controller('DashboardController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $state, $stateParams, patients, latestVitals, PatientsStore, VitalsStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // Init
    $scope.patients = patients;
    $scope.latestVitals = latestVitals;
    // Set current selected patient in context
    if ($stateParams.patientID && $stateParams.patientID !== "") {
        var patientDataPromise = PatientsStore.getPatientByID($stateParams.patientID);
        patientDataPromise.then(function (patient) {
            $scope.currentPatient = patient;
        });
    } else {
        $scope.currentPatient = patients[0];
    }

    $scope.glucose = {glucosevalue:165, type:'fasting', datetime:'12/12/2014 12:12 PM', isLastEntry:false, isFirstEntry:false};


    // Action Methods

    $scope.switchDashboardForPatient = function (patientID) {
        var vitalsDataPromise = VitalsStore.getLatestVitalsForPatient(patientID);
        vitalsDataPromise.then(function (vitals) {
            $scope.latestVitals = vitals;
        });

        var patientDataPromise = PatientsStore.getPatientByID(patientID);
        patientDataPromise.then(function (patient) {
            $scope.currentPatient = patient;
        });
    };

    $scope.toggleActionsMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.togglePatientsList = function () {
        $ionicSideMenuDelegate.toggleRight();
    };

    // else load data for first patient

    $ionicLoading.hide();
});





// Routings
dashboardModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('dashboard', {
            resolve: {
                patients: function (PatientsStore) { return PatientsStore.getAllPatients(); },
                latestVitals: function (VitalsStore, $stateParams) { return VitalsStore.getLatestVitalsForPatient($stateParams.patientID); }
            },
            //url: '/identificationInfo',  // cannot use as using params[]
            templateUrl: 'views/dashboard/dashboard.html',
            controller: 'DashboardController',
            params: ['patientID']
        });

});
