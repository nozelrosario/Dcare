angular.module('dCare.init', ['ionic', 'dCare.Services.UserStore', 'dCare.SyncManager', 'dCare.Authentication', 'dCare.user'])

.controller('StarterController', function ($scope, $rootScope, $ionicLoading, $ionicPlatform, $mdDialog, UserStore, SyncManagerService, AuthenticationService, $state) {

    $scope.changeState = function (patient) {
        if (!patient) {
            app.config.guidanceMode = true;
            $state.go("registration", {isFirstRun:true});            
        } else {
            app.config.guidanceMode = false;            
            SyncManagerService.doInitialSync(patient.guid).then(function () {
                app.context.clusterID = patient.guid;
                $state.go("dashboard", { patientID: 1 });  //@NR: TODO: Remove this workaround and Patient ID no longer required.
            }).fail(function () {
                //@NR: TODO: make a gracefull end / Or give retry option manual mode, currently this is a abrupt stop.
                $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('Sync Operation Failed !!..')
                               .ariaLabel(errorMessage)
                               .ok('OK!'));
            });
            
        }
    };
    
    $scope.isFirstRun = false;
    AuthenticationService.checkLogin().then(function () {
        UserStore.getDefaultPatient().then($scope.changeState);
    }).catch(function () {
        $state.go("login");
    });


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

