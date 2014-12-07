var dashboardModule = angular.module('dCare.dashboard', ['ionic', 'patientsStore.services', 'vitalsStore.services']);

//Controllers
dashboardModule.controller('DashboardController', function ($scope, $ionicLoading,$ionicSideMenuDelegate, $state, $stateParams, patients) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    $scope.patients = patients;
    $scope.toggleActionsMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.togglePatientsList = function () {
        $ionicSideMenuDelegate.toggleRight();
    };
    // check state params for patient ID , if present load data for that patient
    // else load data for first patient

    $ionicLoading.hide();
});





// Routings
dashboardModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('dashboard', {
            resolve: {
                patients: function (PatientsStore) { return PatientsStore.getAllPatients(); },
                vitals: function (VitalsStore, $stateParams) { return VitalsStore.getLatestVitalsForPatient($stateParams.patientID); }
            },
            //url: '/identificationInfo',  // cannot use as using params[]
            templateUrl: 'views/dashboard/dashboard.html',
            controller: 'DashboardController',
            params: ['patientID']
        });

});
