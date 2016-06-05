var glucoseModule = angular.module('dCare.glucose', ['ionic',
                                                     'dCare.Services.PatientsStore', 'dCare.Services.GlucoseStore', 'dCare.Services.MealsStore',
                                                     'dCare.dateTimeBoxDirectives', 'highcharts-ng']);

//Controllers
glucoseModule.controller('GlucoseListController', function ($scope, $ionicSideMenuDelegate, $mdToast, $mdBottomSheet, $state, $stateParams, glucoseList, currentPatient, GlucoseStore) {

    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'dashboard';

    // Init Menu
    $scope.menuItems = [
                        { id: 1, title: 'Dashboard', subTitle: 'Your summary page', icon: 'img/home-dashboard.png' },
                        { id: 2, title: 'Add New', subTitle: 'Add a new glucose measurement', icon: 'img/add-new.png' },
                        { id: 3, title: 'See Trend', subTitle: 'Blood glucose graph', icon: 'img/chart.png' },
                        { id: 4, title: 'Alerts / Recomendations', subTitle: 'Your Messages & Alerts', icon: 'img/alerts-recommendations.png' },
                        { id: 5, title: 'Settings', subTitle: 'Change Application preferences', icon: 'img/settings.png' }
                       ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = GlucoseStore.enums;

    // Init Data
    $scope.glucoseList = glucoseList;
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
            case 'edit': $scope.editGlucose(actionItem.id); break;
            case 'delete': $scope.deleteGlucose(actionItem.id); break;
            default: app.log.error("Action not Supported !!");
        }
    };

    $scope.showHelp = function () {
        $scope.showOverlayHelp = true;
    };

    $scope.editGlucose = function (glucoseID) {
        $state.go("glucoseForm", { patientID: $scope.currentPatient.id, glucoseID: glucoseID, parentState: 'glucoselist' });
    };

    $scope.newGlucose = function () {
        $state.go("glucoseForm", { patientID: $scope.currentPatient.id, parentState: 'glucoselist' });
    };

    $scope.deleteGlucose = function (glucoseID) {
        var onDeleteSuccess = function (deletedRecord) {
            $mdToast.show($mdToast.simple().content("Deleted successfully !!").position('bottom').hideDelay(app.config.toastAutoCloseDelay));
            for (var i = 0; i < $scope.glucoseList.length; i++) {
                if (($scope.glucoseList[i])._id == deletedRecord._id) {
                    $scope.glucoseList.splice(i, 1);
                    break;
                }
            }
        };
        var onDeleteFail = function () {
            $mdToast.show($mdToast.simple().content("Delete Failed !!").position('bottom').hideDelay(app.config.toastAutoCloseDelay));
        };
        var deleteGlucoseDataPromise = GlucoseStore.remove(glucoseID);
        deleteGlucoseDataPromise.then(onDeleteSuccess, onDeleteFail);
    };

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 1:
                $state.go("dashboard", { patientID: $stateParams.patientID });
                break;
            case 2:
                $scope.newGlucose();
                break;
            case 3:
                $state.go("glucosetrend", { patientID: $scope.currentPatient.id, parentState: 'glucoselist' });
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

    //Action Methods
    $scope.navigateBack = function () {
        // transition to previous state
        app.log.info("State reached : "  + $scope.parentState);
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "GlucoseListController") $scope.navigateBack();
    });

});



