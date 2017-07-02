var medicationsModule = angular.module('dCare.medications', ['ionic',
                                                     'dCare.Services.PatientsStore', 'dCare.Services.MedicationStore',
                                                     'dCare.dateTimeBoxDirectives', 'highcharts-ng']);

//Controllers
medicationsModule.controller('MedicationsListController', function ($scope, $mdDialog, $ionicSideMenuDelegate, $ionicHistory, $mdToast, $mdBottomSheet, $state, $stateParams, medicationsList, currentPatient, MedicationsStore) {

    $ionicHistory.nextViewOptions({ expire: '' });  //NR: To supress console error when using menu-close directive of side-menu

    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'dashboard';

    // Init Menu
    $scope.menuItems = [
                        { seq: 1, id:'dashboard', title: 'Dashboard', subTitle: 'Your summary page', icon: 'img/home-dashboard.png' },
                        { seq: 3, id:'add-new', title: 'Add New', subTitle: 'Add a new medication', icon: 'img/add-new.png' },
                        { seq: 2, id:'active-medications', title: 'Active Medications', subTitle: 'Show only Active medications', icon: 'img/active-list.png' },
                        { seq: 4, id: 'manage-stock', title: 'Manage Medicine Stock', subTitle: 'Manage medicines in stock', icon: 'img/medicine-stock.png' },
                        { seq: 5, id: 'all-medications', title: 'All Medications', subTitle: 'Show all medications (active & inactive)', icon: 'img/list.png' }//,
                        //{ seq: 5, id:'alerts', title: 'Alerts / Recomendations', subTitle: 'Your Messages & Alerts', icon: 'img/alerts-recommendations.png' },
                        //{ seq: 6, id:'settings', title: 'Settings', subTitle: 'Change Application preferences', icon: 'img/settings.png' }
    ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = MedicationsStore.enums;

    // Init Data
    $scope.medicationsList = medicationsList;
    $scope.currentPatient = currentPatient;

    // Action Methods

    $scope.onLongPress = function (item, $event) {
        $scope.showListActionSheet(item);
        $event.stopPropagation();
    };

    $scope.showListActionSheet = function (item) {
        var actionSheetController = function ($scope, $mdBottomSheet) {
            $scope.actionClicked = function (actionCode) {
                $mdBottomSheet.hide({ actionItem: item, actionCode: actionCode });
            };
        };
        $mdBottomSheet.show({
            templateUrl: 'views/common-templates/list_action_sheet.html',
            controller: actionSheetController,
        }).then(function (event) {
            $scope.invokeListAction(event.actionItem, event.actionCode);
        });
    };

    $scope.invokeListAction = function (actionItem, actionCode) {
        switch (actionCode) {
            case 'edit': $scope.editMedication(actionItem.id); break;
            case 'delete': $scope.deleteMedication(actionItem.id); break;
            default: app.log.error("Action not Supported !!");
        }
    };

    $scope.showHelp = function () {
        $scope.showOverlayHelp = true;
    };

    $scope.isStockInfoAvailable = function (medication) {
        if (medication.stockrefilldate && medication.dosefrequency && medication.dose) return true;
    };

    $scope.isStockInfoPossible = function (medication) {
        if (medication.dosefrequency && medication.dose) return true;
    };

    $scope.getEstimatedStockLastDate = function (medication) {
        var estimatedStockLastDate = '',
            secondsToAdd = 0, milliSecondsToAdd = 0;
        //dose, doseunit, dosefrequency, stockrefilldate, stockrefillquantity
        //calculate date
        var totalSecondsIn = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };
        if (medication.stockrefilldate && medication.dosefrequency) {
            switch (medication.dosefrequency) {
                case 1:
                    secondsToAdd = totalSecondsIn.hour * 6;  // 6 hourly
                    break;
                case 2: f
                    secondsToAdd = totalSecondsIn.hour * 8;  // 8 hourly
                    break;
                case 3:
                    secondsToAdd = totalSecondsIn.hour * 12; // 12 hourly
                    break;
                case 4:
                    secondsToAdd = totalSecondsIn.day;       // 24 hourly
                    break;
                case 5:
                    secondsToAdd = totalSecondsIn.week;      // weekly
                    break;
                case 6:
                    secondsToAdd = totalSecondsIn.month;     // monthly
                    break;
                case 7:
                    secondsToAdd = totalSecondsIn.year;      // yearly
                    break;
                default:
                    secondsToAdd = 0;
                    break;
            }
            //NR: Adjust nonStandard unit quantities wrt. dose
            if (medication.dose) {
                if (medication.doseunit === 'teaspoon') {
                    //NR: Assuming 1 teaspoon ~ 5ml
                    secondsToAdd = secondsToAdd * medication.dose * (medication.stockrefillquantity / 5);
                } else if (medication.doseunit === 'drop') {
                    //NR: Assuming 1 drop ~ 0.05ml
                    secondsToAdd = secondsToAdd * medication.dose * (medication.stockrefillquantity / 0.05);
                } else {
                    secondsToAdd = secondsToAdd * medication.dose * medication.stockrefillquantity;
                }
                //NR: Round-off
                milliSecondsToAdd = (Math.floor(secondsToAdd)) * 1000;
                //NR: Final secondsToAdd & Round-off
                estimatedStockLastDate = medication.stockrefilldate + milliSecondsToAdd;
            } else {
                estimatedStockLastDate = '';
            }
        } else {
            estimatedStockLastDate = '';
        }
        return estimatedStockLastDate;
    };

    $scope.editMedication = function (medicationID) {
        $state.go("medicationForm", { patientID: $scope.currentPatient.id, medicationID: medicationID, parentState: $state.current.name });
    };

    $scope.editMedicationStock = function (medication) {
        if ($scope.isStockInfoPossible(medication)) {
            $state.go("medicationStockForm", { patientID: $scope.currentPatient.id, medicationID: medication.id, parentState: $state.current.name });
        } else {
            $mdDialog.show($mdDialog.alert()
                .title('Missing Information!!')
                .content('"Dose" and "Dose frequency" is required for estimating stock info. Please fill these on respective medication entry.')
                .ariaLabel('Stock Info not possible')
                .ok('OK!'));
        }
    };   

    $scope.newMedication = function () {
        $state.go("medicationForm", { patientID: $scope.currentPatient.id, parentState: 'activeMedicationslist' });
    };

    $scope.deleteMedication = function (medicationID) {        
        var onDeleteSuccess = function (deletedRecord) {
            $mdToast.show($mdToast.simple().content("Deleted successfully !!").position('bottom').hideDelay(app.config.toastAutoCloseDelay));
            for (var i = 0; i < $scope.medicationsList.length; i++) {
                if (($scope.medicationsList[i])._id == deletedRecord._id) {
                    $scope.medicationsList.splice(i, 1);
                    break;
                }
            }
        };
        var onDeleteFail = function () {
            $mdToast.show($mdToast.simple().content("Delete Failed !!").position('bottom').hideDelay(app.config.toastAutoCloseDelay));
        };
        var deleteMedicationDataPromise = MedicationsStore.remove(medicationID);
        deleteMedicationDataPromise.then(onDeleteSuccess, onDeleteFail);
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
            case 'manage-stock':
                $state.go("manageMedicationsStock", { patientID: $scope.currentPatient.id, parentState: $scope.parentState });
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



medicationsModule.controller('MedicationFormController', function ($scope, $mdDialog, $mdToast, $state, $stateParams, medication, currentPatient, MedicationsStore) {

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
                // Notify user & Change state
                $mdToast.show($mdToast.simple().content(reminder_status).position('bottom').hideDelay(app.config.toastAutoCloseDelay));
                $scope.changeState(medication);
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
            //NR: reset stock info on discontinue.
            if (newStatus === 'inactive') {
                //NR: reset stock info.
                $scope.medication.stockrefilldate = '';
                $scope.medication.stockrefillquantity = 0;
            }
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

medicationsModule.controller('MedicationStockFormController', function ($scope, $mdDialog, $mdToast, $state, $stateParams, medication, currentPatient, MedicationsStore) {

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = MedicationsStore.enums;
    $scope.enums.refillUnit = {
        'mg': { label: 'MG', short_label: 'mg', value: 'mg' },
        'ml': { label: 'ML', short_label: 'ml', value: 'ml' },
        'teaspoon': { label: 'ML', short_label: 'ml', value: 'teaspoon' },
        'tablet': { label: 'Tablet(s)', short_label: 'tab', value: 'tablet' },
        'drop': { label: 'ML', short_label: 'ml', value: 'drop' },
        'ointment': { label: 'MG', short_label: 'mg', value: 'ointment' }
    };

    // Init Data
    $scope.currentPatient = currentPatient;
    $scope.newRefill = { 'quantity': '', 'date': castToLongDate(new Date()) };
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'manageMedicationsStock';
    if (medication) {
        $scope.medication = medication;
    } else {
        $scope.cancel();    //NR: not possible to update stock on non existing medication        
    }
    
    // Action Methods

    $scope.setReminder = function (medication) {
        var confirmReminder = $mdDialog.confirm()
                  //.parent(angular.element(document.body))
                  .title('Would you like to set reminder?')
                  .content('Would you like to set a reminder to refill stock for this medication')
                  .ariaLabel('Would you like to set reminder?')
                  .ok('Yes')
                  .cancel('Not Now');
        //.targetEvent(ev);
        $mdDialog.show(confirmReminder).then(function () {
            // User clicked Yes, set reminder
            MedicationsStore.setMedicationStockReminder(medication.id, $scope.getEstimatedStockLastDate(medication)).then(function (reminder_status) {
                // Notify user & Change state
                $mdToast.show($mdToast.simple().content(reminder_status).position('bottom').hideDelay(app.config.toastAutoCloseDelay));
                $scope.changeState(medication);
            });
        }, function () {
            // User clicked No, do not set reminder
            $scope.changeState(medication);
        });
    };

    $scope.removeReminder = function (medication) {
        MedicationsStore.removeMedicationStockReminder(medication.id).then(function (reminder_status) {
            app.log.info(reminder_status);
            $scope.changeState(medication);
        });
    };

    $scope.getEstimatedStockLastDate = function () {
        var estimatedStockLastDate = '',
            secondsToAdd = 0, milliSecondsToAdd=0;
        //dose, doseunit, dosefrequency, stockrefilldate, stockrefillquantity
        //calculate date
        var totalSecondsIn = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };
        if ($scope.medication.stockrefilldate && $scope.medication.dosefrequency) {
            switch ($scope.medication.dosefrequency) {
                case 1:
                    secondsToAdd = totalSecondsIn.hour * 6;  // 6 hourly
                    break;
                case 2: f
                    secondsToAdd = totalSecondsIn.hour * 8;  // 8 hourly
                    break;
                case 3:
                    secondsToAdd = totalSecondsIn.hour * 12; // 12 hourly
                    break;
                case 4:
                    secondsToAdd = totalSecondsIn.day;       // 24 hourly
                    break;
                case 5:
                    secondsToAdd = totalSecondsIn.week;      // weekly
                    break;
                case 6:
                    secondsToAdd = totalSecondsIn.month;     // monthly
                    break;
                case 7:
                    secondsToAdd = totalSecondsIn.year;      // yearly
                    break;
                default:
                    secondsToAdd = 0;
                    break;
            }
            //NR: Adjust nonStandard unit quantities wrt. dose
            if ($scope.medication.dose) {                
                if ($scope.medication.doseunit === 'teaspoon') {
                    //NR: Assuming 1 teaspoon ~ 5ml
                    secondsToAdd = secondsToAdd * $scope.medication.dose * ($scope.medication.stockrefillquantity / 5);
                } else if ($scope.medication.doseunit === 'drop') {
                    //NR: Assuming 1 drop ~ 0.05ml
                    secondsToAdd = secondsToAdd * $scope.medication.dose * ($scope.medication.stockrefillquantity / 0.05);
                } else {
                    secondsToAdd = secondsToAdd * $scope.medication.dose * $scope.medication.stockrefillquantity;
                }
                //NR: Round-off
                milliSecondsToAdd = (Math.floor(secondsToAdd)) * 1000;
                //NR: Final secondsToAdd & Round-off
                estimatedStockLastDate = $scope.medication.stockrefilldate + milliSecondsToAdd;
                //NR: Check if estimated date is in Past
                if (estimatedStockLastDate < castToLongDate(new Date())) {
                    estimatedStockLastDate = '';
                }
            } else {
                estimatedStockLastDate = '';
            }
        } else {
            estimatedStockLastDate = '';
        }
        return estimatedStockLastDate;
    };

    $scope.getAvailableStockQuantity = function () {
        //dose, doseunit, dosefrequency, stockrefilldate, stockrefillquantity
        var availableStockQuantity = 0,
            elapsedTime,
            estimatedConsumedUnits = 0,
            doseRefillQuantity;
        if ($scope.medication.stockrefilldate && $scope.medication.dosefrequency) {
            elapsedTime = getElapsedTime($scope.medication.stockrefilldate, castToLongDate(new Date()));
            switch ($scope.medication.dosefrequency) {
                case 1:
                    estimatedConsumedUnits = elapsedTime.hour / 6;  // 6 hourly
                    break;
                case 2: f
                    estimatedConsumedUnits = elapsedTime.hour / 8;  // 8 hourly
                    break;
                case 3:
                    estimatedConsumedUnits = elapsedTime.hour / 12; // 12 hourly
                    break;
                case 4:
                    estimatedConsumedUnits = elapsedTime.day;       // 24 hourly
                    break;
                case 5:
                    estimatedConsumedUnits = elapsedTime.week;      // weekly
                    break;
                case 6:
                    estimatedConsumedUnits = elapsedTime.month;     // monthly
                    break;
                case 7:
                    estimatedConsumedUnits = elapsedTime.year;      // yearly
                    break;
                default:
                    estimatedConsumedUnits = 0;
                    break;
            }
            //NR: Adjust nonStandard unit quantities wrt. dose
            if ($scope.medication.dose) {
                if ($scope.medication.doseunit === 'teaspoon') {
                    //NR: Assuming 1 teaspoon ~ 5ml
                    estimatedConsumedUnits = estimatedConsumedUnits * ($scope.medication.dose * 5);
                    doseRefillQuantity = $scope.medication.stockrefillquantity / 5;
                } else if ($scope.medication.doseunit === 'drop') {
                    //NR: Assuming 1 drop ~ 0.05ml
                    estimatedConsumedUnits = estimatedConsumedUnits * ($scope.medication.dose * 0.05);
                    doseRefillQuantity = $scope.medication.stockrefillquantity / 0.05;
                } else {
                    estimatedConsumedUnits = estimatedConsumedUnits * $scope.medication.dose;
                    doseRefillQuantity = $scope.medication.stockrefillquantity;
                }

                //NR: Round-off final values
                estimatedConsumedUnits = Math.ceil(estimatedConsumedUnits);
                if (estimatedConsumedUnits < 1) {
                    estimatedConsumedUnits = 0;
                }
                //NR: Final available Quantity & Round-off
                availableStockQuantity = doseRefillQuantity - estimatedConsumedUnits;
                availableStockQuantity = Math.floor(availableStockQuantity);
                if (availableStockQuantity < 1) {
                    availableStockQuantity = 0;
                }
            } else {
                availableStockQuantity = 0;
            }
        } else {
            availableStockQuantity = 0;
        }  
        return availableStockQuantity;
    };

    $scope.resetStock = function () {
        var confirmReset;
        $scope.newRefill.quantity = 0;
        confirmReset = $mdDialog.confirm()
                  .title('Reset stock count on this Medication?')
                  .content('Would you like to Reset stock count on this Medication?')
                  .ariaLabel('Reset stock count on this Medication?')
                  .ok('Yes')
                  .cancel('No');

        $mdDialog.show(confirmReset).then(function () {
            // User clicked Yes, reset stock
            $scope.medication.stockrefilldate = '';
            $scope.medication.stockrefillquantity = 0;
            MedicationsStore.save($scope.medication).then($scope.removeReminder).fail($scope.saveFailed);
        }, function () {
            // User clicked No,
            // Do Nothing
            $scope.newRefill.quantity = '';
        });
    };

    $scope.changeState = function (medication) {
        $scope.medication = medication;
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.save = function (mode) {
        if ($scope.medication_stock_entry_form.$valid) {
            if (!$scope.medication.stockrefillquantity) $scope.medication.stockrefillquantity = 0;
            $scope.medication.stockrefillquantity = $scope.medication.stockrefillquantity + $scope.newRefill.quantity;
            $scope.medication.stockrefilldate = $scope.newRefill.date; //NR: Set refill date to now
            MedicationsStore.save($scope.medication).then($scope.setReminder).fail($scope.saveFailed);        
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
        if (data.intendedController === "MedicationStockFormController") $scope.navigateBack();
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
            .state('manageMedicationsStock', {
                resolve: {
                    medicationsList: function (MedicationsStore, $stateParams) { return MedicationsStore.getActiveMedicationsForPatient($stateParams.patientID); },
                    currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
                },
                templateUrl: 'views/medications/stock_list.html',
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
            .state('medicationStockForm', {
                resolve: {
                    medication: function (MedicationsStore, $stateParams) { return MedicationsStore.getMedicationByID($stateParams.medicationID); },
                    currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
                },
                templateUrl: 'views/medications/update_stock.html',
                controller: 'MedicationStockFormController',
                params: { 'patientID': null, 'medicationID': null, 'parentState': null }
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
