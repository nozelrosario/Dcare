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
            $state.go("dashboard");
        }
    };

    $scope.isFirstRun = false;
    var getCountPromise = PatientsStore.getCount();
    getCountPromise.then($scope.changeState);

    $ionicLoading.hide();
})

.controller('RegistrationController', function ($scope, $stateParams, PatientsStore, $state) {
    // NR: here stateParam 'patientID' is not required, might be needed for testing.
    // NR: also no need of passing to the 'identification' controller.

    $scope.isFirstRun = $stateParams.isFirstRun;
    if ($scope.isFirstRun) {
        $scope.isFirstRun = true;
        $scope.welcomeTitle = "Welcome to D-Care";
        $scope.introductionText = [{ "textLine": "A ultimate solution for your daily diabetes care ." },
		                            { "textLine": "Help us knowing you by completing the registration process." },
		                          ];
        $scope.proceed = function () {
            $state.go("identificationInfo", { patientID: $stateParams.patientID });
        };


    }
})

.controller('DashboardController', function ($scope, $ionicLoading, PatientsStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });
    $ionicLoading.hide();
});

