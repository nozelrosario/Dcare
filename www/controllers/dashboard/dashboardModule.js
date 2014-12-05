var dashboardModule = angular.module('dCare.dashboard', ['ionic', 'patientsStore.services' , 'vitalsStore.services']);

//Controllers
dashboardModule.controller('DashboardController', function ($scope, $ionicLoading, PatientsStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });
    //$ionicLoading.hide();
});





// Routings
dashboardModule.config(function ($stateProvider, $urlRouterProvider, PatientsStore, VitalsStore) {

    $stateProvider
        .state('dashboard', {
            resolve: {
                patients: PatientsStore.getAllPatients(),
                vitals: VitalsStore.getLatestVitalsForPatient($stateParams.patientID)
            },
            //url: '/identificationInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/identification_info.html',
            controller: 'IdentificationInfoController',
            params: ['patientID']
        });

});
