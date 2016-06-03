var remindersModule = angular.module('dCare.reminders', ['ionic',
                                                     'dCare.Services.PatientsStore', 'dCare.Services.RemindersStore',
                                                     'dCare.dateTimeBoxDirectives',
                                                     'dCare.datePrettify']);

//Controllers
remindersModule.controller('RemindersListController', function ($scope, $ionicSideMenuDelegate, $state, $stateParams, currentPatient, RemindersStore, remindersList) {

    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'dashboard';

    // Init Menu
    $scope.menuItems = [
                        { seq: 1, id: 'dashboard', title: 'Dashboard', subTitle: 'Your summary page', icon: 'img/home-dashboard.png' },
                        { seq: 2, id: 'activeReminders', title: 'Active Reminders', subTitle: 'Currently active reminders', icon: 'img/active-list.png' },
                        { seq: 3, id: 'pastReminders', title: 'Past Reminders', subTitle: 'Past / Inactive reminders', icon: 'img/inactive-list.png' },
                        { seq: 4, id: 'allReminders', title: 'All Reminders', subTitle: 'All reminders', icon: 'img/list.png' },
                        { seq: 5, id: 'newReminder', title: 'Add New', subTitle: 'Add a new reminder', icon: 'img/alerts-recommendations.png' },
                        { seq: 6, id: 'settings', title: 'Settings', subTitle: 'Change reminder preferences', icon: 'img/settings.png' }
                       ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = RemindersStore.enums;

    // Init Data
    $scope.remindersList = remindersList;
    $scope.currentPatient = currentPatient;

    // Action Methods

    $scope.showHelp = function () {
        $scope.showOverlayHelp = true;
    };

    $scope.editReminder = function (reminderID) {
        $state.go("reminderForm", { patientID: $scope.currentPatient.id, reminderID: reminderID, parentState: 'activeReminderslist' });
    };

    $scope.newReminder = function () {
        $state.go("reminderForm", { patientID: $scope.currentPatient.id, parentState: 'activeReminderslist' });
    };

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 'dashboard':
                $state.go("dashboard", { patientID: $stateParams.patientID });
                break;
            case 'activeReminders':
                $state.go("activeReminderslist", { patientID: $stateParams.patientID, parentState: $scope.parentState });
                break;
            case 'pastReminders':
                $state.go("pastReminderslist", { patientID: $stateParams.patientID, parentState: $scope.parentState });
                break;
            case 'allReminders':
                $state.go("allReminderslist", { patientID: $stateParams.patientID, parentState: $scope.parentState });
                break;
            case 'newReminder':
                $scope.newReminder();
                break;
            case 'settings':
                alert('Reminders Settings');
                break;
            default:
                alert('No Match');
        }
    };

    $scope.toggleActionsMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "RemindersListController") $scope.navigateBack();
    });
});



remindersModule.controller('ReminderFormController', function ($scope, $ionicSideMenuDelegate, $state, $stateParams, reminder, currentPatient, RemindersStore) {

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = RemindersStore.enums;

    // Init Data
    $scope.currentPatient = currentPatient;
    if (reminder) {
        $scope.reminder = reminder;
    } else {
        $scope.reminder = { patientID: $scope.currentPatient.id, status:'active' };  // New entry : make any default values here if any
    }
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'activeReminderslist';

    $scope.onRecursiveReminder = function () {
        if (!$scope.reminder.isRecursive) {
            $scope.reminder.frequency = '';
            $scope.reminder.frequencyUnit = '';
        }
    };

    // Action Methods
    $scope.changeState = function (reminder) {
        // transition to next state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.save = function () {
        var isValid = true;
        if ($scope.reminder.isRecursive) {
            if (!$scope.reminder.frequency || !$scope.reminder.frequencyUnit) {
                isValid = false;
            }
        }
        if ($scope.reminder_entry_form.$valid && isValid) {
            $scope.reminder.startdate = castToLongDate($scope.reminder.startdate);
            $scope.reminder.enddate = castToLongDate($scope.reminder.enddate);
            var saveReminderDataPromise = RemindersStore.save($scope.reminder);
            saveReminderDataPromise.then($scope.changeState, $scope.saveFailed);
        }
    };

    $scope.cancel = function () {
        // If required ask for confirmation
        $scope.changeState($scope.reminder);
    };

    $scope.saveFailed = function (errorMessage) {
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + errorMessage)
                               .ariaLabel(errorMessage)
                               .ok('OK!'));
    };

    $scope.navigateBack = function () {
        // transition to previous state
        $scope.cancel();
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "ReminderFormController") $scope.navigateBack();
    });
});


// Routings
remindersModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
          .state('activeReminderslist', {
              resolve: {
                  remindersList: function (RemindersStore, $stateParams) { return RemindersStore.getActiveRemindersForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              templateUrl: 'views/reminders/list.html',
              controller: 'RemindersListController',
              params: { 'patientID': null, 'parentState': null }
          })
        .state('pastReminderslist', {
            resolve: {
                remindersList: function (RemindersStore, $stateParams) { return RemindersStore.getPastRemindersForPatient($stateParams.patientID); },
                currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
            },
            templateUrl: 'views/reminders/list.html',
            controller: 'RemindersListController',
            params: { 'patientID': null, 'parentState': null }
        })
        .state('allReminderslist', {
            resolve: {
                remindersList: function (RemindersStore, $stateParams) { return RemindersStore.getAllRemindersForPatient($stateParams.patientID); },
                currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
            },
            templateUrl: 'views/reminders/list.html',
            controller: 'RemindersListController',
            params: { 'patientID': null, 'parentState': null }
        })
          .state('reminderForm', {
              resolve: {
                  reminder: function (RemindersStore, $stateParams) { return RemindersStore.getReminderByID($stateParams.reminderID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              templateUrl: 'views/reminders/new_entry.html',
              controller: 'ReminderFormController',
              params: { 'patientID': null, 'reminderID': null, 'parentState': null }
          });

});