glucoseModule.controller('GlucoseFormController', function ($scope, $ionicSideMenuDelegate, $mdDialog, $state, $stateParams, glucose, currentPatient, GlucoseStore, MealsStore) {

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = GlucoseStore.enums;

    // Init Data
    $scope.currentPatient = currentPatient;
    if (glucose) {
        $scope.glucose = glucose;
    } else {
        $scope.glucose = { patientID: $scope.currentPatient.id, datetime: castToLongDate(new Date()) };  // New entry : make any default values here if any
    }
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'glucoselist';
    // Action Methods

    $scope.showMealLookupDialog = function showDialog() {
        $mdDialog.show({
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            template: '<md-dialog aria-label="Food entry" style="height:100%;width:100%;padding:0px;">' +
                        '<md-toolbar>' +
                            '<div class="md-toolbar-tools">' +
                                '<h2>Food Item </h2>' +
                                '<span flex></span>' +
                                '<md-button class="md-icon-button ion-close-round" ng-click="closeDialog()">' +
                                '</md-button>' +
                            '</div>' +
                        '</md-toolbar> ' +
                        '<md-dialog-content style="padding:0px;" ng-include="&#39;views/meals/meals_list.html&#39;">' +
                       '</md-dialog-content>'+
                      '</md-dialog>',
            controller: selectMealController,
            resolve: {
                mealsList: function (MealsStore, $stateParams) { return MealsStore.getAllMealsForPatient($stateParams.patientID); }
            }
        });
        function selectMealController($scope, $mdDialog, MealsStore, mealsList) {
            $scope.mealsList = mealsList;
            $scope.closeDialog = function () {
                $mdDialog.hide();
            };

            $scope.onSelectMeal = function (mealID, mealSummary) {
                $scope.glucose.mealID = mealID;
                $scope.glucose.mealSummary = mealSummary;
                $mdDialog.hide();
            };           
        }
    };

    $scope.showMealForm = function (mealID) {
        $state.go("glucoseLinkedMealForm", { patientID: $scope.currentPatient.id, mealID:mealID, glucose: $scope.glucose, parentState: 'glucoseForm' });
    };

    $scope.clearMealSelection = function () {
        $scope.glucose.mealID = "";
        $scope.glucose.mealSummary = "";
    };

    $scope.changeState = function (glucose) {
        //$scope.glucose = glucose;
        // transition to next state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.save = function () {
        if ($scope.glucose_entry_form.$valid) {
            $scope.glucose.datetime = castToLongDate($scope.glucose.datetime)
            var saveGlucoseDataPromise = GlucoseStore.save($scope.glucose);
            saveGlucoseDataPromise.then($scope.changeState, $scope.saveFailed);
        }
    };

    $scope.cancel = function () {
        // If required ask for confirmation
        $scope.changeState($scope.glucose);
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
        if (data.intendedController === "GlucoseFormController") $scope.navigateBack();
    });
});


glucoseModule.controller('GlucoseLinkedMealController', function ($scope, $ionicSideMenuDelegate, $mdDialog, $state, $stateParams, meal, currentPatient, MealsStore) {

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = MealsStore.enums;

    // Init Data
    $scope.currentPatient = currentPatient;
    $scope.glucose = $stateParams.glucose;
    if (meal) {
        $scope.meal = meal;
    } else {
        $scope.meal = { patientID: $scope.currentPatient.id, mealDetails: [], datetime: castToLongDate(new Date()) };  // New entry : make any default values here if any
    }
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'mealslist';

    $scope.showFoodItemDialog = function showDialog(foodItem) {
        $mdDialog.show({
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            templateUrl: 'views/meals/food_entry.html',
            locals: {
                foodItem: foodItem
            },
            controller: addFoodItemController
        });
        function addFoodItemController($scope, $mdDialog, foodItem) {
            var isEditMode = false;
            if (foodItem) {
                $scope.food = foodItem;
                isEditMode = true;
            } else {
                $scope.food = {};
                isEditMode = false;
            }
            $scope.closeDialog = function () {
                isEditMode = false;
                $mdDialog.hide();
            };

            $scope.add = function () {
                if ($scope.food_entry_form.$valid) {
                    if (!isEditMode) $scope.meal.mealDetails.push($scope.food);
                    isEditMode = false;
                    $mdDialog.hide();
                }
            };

            $scope.addAndNew = function () {
                if ($scope.food_entry_form.$valid) {
                    if (!isEditMode) $scope.meal.mealDetails.push($scope.food);
                    $scope.food = {};
                    isEditMode = false;
                }
            };
        }
    };

    $scope.deleteFoodItem = function (index) {
        $scope.meal.mealDetails.splice(index, 1);
    };

    var createMealSummary = function (mealDetails) {
        var summaryText = "";
        for (var i = 0; i < mealDetails.length; i++) {
            summaryText = summaryText + ((mealDetails[i].quantity) ? (mealDetails[i].quantity + mealDetails[i].quantityUnit) : "") + " " + mealDetails[i].foodItem;
            if (i == (mealDetails.length - 2)) {
                summaryText = summaryText + " & ";
            } else if (i != (mealDetails.length - 1)) {
                summaryText = summaryText + " , ";
            }
        }
        return summaryText;
    };

    // Action Methods
    $scope.changeState = function (meal) {
        //$scope.glucose = glucose;
        // transition to next state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id, glucose: $scope.glucose });
    };

    $scope.save = function () {
        if ($scope.meal_entry_form.$valid) {
            $scope.meal.datetime = castToLongDate($scope.meal.datetime);
            $scope.meal.mealSummary = createMealSummary($scope.meal.mealDetails);
            var saveMealDataPromise = MealsStore.save($scope.meal);
            saveMealDataPromise.then(function (savedMeal) {
                $scope.glucose.mealID = savedMeal.id;
                $scope.glucose.mealSummary = savedMeal.mealSummary;
                $scope.changeState(savedMeal);
            }, $scope.saveFailed);
        }
    };

    $scope.cancel = function () {
        // If required ask for confirmation
        $scope.changeState($scope.meal);
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
        if (data.intendedController === "GlucoseLinkedMealController") $scope.navigateBack();
    });
});


