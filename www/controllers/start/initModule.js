angular.module('dCare.init', ['ionic', 'dCare.Services.PatientsStore'])

.controller('StarterController', function ($scope, $rootScope, $ionicLoading, $ionicPlatform, PatientsStore, $state) {

    $scope.changeState = function (patientCount) {
        if (patientCount < 1) {
            app.config.guidanceMode = true;
            $state.go("registration", {isFirstRun:true});
            //$state.go("registration", { isFirstRun:false, patientID: 2 });   //[Test] load specific patient
        } else {
            app.config.guidanceMode = false;
            $state.go("dashboard", { patientID:1 });
        }
    };
    
    $scope.isFirstRun = false;
    var getCountPromise = PatientsStore.getCount();
    getCountPromise.then($scope.changeState);

    // Initialize "Back button Listener"
    $ionicPlatform.registerBackButtonAction(function () {
        $rootScope.$broadcast('navigate-back', { intendedController: $state.current.controller });        
    }, 101);

    // Initialize State Change Busy Indicator
    $rootScope.$on('$stateChangeStart', function () {
        $ionicLoading.show({ template: '<md-progress-circular md-mode="indeterminate" md-diameter="70"></md-progress-circular>', noBackdrop: true });
    });
    $rootScope.$on('$stateChangeSuccess', function () {
        $ionicLoading.hide();
    });

})

.config(function ($stateProvider, $urlRouterProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    //Default Route
    //$urlRouterProvider.otherwise('/start');

    $stateProvider
        .state('start', {
            url: '/start',
            templateUrl: "views/start.html",
            controller: 'StarterController'
        })

        .state('registration', {
            //url: '/registration',  // cannot use as using params[]
            templateUrl: 'views/registration/registration.html',
            controller: 'RegistrationController',
            params: { 'parentPatientID': null, 'isFirstRun': null, 'parentState': null }

        });

});

