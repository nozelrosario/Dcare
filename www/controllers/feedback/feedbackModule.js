var feedbackModule = angular.module('dCare.feedback', ['ionic']);

//Controllers
remindersModule.controller('FeedbackController', function ($scope, $state, $stateParams, $mdDialog) {

    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'dashboard';

    // Init Menu
    $scope.menuItems = [
                        { seq: 1, id: 'feedback', title: 'Feedback', subTitle: 'If you wish to give feedback to the developer', icon: 'img/home-dashboard.png' },
                        { seq: 2, id: 'about', title: 'About D-Care', subTitle: 'Short info about this project', icon: 'img/info.png' },
                        { seq: 3, id: 'share', title: 'Share', subTitle: 'Share this app among your friends', icon: 'img/share.png' },
                        { seq: 4, id: 'rate', title: 'Rate this app', subTitle: 'Rate this app on app store', icon: 'img/rating.png' },
                        { seq: 5, id: 'close', title: 'Close', subTitle: 'Close feedback go & back to Dashboard', icon: 'img/home-dashboard.png' }
                       ];

    // Init Data
    $scope.currentPatientID = $stateParams.patientID;

    // Action Methods

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 'feedback':
                $scope.giveFeedback();
                break;
            case 'about':
                $scope.showAboutDialog();
                break;
            case 'share':
                $scope.shareAppLink();
                break;
            case 'rate':
                $scope.rateApp();
                break;
            case 'close':
                $scope.navigateBack();
                break;            
            default:
                alert('No Match');
        }
    };

    $scope.giveFeedback = function () {
        if ((typeof cordova !== "undefined") && cordova.plugins.email) {
            cordova.plugins.email.isAvailable(function (isEmailAvailable) {
                if (isEmailAvailable) {
                    var emailDefaults = {
                        to: app.info.developers,
                        subject: 'D-Care Feedback',
                        body: '<h1>Your Feedback is Important !!</h1><br><p>Please provide your feedback in this email and hit send button. I will surely consider you suggestions in future releases of this app</p>',
                        isHtml: true
                    };
                    var emailClosed = function () { app.log.info("Feedback Email closed"); };
                    cordova.plugins.email.open(emailDefaults, emailClosed);
                } else {
                    app.log.error("Email Service unavailable on device.");
                }
            });
        } else {
            app.log.error("Cordova Email Plugin unavailable.");
        }
    };

    $scope.shareAppLink = function () {
        if ((typeof cordova !== "undefined") && window.plugins.socialsharing) {
            var shareLink = app.info.appStoreLink[ionic.Platform.platform()];
            if (shareLink) {
                var sharingOptions = {
                    message: app.info.shortInfo, // not supported on some apps (Facebook, Instagram)
                    subject: app.info.shortInfo, // fi. for email            
                    url: shareLink,
                    chooserTitle: 'Share Using' // Android only, you can override the default share sheet title
                }

                var onSuccess = function (result) {
                    app.log.info("Shared !! via. " + result.app);   //result.completed            
                }

                var onError = function (msg) {
                    app.log.error("Sharing failed with message: " + msg);
                }

                window.plugins.socialsharing.shareWithOptions(sharingOptions, onSuccess, onError);
            } else {
                app.log.error("App Store link not available for current platform [ " + ionic.Platform.platform() + " ]");
            }
        } else {
            app.log.error("Cordova Social Sharing Plugin unavailable.");
        }
    };

    $scope.rateApp = function () {
        var shareLink = app.info.appStoreLink[ionic.Platform.platform()];
        if (shareLink) {
            window.open(shareLink, "_system");
        } else {
            app.log.error("App Store link not available for current platform [ " + ionic.Platform.platform() + " ]");
        }
    };

    $scope.showAboutDialog = function () {
        var aboutDialogController = function ($scope, $mdDialog) {
            $scope.closeDialog = function () {
                $mdDialog.hide();
            };
        };

        $mdDialog.show({
            parent: angular.element(document.body),            
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose:true,
            templateUrl: 'views/feedback/about.html',
            controller: aboutDialogController
        });
    };

    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $scope.currentPatientID });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "FeedbackController") $scope.navigateBack();
    });
});


// Routings
remindersModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
          .state('feedback', {              
              templateUrl: 'views/feedback/list.html',
              controller: 'FeedbackController',
              params: { 'patientID': null, 'parentState': null }
          });

});