glucoseModule.controller('GlucoseTrendController', function ($scope, $ionicSideMenuDelegate, $state, $stateParams, glucoseTrendData, currentPatient, GlucoseStore) {

    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'glucoselist';


    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = GlucoseStore.enums;
    


    // Init Data
    $scope.currentPatient = currentPatient;
    $scope.data = glucoseTrendData;
    $scope.dateFilter = {};
    //  High Charts options

    $scope.glucoseChartConfig = {
        chart: {
                   type: 'lineChart',
                   spacingTop:0,
                   spacingBottom:0,
                   spacingRight:50,
                   spacingLeft:0,
                   marginTop:0,
                   marginBottom:0,
                   marginRight:50,
                   marginLeft:0
               },
        xAxis: {
                   type: 'datetime',
                   dateTimeLabelFormats: { // don't display the dummy year
                                        month: '%e. %b',
                                        year: '%b'
                                     },
                   title: {
                          text: 'Date'
                   }
               },
     yAxis: {
        title: {
                text: 'Glucose mg/dL'
            },
            min: 0,
            plotBands: [{ // Extreme High
                from: 180,
                to: 500,
                color: 'rgba(255, 137, 137, 0.15)',
                label: {
                    text: 'High Blood Glucose',
                    style: {
                        color: '#606060'
                    }
                }
            },
                 { // 
                from: 150,
                to: 180,
                color: 'rgba(255, 197, 70, 0.15)',
                label: {
                    text: 'Borderline Diabetic',
                    style: {
                        color: '#606060'
                    }
                }
            }, { // Normal
                from: 90,
                to: 150,
                color: 'rgba(70, 255, 30, 0.15)',
                label: {
                    text: 'Normal',
                    style: {
                        color: '#606060'
                    }
                }
            }, { // Low blood sugar
                from: 0,
                to: 90,
                color: 'rgba(255, 137, 137, 0.15)',
                label: {
                    text: 'Low Blood Sugar',
                    style: {
                        color: '#606060'
                    }
                }
            }]
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%e. %b}: {point.y:.2f} mg/dL'
        },
        title: {
            text: 'Glucose Trend over time'
        },
        subtitle: {
            text: 'Shows how did your glucose values perform'
        },
        series: $scope.data
    };

    
    // Action Methods

    $scope.filterDataOnDate = function () {
        fromDate = castToLongDate($scope.dateFilter.fromDate);
        toDate = castToLongDate($scope.dateFilter.toDate);
        GlucoseStore.getLineGraphDataForPatient($scope.currentPatient.id, fromDate, toDate).then(function (filteredData) {
            $scope.data = filteredData;
            $scope.glucoseChartConfig.series = $scope.data;
        });
    };

    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "GlucoseTrendController") $scope.navigateBack();
    });

});



// Routings
glucoseModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
          .state('glucoselist', {
              resolve: {
                  glucoseList: function (GlucoseStore, $stateParams) { return GlucoseStore.getAllglucoseForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              templateUrl: 'views/glucose/list.html',
              controller: 'GlucoseListController',
              params: { 'patientID': null, 'parentState': null }
          })
          .state('glucoseForm', {
              resolve: {
                  glucose: function (GlucoseStore, $stateParams, $q) {                  //NR: Special Implementation form Meal Entry sub-form.
                      var deferedFetch;
                      if ($stateParams.glucose) {                                   //NR: if glucose Obj. passed from Meal-Form, then restore back on form
                          var dummyGlucoseDeferedCall = $q.defer();
                          dummyGlucoseDeferedCall.resolve($stateParams.glucose);
                          deferedFetch = dummyGlucoseDeferedCall.promise;
                      } else {
                          deferedFetch = GlucoseStore.getGlucoseByID($stateParams.glucoseID);       //NR: Else fetch from glucoseID if present
                      }                      
                      return deferedFetch;
                  },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              templateUrl: 'views/glucose/new_entry.html',
              controller: 'GlucoseFormController',
              params: { 'patientID': null ,'glucoseID': null, 'glucose': null, 'parentState': null }
          })
          .state('glucoseLinkedMealForm', {
              resolve: {
                  meal: function (MealsStore, $stateParams) { return MealsStore.getMealByID($stateParams.mealID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              templateUrl: 'views/meals/new_entry.html',
              controller: 'GlucoseLinkedMealController',
              params: { 'patientID': null, 'mealID': null, 'glucose': null, 'parentState': null }
          })
          .state('glucosetrend', {
              resolve: {
                  glucoseTrendData: function (GlucoseStore, $stateParams) { return GlucoseStore.getLineGraphDataForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              templateUrl: 'views/glucose/trend.html',
              controller: 'GlucoseTrendController',
              params: { 'patientID': null, 'parentState': null }
          });

});
