angular.module('starter.controllers', ['ionic', 'patientsStore.services'])

.controller('StarterController', function ($scope, $ionicLoading, PatientsStore, $state) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    $scope.changeState = function (patientCount) {
        if (patientCount < 1) {
            $state.go("registration", {isFirstRun:true});
            //$state.go("registration", { isFirstRun:false, patientID: 2 });   // in case need to call for existing patient
        } else {
            $state.go("dashboard", {patientID:1});
        }
    };

    $scope.isFirstRun = false;
    var getCountPromise = PatientsStore.getCount();
    getCountPromise.then($scope.changeState);

    $ionicLoading.hide();
})

