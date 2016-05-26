var mealsModule = angular.module('dCare.meals', ['ionic',
                                                     'dCare.Services.PatientsStore', 'dCare.Services.MealsStore',
                                                     'dCare.dateTimeBoxDirectives', 'highcharts-ng']);

//Controllers
mealsModule.controller('MealsListController', function ($scope, $ionicSideMenuDelegate, $state, $stateParams, mealsList, currentPatient, MealsStore) {

    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'dashboard';

    // Init Menu
    $scope.menuItems = [
                        { id: 1, title: 'Dashboard', subTitle: 'Your summary page', icon: 'ion-home' },
                        { id: 2, title: 'Add New', subTitle: 'Add a new meal entry', icon: 'ion-person-add' },
                        { id: 3, title: 'See Trend', subTitle: 'Calories consumption graph', icon: 'ion-android-chat' },
                        { id: 4, title: 'Alerts / Recomendations', subTitle: 'Your Messages & Alerts', icon: 'ion-android-chat' },
                        { id: 5, title: 'Settings', subTitle: 'Change Application preferences', icon: 'ion-gear-b' }
                       ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = MealsStore.enums;

    // Init Data
    $scope.mealsList = mealsList;
    $scope.currentPatient = currentPatient;

    // Action Methods

    $scope.showHelp = function () {
        $scope.showOverlayHelp = true;
    };

    $scope.editMeal = $scope.onSelectMeal = function (mealsID) {
        $state.go("mealForm", { patientID: $scope.currentPatient.id, mealsID: mealsID, parentState: 'mealslist' });
    };

    $scope.newMeal = function () {
        $state.go("mealForm", { patientID: $scope.currentPatient.id, parentState: 'mealslist' });
    };

    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 1:
                $state.go("dashboard", { patientID: $stateParams.patientID });
                break;
            case 2:
                $scope.newMeal();
                break;
            case 3:
                $state.go("caloriestrend", { patientID: $scope.currentPatient.id, parentState: 'mealslist' });
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
        if (data.intendedController === "MealsListController") $scope.navigateBack();
    });

});



mealsModule.controller('MealsFormController', function ($scope, $ionicSideMenuDelegate, $mdDialog, $state, $stateParams, meal, currentPatient, MealsStore) {

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = MealsStore.enums;

    // Init Data
    $scope.currentPatient = currentPatient;
    if (meal) {
        $scope.meal = meal;
    } else {
        $scope.meal = { patientID: $scope.currentPatient.id, mealDetails:[], datetime: castToLongDate(new Date()) };  // New entry : make any default values here if any
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
                    if(!isEditMode) $scope.meal.mealDetails.push($scope.food);                    
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
        $scope.meal.mealDetails.splice(index,1);
    };

    var createMealSummary = function (mealDetails) {
        var summaryText = "";
        for (var i = 0; i < mealDetails.length; i++) {
            summaryText = summaryText + ((mealDetails[i].quantity) ? (mealDetails[i].quantity + mealDetails[i].quantityUnit) : "") + " " + mealDetails[i].foodItem;
            if (i == (mealDetails.length - 2)) {
                summaryText = summaryText + " & ";
            } else if(i != (mealDetails.length-1)) {
                summaryText = summaryText + " , ";
            }
        }
        return summaryText;
    };

    // Action Methods
    $scope.changeState = function (meal) {
        //$scope.glucose = glucose;
        // transition to next state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.save = function () {
        if ($scope.meal_entry_form.$valid) {
            $scope.meal.datetime = castToLongDate($scope.meal.datetime);
            $scope.meal.mealSummary = createMealSummary($scope.meal.mealDetails);
            var saveMealDataPromise = MealsStore.save($scope.meal);
            saveMealDataPromise.then($scope.changeState, $scope.saveFailed);
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
        if (data.intendedController === "MealFormController") $scope.navigateBack();
    });
});


mealsModule.controller('MealsTrendController', function ($scope, $ionicSideMenuDelegate, $state, $stateParams, caloriesTrendData, currentPatient, MealsStore) {

    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'mealslist';


    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = MealsStore.enums;
    


    // Init Data
    $scope.currentPatient = currentPatient;
    $scope.data = caloriesTrendData;

    //  High Charts options

    $scope.caloriesChartConfig = {
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
        title: { text: 'Calories Consumed' },
               min: 0
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%e. %b}: {point.y:.2f} calories'
        },
        title: {
            text: 'Calories Consumed over time'
        },
        subtitle: {
            text: 'Shows how much calories consumed over time'
        },
        series: $scope.data
    };

    
    // Action Methods
    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "MealsTrendController") $scope.navigateBack();
    });

});



// Routings
mealsModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
          .state('mealslist', {
              resolve: {
                  mealsList: function (MealsStore, $stateParams) { return MealsStore.getAllMealsForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              //url: '/identificationInfo',  // cannot use as using params[]
              templateUrl: 'views/meals/list.html',
              controller: 'MealsListController',
              params: { 'patientID': null, 'parentState': null }
          })
          .state('mealForm', {
              resolve: {
                  meal: function (MealsStore, $stateParams) { return MealsStore.getMealByID($stateParams.mealsID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              //url: '/identificationInfo',  // cannot use as using params[]
              templateUrl: 'views/meals/new_entry.html',
              controller: 'MealsFormController',
              params: { 'patientID': null, 'mealsID': null, 'parentState': null }
          })
          .state('caloriestrend', {
              resolve: {
                  caloriesTrendData: function (MealsStore, $stateParams) { return MealsStore.getLineGraphDataForPatient($stateParams.patientID); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              //url: '/identificationInfo',  // cannot use as using params[]
              templateUrl: 'views/meals/trend.html',
              controller: 'MealsTrendController',
              params: { 'patientID': null, 'parentState': null }
          });

});
