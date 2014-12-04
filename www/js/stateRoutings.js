dCare.config(function ($stateProvider, $urlRouterProvider) {
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
            templateUrl: 'views/registration.html',
            controller: 'RegistrationController',
            params: ['patientID', 'isFirstRun']

        })

        .state('dashboard', {
            //url: '/dashboard',
            templateUrl: 'views/dashboard.html',
            controller: 'DashBoardController'

        });

});