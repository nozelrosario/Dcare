var medicationsModule = angular.module('dCare.medications', ['ionic',
                                                     'dCare.Services.PatientsStore', 'dCare.Services.MedicationStore',
                                                     'dCare.dateTimeBoxDirectives', 'highcharts-ng']);

//Controllers
medicationsModule.controller('MedicationsListController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $state, $stateParams, medicationsList, currentPatient, MedicationsStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // Init Menu
    $scope.menuItems = [
                        { id: 1, title: 'Dashboard', subTitle: 'Your summary page', icon: 'ion-home' },
                        { id: 2, title: 'Add New', subTitle: 'Add a new medication', icon: 'ion-person-add' },
                        { id: 3, title: 'All Medications', subTitle: 'Show all medications (active & inactive)', icon: 'ion-android-chat' },
                        { id: 4, title: 'Alerts / Recomendations', subTitle: 'Your Messages & Alerts', icon: 'ion-android-chat' },
                        { id: 5, title: 'Settings', subTitle: 'Change Application preferences', icon: 'ion-gear-b' }
                       ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = MedicationsStore.enums;

    // Init Data
    $scope.medicationsList = medicationsList;
    $scope.currentPatient = currentPatient;

    // Action Methods

    $scope.editMedication = function (medicationID) {
        $state.go("medicationForm", { patientID: $scope.currentPatient.id, medicationID: medicationID, parentState: 'medicationslist' });
    };

    $scope.newMedication = function () {
        $state.go("medicationForm", { patientID: $scope.currentPatient.id, parentState: 'medicationslist' });
    };

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 1:
                $state.go("dashboard", { patientID: $stateParams.patientID });
                break;
            case 2:
                $scope.newMedication();
                break;
            case 3:
                alert('all medications');
                break;
            case 4:
                alert('Messages/Notificaions');
                break;
            case 5:
                alert('Settings');
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



medicationsModule.controller('MedicationFormController', function ($scope, $ionicLoading, $ionicSideMenuDelegate, $mdDialog, $state, $stateParams, medication, currentPatient, MedicationsStore) {
    $ionicLoading.show({
        template: 'Loading...'
    });

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = MedicationsStore.enums;

    // Init Data
    $scope.currentPatient = currentPatient;
    if (medication) {
        $scope.medication = medication;
    } else {
        $scope.medication = { patientID: $scope.currentPatient.id, startdate: castToLongDate(new Date()) };  // New entry : make any default values here if any
    }
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'medicationslist';

    // Action Methods

    $scope.setReminder = function (medication) {
        var confirmReminder = $mdDialog.confirm()
                  //.parent(angular.element(document.body))
                  .title('Would you like to set reminder?')
                  .content('Would you like to set a reminder for this medication')
                  .ariaLabel('Would you like to set reminder?')
                  .ok('Yes')
                  .cancel('Not Now');
                  //.targetEvent(ev);
        $mdDialog.show(confirmReminder).then(function () {
                // User clicked Yes, set reminder
            MedicationsStore.setMedicationReminder(medication.id).then(function (reminder_status) {
                logger.info(reminder_status);
                $scope.changeState(medication);
            });
            }, function () {
                // User clicked No, do not set reminder
                $scope.changeState(medication);
            });
    };

    $scope.changeState = function (medication) {
        $scope.medication = medication;
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.save = function () {
        $scope.medication.startdate = castToLongDate($scope.medication.startdate);
        $scope.medication.enddate = castToLongDate($scope.medication.enddate);
        MedicationsStore.save($scope.medication).then($scope.setReminder).fail($scope.saveFailed);

    };


    $scope.cancel = function () {
        // If required ask for confirmation
        $scope.changeState($scope.medication);
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
medicationsModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
          .state('medicationslist', {
              resolve: {
                  medicationsList: function (MedicationsStore, $stateParams) { return MedicationsStore.getAllMedicationsForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              templateUrl: 'views/medications/list.html',
              controller: 'MedicationsListController',
              params: ['patientID']
          })
          .state('medicationForm', {
              resolve: {
                  medication: function (MedicationsStore, $stateParams) { return MedicationsStore.getMedicationByID($stateParams.medicationID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              templateUrl: 'views/medications/new_entry.html',
              controller: 'MedicationFormController',
              params: ['patientID','medicationID','parentState']
          });

});
