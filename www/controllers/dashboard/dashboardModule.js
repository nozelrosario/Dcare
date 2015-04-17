var dashboardModule = angular.module('dCare.dashboard', ['ionic',
                                                         'patientsStore.services', 'vitalsStore.services', 'glucoseStore.services', 'notificationsStore.services',
                                                         'dCare.glucose', 'dCare.medications','dCare.vitals',
                                                         'dCare.dateTimeBoxDirectives', 'dCare.jqSparklineDirectives']);

//Controllers
dashboardModule.controller('DashboardController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $state, $stateParams,
                                                            allPatients, defaultPatient, latestVitals, latestGlucose, glucoseSparklineData,notificationsData,
                                                            PatientsStore, VitalsStore, GlucoseStore, notificationsStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // Init Menu
    $scope.menuItems = [
                        { seq: 1, id: "newpatient", title: 'Add a Loved one', subTitle: 'Add a new person you care for', icon: 'ion-person-add' },
                        { seq: 2, id: "editprofile", title: 'Edit Profile', subTitle: 'Edit you personal details', icon: 'ion-android-chat' },
                        { seq: 3, id: "vitals", seq: 3, title: 'Vitals', subTitle: 'Register Vitals', icon: 'ion-android-chat' },
                        { seq: 4, id: "glucose", title: 'Blood Glucose', subTitle: 'Blood glucose tracker', icon: 'ion-android-chat' },
                        { seq: 5, id: "medications", title: 'Medications', subTitle: 'Medications', icon: 'ion-android-chat' },
                        { seq: 6, id: "messages", title: 'Messages/Notificaions', subTitle: 'Your Messages & Alerts', icon: 'ion-android-chat' },
                        { seq: 7, id: "settings", title: 'Settings', subTitle: 'Change Application preferences', icon: 'ion-gear-b' },
                        { seq: 8, id: "about", title: 'About', subTitle: 'Know more about contributers', icon: 'ion-information-circled' }
                       ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = angular.extend({}, GlucoseStore.enums, notificationsStore.enums);

    // Init Data
    $scope.patients = allPatients;
    $scope.latestVitals = latestVitals;
    $scope.glucose = latestGlucose;
    $scope.glucoseTrend = glucoseSparklineData; // glucoseSparklineData = {data:[], options:{}}
    $scope.notificationsList = notificationsData;

    if (!defaultPatient) {
        $scope.currentPatient = allPatients[0];
    } else {
        $scope.currentPatient = defaultPatient;
    }


    // Action Methods
    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case "newpatient":
                $state.go("registration", { isFirstRun: false });
                break;
            case "editprofile":
                $state.go("identificationInfo", { patientID: $scope.currentPatient.id });
                break;
            case "vitals":
                $state.go("vitalsSummary", { patientID: $scope.currentPatient.id });
                break;
            case "glucose":
                $state.go("glucoselist", { patientID: $scope.currentPatient.id });
                break;
            case "medications":
                $state.go("medicationslist", { patientID: $scope.currentPatient.id });
                break;
            case "messages":
                alert('Messages/Notificaions');
                break;
            case "settings":
                alert('Settings');
                break;
            case "about":
                alert('About');
                break;
            default:
                alert('No Match');
        }
    };

    $scope.switchDashboardForPatient = function (patientID) {
        var vitalsDataPromise = VitalsStore.getLatestVitalsForPatient(patientID);
        vitalsDataPromise.then(function (vitals) {
            $scope.latestVitals = vitals;
        });

        var patientDataPromise = PatientsStore.getPatientByID(patientID);
        patientDataPromise.then(function (patient) {
            $scope.currentPatient = patient;
        });

        var glucoseDataPromise = GlucoseStore.getLatestGlucoseForPatient(patientID);
        glucoseDataPromise.then(function (glucose) {
            $scope.glucose = glucose;
        });
    };

    $scope.addNewGlucoseEntry = function () {
        $state.go("glucoseForm", { patientID: $scope.currentPatient.id, parentState: 'dashboard' });

    };


    $scope.getNextGlucose = function () {
        var glucoseNextDataPromise = GlucoseStore.getNextGlucoseForPatient($scope.currentPatient.id, $scope.glucose.datetime);
        glucoseNextDataPromise.then(function (glucose) {
            $scope.glucose = glucose;
        });
    };

    $scope.getPreviousGlucose = function (patientID, datetime) {
        var glucosePreviousDataPromise = GlucoseStore.getPreviousGlucoseForPatient($scope.currentPatient.id, $scope.glucose.datetime);
        glucosePreviousDataPromise.then(function (glucose) {
            $scope.glucose = glucose;
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

    $ionicLoading.hide();
});





// Routings
dashboardModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('dashboard', {
            resolve: {
                defaultPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); },
                allPatients: function (PatientsStore) { return PatientsStore.getAllPatients(); },
                latestVitals: function (VitalsStore, $stateParams) { return VitalsStore.getLatestVitalsForPatient($stateParams.patientID); },
                latestGlucose: function (GlucoseStore, $stateParams) { return GlucoseStore.getLatestGlucoseForPatient($stateParams.patientID); },
                glucoseSparklineData: function (GlucoseStore, $stateParams) { return GlucoseStore.glucoseSparklineData($stateParams.patientID); },
                notificationsData: function (notificationsStore, $stateParams) { return notificationsStore.getActiveNotificationsForPatient($stateParams.patientID); }
            },
            //url: '/identificationInfo',  // cannot use as using params[]
            templateUrl: 'views/dashboard/dashboard.html',
            controller: 'DashboardController',
            params: ['patientID']
        });

});
