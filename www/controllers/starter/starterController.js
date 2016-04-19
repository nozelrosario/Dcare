angular.module('starter.controllers', ['ionic', 'dCare.Services.PatientsStore'])

.controller('StarterController', function ($scope, $rootScope, $ionicLoading, $ionicPlatform, PatientsStore, $state) {

    $scope.changeState = function (patientCount) {
        if (patientCount < 1) {
            $state.go("registration", {isFirstRun:true});
            //$state.go("registration", { isFirstRun:false, patientID: 2 });   // in case need to call for existing patient
        } else {
            $state.go("dashboard", { patientID:1 });
        }
    };
    
    $scope.isFirstRun = false;
    var getCountPromise = PatientsStore.getCount();
    getCountPromise.then($scope.changeState);


    $ionicPlatform.registerBackButtonAction(function () {
        $rootScope.$broadcast('navigate-back', { intendedController: $state.current.controller });        
    }, 101);

    $rootScope.$on('$stateChangeStart', function () {
        $ionicLoading.show({ template: '<md-progress-circular md-mode="indeterminate" md-diameter="70"></md-progress-circular>', noBackdrop: true });
    });
    $rootScope.$on('$stateChangeSuccess', function () {
        $ionicLoading.hide();
    });

})

