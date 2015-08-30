var remindersModule = angular.module('dCare.reminders', ['ionic',
                                                     'dCare.Services.PatientsStore', 'dCare.Services.RemindersStore',
                                                     'dCare.dateTimeBoxDirectives',
                                                     'dCare.datePrettify']);

//Controllers
remindersModule.controller('RemindersListController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $state, $stateParams, currentPatient, RemindersStore, remindersList) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // Init Menu
    $scope.menuItems = [
                        { seq: 1, id: 'dashboard', title: 'Dashboard', subTitle: 'Your summary page', icon: 'ion-home' },
                        { seq: 2, id: 'newReminder', title: 'Add New', subTitle: 'Add a new reminder', icon: 'ion-person-add' },
                        { seq: 3, id: 'settings', title: 'Settings', subTitle: 'Change reminder preferences', icon: 'ion-gear-b' }
                       ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = RemindersStore.enums;

    // Init Data
    $scope.remindersList = remindersList;
    $scope.currentPatient = currentPatient;

    // Action Methods

    $scope.editReminder = function (reminderID) {
        $state.go("reminderForm", { patientID: $scope.currentPatient.id, reminderID: reminderID, parentState: 'reminderslist' });
    };

    $scope.newReminder = function () {
        $state.go("reminderForm", { patientID: $scope.currentPatient.id, parentState: 'reminderslist' });
    };

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 'dashboard':
                $state.go("dashboard", { patientID: $stateParams.patientID });
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

    $ionicLoading.hide();
});



remindersModule.controller('ReminderFormController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $state, $stateParams, reminder, currentPatient, RemindersStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = RemindersStore.enums;

    // Init Data
    $scope.currentPatient = currentPatient;
    if (reminder) {
        $scope.reminder = reminder;
    } else {
        $scope.reminder = { patientID: $scope.currentPatient.id, status:'active' };  // New entry : make any default values here if any
    }
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'reminderslist';

    // Action Methods
    $scope.changeState = function (reminder) {
        // transition to next state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.save = function () {
        $scope.reminder.startdate = castToLongDate($scope.reminder.startdate);
        $scope.reminder.enddate = castToLongDate($scope.reminder.enddate);;
        var saveReminderDataPromise = RemindersStore.save($scope.reminder);
        saveReminderDataPromise.then($scope.changeState, $scope.saveFailed);

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

    $ionicLoading.hide();
});


// Routings
remindersModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
          .state('reminderslist', {
              resolve: {
                  remindersList: function (RemindersStore, $stateParams) { return RemindersStore.getActiveRemindersForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              templateUrl: 'views/reminders/list.html',
              controller: 'RemindersListController',
              params: { 'patientID': null }
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
