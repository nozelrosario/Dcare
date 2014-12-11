var glucoseModule = angular.module('dCare.glucose', ['ionic',
                                                     'patientsStore.services', 'glucoseStore.services',
                                                     'dCare.dateTimeBoxDirectives']);

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
    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 1:
                $state.go("dashboard", { patientID: $stateParams.patientID });
                break;
            case 2:
                alert('Add New');
                break;
            case 3:
                alert('See Trend');
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
          });

});
