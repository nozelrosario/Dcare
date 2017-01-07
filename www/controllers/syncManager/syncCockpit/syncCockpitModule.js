var syncCockpitModule = angular.module('dCare.syncCockpit', ['ionic',
                                                             'dCare.SyncManager', 'dCare.Services.UserStore', 'dCare.Services.SettingsStore']);

//Controllers
syncCockpitModule.controller('SyncCockpitController', function ($scope, SettingsStore, $ionicSideMenuDelegate, $ionicHistory, $mdDialog, $ionicLoading, $state, $stateParams, UserStore, SyncManagerService, syncSummary, currentPatient, allPatients) {

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
    $scope.syncInterval = (app.config.syncInterval > 0)? (app.config.syncInterval / 1000): 0;

    // Action Methods
    $scope.showHelp = function () {
        $scope.showOverlayHelp = true;
    };

    $scope.refreshData = function () {
        SyncRegistry.getSyncSummary().then(function (syncSummary) {
            $scope.syncSummary = syncSummary;
        });
        UserStore.getAllPatients().then(function (allPatients) {
            $scope.allPatients = allPatients;
        });        
    };

    $scope.saveSyncInterval = function (value) {
        $ionicLoading.show({ template: '<md-progress-circular md-mode="indeterminate" md-diameter="70"></md-progress-circular>', noBackdrop: true });
        if (value > 0) {
            value = value * 1000; //Save as milliseconds
        }
        SettingsStore.save('syncInterval', value).then(function () {
            app.config.syncInterval = value;
            $ionicLoading.hide();
        }).catch(function () {
            $ionicLoading.hide();
        });
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

   // $scope.$watch(function () { return app.context.syncStatus; }, function (oldVal, newVal) {
    //    $scope.syncStatus = newVal;
   // });

    $scope.syncAll = function () {
        $scope.syncStatus = 'busy';
        SyncManagerService.doFullSync().then(function () {
            $scope.syncStatus = 'complete';
            $scope.refreshData();
            app.log.info("Sync Done");
        }).catch(function () {
            $scope.syncStatus = 'error';
            app.log.info("Sync Failed");
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
