var dashboardModule = angular.module('dCare.dashboard', ['ionic',
                                                         'dCare.Services.PatientsStore', 'dCare.Services.VitalsStore', 'dCare.Services.GlucoseStore', 'dCare.Services.NotificationsStore', 'dCare.Services.UserStore',
                                                         'dCare.glucose', 'dCare.medications', 'dCare.vitals', 'dCare.reminders', 'dCare.meals', 'dCare.feedback', 'dCare.syncCockpit', 'dCare.SyncManager',
                                                         'dCare.dateTimeBoxDirectives', 'dCare.jqSparklineDirectives',
                                                         'dCare.datePrettify']);

//Controllers
dashboardModule.controller('DashboardController', function ($scope, $ionicSideMenuDelegate, $ionicHistory, $mdDialog, $mdToast, $state, $stateParams,
                                                            allPatients, defaultPatient, latestVitals, latestGlucose, glucoseSparklineData, notificationsData,
                                                            PatientsStore, VitalsStore, GlucoseStore, NotificationsStore, UserStore, SyncManagerService) {

    $ionicHistory.nextViewOptions({ expire: '' });  //NR: To supress console error when using menu-close directive of side-menu

    // Init Menu
    $scope.menuItems = [
                        //{ seq: 1, id: "newpatient", title: 'Add a Loved one', subTitle: 'Add a new person you care for', icon: 'ion-person-add' },
                        { seq: 2, id: "editprofile", title: 'Edit Profile', subTitle: 'Edit you personal details', icon: 'img/edit.png' },
                        { seq: 3, id: "vitals", seq: 3, title: 'Vitals', subTitle: 'Register Vitals', icon: 'img/vitals.png' },
                        { seq: 4, id: "glucose", title: 'Blood Glucose', subTitle: 'Blood glucose tracker', icon: 'img/glucose.png' },
                        { seq: 5, id: "medications", title: 'Medications', subTitle: 'Medications', icon: 'img/medications.png' },
                        { seq: 6, id: "reminders", title: 'Reminders', subTitle: 'Your reminders', icon: 'img/reminders.png' },
                        { seq: 7, id: "fooddiary", title: 'Food Diary', subTitle: 'Your Meals', icon: 'img/food-diary.png' },
                        { seq: 8, id: "settings", title: 'Settings', subTitle: 'Change Application preferences', icon: 'img/settings.png' },
                        { seq: 9, id: "feedback", title: 'Feedback', subTitle: 'Give feedback & know more about D-Care', icon: 'img/info.png' }
    ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = angular.extend({}, GlucoseStore.enums, NotificationsStore.enums);

    // Init Data
    $scope.patients = allPatients;
    $scope.vitals = latestVitals;
    $scope.glucose = latestGlucose;
    $scope.glucoseTrend = glucoseSparklineData; // glucoseSparklineData = {data:[], options:{}}
    $scope.notificationsList = notificationsData;
    $scope.isNextGlucoseAvailable = false;
    $scope.isPreviousGlucoseAvailable = true;
    $scope.isVitalsExpanded = false;
    $scope.showOverlayHelp = app.config.isFirstDashboardView;
    app.config.isFirstDashboardView = false;
    $scope.isExitConfirmed = false;
    //NR: Load Patients profile photo url
    var loadPatientProfileUrl = function (patientInfo) {

    };
    angular.forEach(allPatients, function (value, key) {
        PatientsStore.getPatientProfilePhotoByGuid(value.guid).then(function (photoUrl) {
            if (photoUrl) {
                value.photo = photoUrl;
            } else {
                value.photo = 'img/ionic.png';
            }
        }).catch(function () {
            value.photo = 'img/ionic.png';
        });
    });

    if (!defaultPatient) {
        $scope.currentPatient = allPatients[0];
    } else {
        //NR: Get Patients profile photo url for default patient
        PatientsStore.getPatientProfilePhoto(defaultPatient.id).then(function (photoUrl) {
            defaultPatient.photo = photoUrl;
        }).catch(function () {
            defaultPatient.photo = 'img/ionic.png';
        });
        $scope.currentPatient = defaultPatient;
    }

 // Action Methods

    $scope.showHelp = function () {
        $scope.showOverlayHelp = true;
    };

    $scope.toggleVitalsCardLayout = function () {
        if ($scope.isVitalsExpanded) {
            $scope.isVitalsExpanded = false;
        } else {
            $scope.isVitalsExpanded = true;
        }
    }

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case "newpatient":
                $state.go("registration", { parentPatientID: $scope.currentPatient.id, isFirstRun: false, parentState: "dashboard" });
                break;
            case "editprofile":
                $state.go("identificationInfo", { patientID: $scope.currentPatient.id, parentState: "dashboard" });
                break;
            case "vitals":
                $state.go("vitalsSummary", { patientID: $scope.currentPatient.id, parentState: "dashboard" });
                break;
            case "glucose":
                $state.go("glucoselist", { patientID: $scope.currentPatient.id, parentState: "dashboard" });
                break;
            case "medications":
                $state.go("activeMedicationslist", { patientID: $scope.currentPatient.id, parentState: "dashboard" });
                break;
            case "reminders":
                $state.go("activeReminderslist", { patientID: $scope.currentPatient.id, parentState: "dashboard" });
                break;
            case "fooddiary":
                $state.go("mealslist", { patientID: $scope.currentPatient.id, parentState: "dashboard" });
                break;
            case "settings":
                $state.go("syncCockpit", { patientID: $scope.currentPatient.id, parentState: 'dashboard' });
                break;
            case "feedback":
                $state.go("feedback", { patientID: $scope.currentPatient.id, parentState: "dashboard" });
                break;
            default:
                alert('No Match');
        }
    };

    $scope.reloadDashboardData = function () {
        var patientID = 1; //@NR: TODO: Remove this workaround and Patient ID no longer required.
        var vitalsDataPromise = VitalsStore.getLatestVitalsForPatient(patientID);
        vitalsDataPromise.then(function (vitals) {
            $scope.vitals = vitals;
        });

        var patientDataPromise = PatientsStore.getPatientByID(patientID);
        patientDataPromise.then(function (patient) {
            $scope.currentPatient = patient;
        });

        var glucoseDataPromise = GlucoseStore.getLatestGlucoseForPatient(patientID);
        glucoseDataPromise.then(function (glucose) {
            $scope.glucose = glucose;
        });

        var glucoseTrendDataPromise = GlucoseStore.glucoseSparklineData(patientID);
        glucoseTrendDataPromise.then(function (glucoseSparklineData) {
            $scope.glucoseTrend = glucoseSparklineData;
        });

        var notificationsDataPromise = NotificationsStore.getActiveNotificationsForPatient(patientID);
        notificationsDataPromise.then(function (notificationsData) {
            $scope.notificationsList = notificationsData;
        });

        //NR: Get Patients profile photo url for default patient
        PatientsStore.getPatientProfilePhoto(patientID).then(function (photoUrl) {
            $scope.currentPatient.photo = photoUrl;
        }).catch(function () {
            $scope.currentPatient.photo = 'img/ionic.png';
        });
    };

    $scope.switchDashboardForPatient = function (patientGUID) {
        if (patientGUID === "newPatient") {
            $state.go("registration", { parentPatientID: $scope.currentPatient.id, isFirstRun: false, parentState: "dashboard" });
        } else {
            SyncManagerService.doInitialSync(patientGUID).then(function () {
                //@NR: Switch Cluster and reload Dashboard data
                app.context.setCurrentCluster(patientGUID);
                $scope.reloadDashboardData();
            }).catch(function () {
                // Data not Synced, hence cannot switch to Patient
            });
        }
    };

    $scope.addNewGlucoseEntry = function () {
        $state.go("glucoseForm", { patientID: $scope.currentPatient.id, parentState: 'dashboard' });

    };

    $scope.addNewVitalsEntry = function () {
        $state.go("vitalsForm", { patientID: $scope.currentPatient.id, parentState: 'dashboard' });

    };


    $scope.getNextGlucose = function () {
        var glucoseNextDataPromise = GlucoseStore.getNextGlucoseForPatient($scope.currentPatient.id, $scope.glucose.datetime);
        glucoseNextDataPromise.then(function (glucose) {
            if (glucose) {
                $scope.glucose = glucose;
                $scope.isPreviousGlucoseAvailable = true;
            } else {
                $mdDialog.show($mdDialog.alert()
                               .title('Glucose data unavailable')
                               .content('This is latest glucose value available')
                               .ariaLabel('This is last glucose value available')
                               .ok('OK!'));
                $scope.isNextGlucoseAvailable = false;
            }
        });
    };

    $scope.getPreviousGlucose = function (patientID, datetime) {
        var glucosePreviousDataPromise = GlucoseStore.getPreviousGlucoseForPatient($scope.currentPatient.id, $scope.glucose.datetime);
        glucosePreviousDataPromise.then(function (glucose) {
            if (glucose) {
                $scope.glucose = glucose;
                $scope.isNextGlucoseAvailable = true;
            } else {
                $mdDialog.show($mdDialog.alert()
                               .title('Glucose entry unavailable')
                               .content('This is oldest glucose value available')
                               .ariaLabel('This is oldest glucose value available')
                               .ok('OK!'));
                $scope.isPreviousGlucoseAvailable = false;
            }

        });
    };

    $scope.toggleActionsMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.togglePatientsList = function () {
        $ionicSideMenuDelegate.toggleRight();
    };

    $scope.openTrend = function () {
        $state.go("glucosetrend", { patientID: $scope.currentPatient.id, parentState: 'dashboard' });
    };

    $scope.showNotificationDetails = function (notification, $event) {

        //NR : Workaround due to issue with Ang. Material
        $mdDialog.show($mdDialog.alert()
                               .title(notification.title)
                               .content(notification.text)
                               .ariaLabel(notification.text)
                               .ok('OK!')).finally(function () {

                               });

        //NR : due to issue with angular Material following doesnot work. revert after migrating to Material v0.10
        //$scope.selected_notification = notification
        //$mdDialog.show({
        //    scope: $scope,
        //    templateUrl: 'views/dashboard/notification_details.html',
        //    disableParentScroll: false,
        //    preserveScope: true,
        //    controllerAs: 'dialog',
        //    bindToController: true,
        //    parent: angular.element(document.body),
        //    targetEvent: $event,
        //    controller: function ($scope, $mdDialog) {
        //        $scope.closeNotification = function () {
        //            $mdDialog.hide(true);
        //        };
        //        $scope.deleteNotification = function (notificationID) {
        //            alert(notificationID);
        //        };
        //    }
        //});
    };
    $scope.$on("navigate-back", function (event, data) {

        if (app.config.confirmOnExit) {
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
        } else {
            if ($scope.isExitConfirmed) {
                ionic.Platform.exitApp();
            } else {
                //Notify exit
                $mdToast.show($mdToast.simple().content('Press "Back" again to exit').position('bottom').hideDelay(1000));
                $scope.isExitConfirmed = true;
                setTimeout(function () {
                    $scope.isExitConfirmed = false;
                }, 3000);
            }
        }



    });
});





// Routings
dashboardModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('dashboard', {
            resolve: {
                defaultPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); },
                allPatients: function (UserStore) { return UserStore.getAllPatients(); },
                latestVitals: function (VitalsStore, $stateParams) { return VitalsStore.getLatestVitalsForPatient($stateParams.patientID); },
                latestGlucose: function (GlucoseStore, $stateParams) { return GlucoseStore.getLatestGlucoseForPatient($stateParams.patientID); },
                glucoseSparklineData: function (GlucoseStore, $stateParams) { return GlucoseStore.glucoseSparklineData($stateParams.patientID); },
                notificationsData: function (NotificationsStore, $stateParams) { return NotificationsStore.getActiveNotificationsForPatient($stateParams.patientID); }
            },
            //url: '/identificationInfo',  // cannot use as using params[]
            templateUrl: 'views/dashboard/dashboard.html',
            controller: 'DashboardController',
            params: { 'patientID': 1 }   //@NR: TODO: Remove this workaround and Patient ID no longer required.
        });

});
