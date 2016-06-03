var medicationsModule = angular.module('dCare.medications', ['ionic',
                                                     'dCare.Services.PatientsStore', 'dCare.Services.MedicationStore',
                                                     'dCare.dateTimeBoxDirectives', 'highcharts-ng']);

//Controllers
medicationsModule.controller('MedicationsListController', function ($scope, $ionicSideMenuDelegate, $state, $stateParams, medicationsList, currentPatient, MedicationsStore) {

    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'dashboard';

    // Init Menu
    $scope.menuItems = [
                        { seq: 1, id:'dashboard', title: 'Dashboard', subTitle: 'Your summary page', icon: 'img/home-dashboard.png' },
                        { seq: 3, id:'add-new', title: 'Add New', subTitle: 'Add a new medication', icon: 'img/add-new.png' },
                        { seq: 2, id:'active-medications', title: 'Active Medications', subTitle: 'Show only Active medications', icon: 'img/active-list.png' },
                        { seq: 4, id:'all-medications', title: 'All Medications', subTitle: 'Show all medications (active & inactive)', icon: 'img/list.png' },
                        { seq: 5, id:'alerts', title: 'Alerts / Recomendations', subTitle: 'Your Messages & Alerts', icon: 'img/alerts-recommendations.png' },
                        { seq: 6, id:'settings', title: 'Settings', subTitle: 'Change Application preferences', icon: 'img/settings.png' }
    ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = MedicationsStore.enums;

    // Init Data
    $scope.medicationsList = medicationsList;
    $scope.currentPatient = currentPatient;

    // Action Methods

    $scope.showHelp = function () {
        $scope.showOverlayHelp = true;
    };

    $scope.editMedication = function (medicationID) {
        $state.go("medicationForm", { patientID: $scope.currentPatient.id, medicationID: medicationID, parentState: $state.current.name });
    };

    $scope.newMedication = function () {
        $state.go("medicationForm", { patientID: $scope.currentPatient.id, parentState: 'activeMedicationslist' });
    };

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 'dashboard':
                $state.go("dashboard", { patientID: $stateParams.patientID });
                break;
            case 'add-new':
                $scope.newMedication();
                break;
            case 'active-medications':
                $state.go("activeMedicationslist", { patientID: $scope.currentPatient.id, parentState: $scope.parentState });
                break;
            case 'all-medications':
                $state.go("allMedicationslist", { patientID: $scope.currentPatient.id, parentState: $scope.parentState });
                break;
            case 'alerts':
                alert('Messages/Notificaions');
                break
            case 'settings':
                alert('Settings');
                break;
            default:
                alert('No Match');
        }
    };

    $scope.toggleActionsMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    //Action Methods
    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "MedicationsListController") $scope.navigateBack();
    });
});



medicationsModule.controller('MedicationFormController', function ($scope, $ionicSideMenuDelegate, $mdDialog, $state, $stateParams, medication, currentPatient, MedicationsStore) {

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
                $mdDialog.show($mdDialog.alert()
                               .title("Medication Reminder!!")
                               .content(reminder_status)
                               .ariaLabel(reminder_status)
                               .ok('OK!')).finally(function () {
                                   $scope.changeState(medication);
                               });
            });
        }, function () {
            // User clicked No, do not set reminder
            $scope.changeState(medication);
        });
    };

    $scope.removeReminder = function (medication) {
        MedicationsStore.removeMedicationReminder(medication.id).then(function (reminder_status) {
            app.log.info(reminder_status);
            $scope.changeState(medication);
        });
    };

    $scope.updateRespectiveReminder = function (medication) {
        if (medication.status === "active") {
            $scope.setReminder(medication);
        } else if (medication.status === "inactive") {
            $scope.removeReminder(medication);
        }
    };

    $scope.toggleMedicationStatus = function () {
        var newStatus, confirmToggle;
        if ($scope.medication.status === "active") {
            newStatus = "inactive";
            confirmToggle = $mdDialog.confirm()
                  .title('Discontinue this Medication?')
                  .content('Would you like to discontinue this Medication?')
                  .ariaLabel('Discontinue this Medication?')
                  .ok('Yes')
                  .cancel('No');
        } else if ($scope.medication.status === "inactive") {
            newStatus = "active";
            confirmToggle = $mdDialog.confirm()
                  .title('Resume this Medication?')
                  .content('Would you like to resume this Medication?')
                  .ariaLabel('Resume this Medication?')
                  .ok('Yes')
                  .cancel('No');
        }

        $mdDialog.show(confirmToggle).then(function () {
            // User clicked Yes, set reminder
            $scope.medication.status = newStatus;
            $scope.save();
        }, function () {
            // User clicked No, do not set reminder
            // Do Nothing
        });
    };

    $scope.changeState = function (medication) {
        $scope.medication = medication;
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.save = function () {
        if ($scope.medication_entry_form.$valid) {
            $scope.medication.startdate = castToLongDate($scope.medication.startdate);
            $scope.medication.enddate = castToLongDate($scope.medication.enddate);
            $scope.medication.status = ($scope.medication.status) ? $scope.medication.status : 'active';    // NR: In case Status="", then Default Status To Active
            MedicationsStore.save($scope.medication).then($scope.updateRespectiveReminder).fail($scope.saveFailed);
        }
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

    //Action Methods
    $scope.navigateBack = function () {
        // transition to previous state
        $scope.cancel();
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "MedicationFormController") $scope.navigateBack();
    });
});


// Routings
medicationsModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
          .state('activeMedicationslist', {
              resolve: {
                  medicationsList: function (MedicationsStore, $stateParams) { return MedicationsStore.getActiveMedicationsForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              templateUrl: 'views/medications/list.html',
              controller: 'MedicationsListController',
              params: { 'patientID': null, 'parentState': 'activeMedicationslist' }
          })
            .state('allMedicationslist', {
                resolve: {
                    medicationsList: function (MedicationsStore, $stateParams) { return MedicationsStore.getAllMedicationsForPatient($stateParams.patientID); },
                    currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
                },
                templateUrl: 'views/medications/list.html',
                controller: 'MedicationsListController',
                params: { 'patientID': null, 'parentState': 'allMedicationslist' }
            })
          .state('medicationForm', {
              resolve: {
                  medication: function (MedicationsStore, $stateParams) { return MedicationsStore.getMedicationByID($stateParams.medicationID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              templateUrl: 'views/medications/new_entry.html',
              controller: 'MedicationFormController',
              params: { 'patientID': null, 'medicationID': null, 'parentState': null }
          });

});
