var userModule = angular.module('dCare.user', ['ionic',
                                               'dCare.Authentication',
                                              ]);

// Controllers

userModule.controller('LoginController', function ($scope, $mdDialog, $stateParams, $state, AuthenticationService) {
 
    $scope.user = {};
    $scope.loginError = '';
    $scope.login = function () {     
        if ($scope.user.loginID && $scope.user.password) {
            AuthenticationService.login($scope.user.loginID, $scope.user.password).then(function (user) {
                $state.transitionTo('start');
            }).catch(function (err) {
                // Do not change state, Login Failed try login again.
                $scope.loginError = err;
                $mdDialog.show($mdDialog.alert()
                               .title('Error while login :(')
                               .content(err + '. Please Try again.')
                               .ariaLabel(err)
                               .theme('warn')
                               .ok('OK!'));
            });
        }
    };

    $scope.register = function () {
        $state.transitionTo('userRegistration');
    };


    //Action Methods
    $scope.navigateBack = function () {
        var confirmToggle = $mdDialog.confirm()
                .title('Exit Application ?')
                .content('Are you sure you want to close application ?')
                .ariaLabel('Are you sure you want to close application ??')
                .ok('Yes')
                .cancel('No');
        $mdDialog.show(confirmToggle).then(function () {
            // Exit App
            ionic.Platform.exitApp();
        }, function () {
            // Do Nothing
        });

    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "RegistrationController") $scope.navigateBack();
    });
});


/**
* Identification Information
* [FirstName, Last Name, email, Phone ]
*/
userModule.controller('UserInfoController', function ($scope, $mdDialog, $state, $stateParams, AuthenticationService) {

    $scope.user = {};    
    $scope.changeState = function (user) {
        // Post registration, navigate Login page. [ User data will be added post successfull login ]
        $state.transitionTo('login');
    };
    $scope.saveFailed = function (errorMessage) {
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with [' + errorMessage + ' ]. Please Try again.')
                               .ariaLabel(errorMessage)
                               .ok('OK!'));
    };

    $scope.proceed = function () {
        if ($scope.user_info_form.$valid) {
            //@NR TODO: call user registration PASSPORT REST api's and perform registration
            // Get auth token from response and push to local db
            var registerUserPromise = AuthenticationService.register($scope.user);
            registerUserPromise.then($scope.changeState, $scope.saveFailed);
        }
    };

    //Action Methods
    $scope.navigateBack = function () {
        $state.go($stateParams.parentState, {});
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "UserInfoController") $scope.navigateBack();
    });

});


// Routings
userModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('userRegistration', {
            templateUrl: 'views/user/registration.html',
            //resolve: {},
            controller: 'UserInfoController',
            params: { 'parentState': 'login' }  //defalt parent State to Login
        })
        .state('login', {
            templateUrl: 'views/user/login.html',
            //resolve: {},
            controller: 'LoginController',
            params: {'parentState': null }
        });

});