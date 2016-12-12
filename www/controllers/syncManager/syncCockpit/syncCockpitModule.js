var syncCockpitModule = angular.module('dCare.syncCockpit', ['ionic',
                                                             'dCare.SyncManager', 'dCare.Services.UserStore']);

//Controllers
syncCockpitModule.controller('SyncCockpitController', function ($scope, $ionicSideMenuDelegate, $ionicHistory, $mdDialog, $state, $stateParams, UserStore, SyncManagerService, syncSummary, currentPatient, allPatients) {

    $ionicHistory.nextViewOptions({ expire: '' });  //NR: To supress console error when using menu-close directive of side-menu

    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'dashboard';

    // Init Menu
    $scope.menuItems = [
                        { id: 1, title: 'Dashboard', subTitle: 'Your summary page', icon: 'img/home-dashboard.png' }//,
                        //{ id: 2, title: 'Add New', subTitle: 'Add a new glucose measurement', icon: 'img/add-new.png' },
                        //{ id: 3, title: 'See Trend', subTitle: 'Blood glucose graph', icon: 'img/chart.png' }//,
                        //{ id: 4, title: 'Alerts / Recomendations', subTitle: 'Your Messages & Alerts', icon: 'img/alerts-recommendations.png' },
                        //{ id: 5, title: 'Settings', subTitle: 'Change Application preferences', icon: 'img/settings.png' }
                       ];

    // init enums [to add more enums use $.extend($scope.enums, newEnum)]
    $scope.enums = SyncRegistry.enums;

    // Init Data
    $scope.syncSummary = syncSummary;
    $scope.currentPatient = currentPatient;
    $scope.allPatients = allPatients;
    $scope.syncStatus = app.context.syncStatus;
    $scope.syncInterval = 3;

    // Action Methods
    $scope.showHelp = function () {
        $scope.showOverlayHelp = true;
    };
   
    $scope.activateMenuItem = function (menuItemId) {
        switch (menuItemId) {
            case 1:
                $state.go("dashboard", { patientID: $stateParams.patientID });
                break;
            default:
                alert('No Match');
        }
    };

    $scope.$watch(function () { return app.context.syncStatus; }, function (oldVal, newVal) {
        $scope.syncStatus = newVal;
    });

    $scope.syncAll = function () {
        //app.context.syncStatus = "in-progress";
        SyncManagerService.doFullSync().then(function () {
            app.log.info("Sync Done");
           // app.context.syncStatus = "complete";
        }).catch(function () {
            app.log.info("Sync Failed");
           // app.context.syncStatus = "error";
        });
    };

    $scope.toggleActionsMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.showSyncDetail = function (patient) {        
        var clusterSyncDetailController = function ($scope, $mdDialog, patient, syncSummary) {
            $scope.patient = patient;
            $scope.syncSummary = syncSummary;
            $scope.closeDialog = function () {
                isEditMode = false;
                $mdDialog.hide();
            };            
        };

        $mdDialog.show({
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            templateUrl: 'controllers/syncManager/syncCockpit/clusterSyncDetail.html',
            locals: {
                patient: patient,
                syncSummary: syncSummary
            },
            controller: clusterSyncDetailController
        });
    };

    //Action Methods
    $scope.navigateBack = function () {
        // transition to previous state
        app.log.info("State reached : "  + $scope.parentState);
        $state.go($scope.parentState, { patientID: $scope.currentPatient.id });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "SyncCockpitController") $scope.navigateBack();
    });

});

// Routings
syncCockpitModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
          .state('syncCockpit', {
              resolve: {
                  syncSummary: function ($stateParams) { return SyncRegistry.getSyncSummary(); },
                  allPatients: function ($stateParams, UserStore) { return UserStore.getAllPatients(); },
                  currentPatient: function (PatientsStore, $stateParams) { return PatientsStore.getPatientByID($stateParams.patientID); }
              },
              templateUrl: 'controllers/syncManager/syncCockpit/syncCockpit.html',
              controller: 'SyncCockpitController',
              params: { 'patientID': null, 'parentState': null }
          });

});
