var registrationModule = angular.module('dCare.registration', ['ionic',
                                                                'dCare.Services.UserStore', 'dCare.Services.PatientsStore',
                                                                'dCare.Services.VitalsStore', 'dCare.jqueryDynameterDirectives',
                                                                'dCare.mobiscrollDirectives', 'dCare.Services.CameraService', 
                                                                'dCare.jqueryKnobDirectives', 'dCare.addclearDirectives']);

// Controllers

registrationModule.controller('RegistrationController', function ($scope, $mdDialog, $stateParams, PatientsStore, $state) {
    // NR: here stateParam 'patientID' is not required, might be needed for testing.
    // NR: also no need of passing to the 'identification' controller.

    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : null;

    $scope.isFirstRun = JSON.parse($stateParams.isFirstRun);
    $scope.proceed = function () {
        app.config.isFirstDashboardView = true;
        $state.go("identificationInfo", { parentPatientID: $stateParams.parentPatientID, parentState: $scope.parentState });
    };
    if ($scope.isFirstRun) {
        //$scope.isFirstRun = true;
        $scope.welcomeTitle = "Welcome to D-Care";
        $scope.introductionText = [ { "textLine": "A ultimate solution for your daily diabetes care ." },
		                            { "textLine": "Help us knowing you by completing the registration process." }];
        
    } else {
        $scope.welcomeTitle = "Welcome to D-Care";
        $scope.introductionText = [ { "textLine": "A ultimate solution for your daily diabetes care ." },
		                            { "textLine": "Help us knowing your loved one by completing the registration process." }];
    }

    //Action Methods
    $scope.navigateBack = function () {
        if ($scope.parentState === null) {
            var confirmToggle = $mdDialog.confirm()
                  .title('Exit Application ?')
                  .content('Are you sure you want to close application ?')
                  .ariaLabel('Are you sure you want to close application ??')
                  .ok('Yes')
                  .cancel('No');
            $mdDialog.show(confirmToggle).then(function () {
                // Exit App
                ionic.Platform.exitApp();
            }, function () {
                // Do Nothing
            });
        } else {
            $state.go($scope.parentState, { patientID: $stateParams.parentPatientID });   // Nozel: supress parent state when navigating to next state. block comming back to this page.
        }
        
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "RegistrationController") $scope.navigateBack();
    });
});


/**
* Identification Information
* [FirstName, Last Name, email, Phone ]
*/
registrationModule.controller('IdentificationInfoController', function ($scope, $mdDialog, $ionicHistory, CameraService, $state, $stateParams, PatientsStore, UserStore, patient) {

    $ionicHistory.nextViewOptions({ expire: '' });  //NR: To supress console error when using menu-close directive of side-menu

    if (!patient) {
        // new patient
        $scope.patient = {guid:''};
    } else {
        $scope.patient = patient;
    }

    //NR: Load Profile Photo if available
    if ($scope.patient && $scope.patient.id) {
        //NR: Get Patients profile photo url for current patient
        PatientsStore.getPatientProfilePhoto($scope.patient.id).then(function (photoUrl) {
            if (photoUrl) {
                $scope.profilePhotoURL = photoUrl;
            } else {
                $scope.profilePhotoURL = 'img/ionic.png';
            }            
        }).catch(function () {
            defaultPatient.photo = 'img/ionic.png';
        });
    }
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'registration';
    $scope.changeState = function (patient) {
        $scope.patient = patient;
        // transition to next state
        $state.go("genderInfo", { patientID: $scope.patient.id, parentState: $scope.parentState });
    };
    $scope.saveFailed = function (errorMessage) {
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + errorMessage)
                               .ariaLabel(errorMessage)
                               .ok('OK!'));
    };

    var addPatientToUserInfo = function (patient) {
        var userPatientEntry = {};
        userPatientEntry.fullName = patient.name;
        //userPatientEntry.photo = patient.photo;
        userPatientEntry.guid = patient.guid;
        return UserStore.savePatient(userPatientEntry);
    };

    $scope.proceed = function () {
        if ($scope.identification_info_form.$valid) {
            // @NR: TODO: Remove Dirty defaulting, Implement this pending functionality
            $scope.patient.name = $scope.patient.firstname + " " + $scope.patient.lastname;
            addPatientToUserInfo($scope.patient).then(function (patientEntry) {
                // Switch Cluster to new Patient Scope & Push Patient Data
                app.context.setCurrentCluster(patientEntry.guid);
                $scope.patient.guid = patientEntry.guid;        //NR: Set guid in patient Table too.
                var savePatientDataPromise = PatientsStore.save($scope.patient);
                savePatientDataPromise.then($scope.changeState, $scope.saveFailed);
            }, $scope.saveFailed);
        }        
    };

    $scope.captureFromCamera = function () {
        CameraService.captureImage({ height: 100, width: 100, dataFormat:'blob' }).then(function (image) {
            $scope.profilePhotoURL = blobUtil.createObjectURL(image);
            $scope.patient.attachment = {
                attachmentId: 'profile_photo',
                binary: image,
                type: 'image/png'
            };
        }).catch(function () {
            $mdDialog.show($mdDialog.alert()
                .title('Something went wrong :(')
                .content('This is embarassing!!. Could not capture photo')
                .ariaLabel('Could not capture photo')
                .ok('OK!')).finally(function () { });
        });
    };

    $scope.selectFromGallery = function () {
        CameraService.selectImage({ height: 100, width: 100, dataFormat: 'blob' }).then(function (image) {
            $scope.profilePhotoURL = blobUtil.createObjectURL(image);
            $scope.patient.attachment = {
                attachmentId: 'profile_photo',
                binary: image,
                type: 'image/png'
            };
        }).catch(function () {
            $mdDialog.show($mdDialog.alert()
                .title('Something went wrong :(')
                .content('This is embarassing!!. Could not select photo from gallery')
                .ariaLabel('Could not open photo gallery')
                .ok('OK!')).finally(function () { });
        });
    };

    //Action Methods
    $scope.navigateBack = function () {
        app.config.isFirstDashboardView = false;
        // transition to previous state
        if ($scope.patient && $scope.patient.id) {
            $state.go($scope.parentState, { patientID: $scope.patient.id, parentState: $scope.parentState });
        } else {
            $state.go($scope.parentState, { patientID: $stateParams.parentPatientID });
        }        
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "IdentificationInfoController") $scope.navigateBack();
    });

});

/**
* Gender Information
* [FirstName, Last Name, email, Phone ]
*/
registrationModule.controller('GenderInfoController', function ($scope, $mdDialog, $ionicHistory, $state, $stateParams, PatientsStore, patient) {

    $ionicHistory.nextViewOptions({ expire: '' });  //NR: To supress console error when using menu-close directive of side-menu

    if (!patient) {
        // Empty Patient , should never come at this stage, redirect to default page
        $scope.patient = {};
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + 'Error Code 00002')
                               .ariaLabel('Error Code 00002')
                               .ok('OK!')).finally(function() {
                                    $state.go("identificationInfo", { patientID: "" });
                               });
        
    } else {
        $scope.patient = patient;
    }
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'registration';

    $scope.changeState = function (patient) {
        $scope.patient = patient;
        // transition to next state
        $state.go("ageInfo", { patientID: $scope.patient.id, parentState: $scope.parentState });
    };
    $scope.saveFailed = function (errorMessage) {
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + errorMessage)
                               .ariaLabel(errorMessage)
                               .ok('OK!'));
    };

    $scope.skipAndProceed = function () {
        $scope.changeState($scope.patient);
    };

    $scope.saveAndProceed = function () {        
        var savePatientDataPromise = PatientsStore.save($scope.patient);
        savePatientDataPromise.then($scope.changeState, $scope.saveFailed);
    };

    $scope.registerMale = function () {
        $scope.patient.gender = "male";
        var savePatientDataPromise = PatientsStore.save($scope.patient);
        savePatientDataPromise.then($scope.changeState, $scope.saveFailed);
    };

    $scope.registerFemale = function () {
        $scope.patient.gender = "female";
        var savePatientDataPromise = PatientsStore.save($scope.patient);
        savePatientDataPromise.then($scope.changeState, $scope.saveFailed);
    };

    //Action Methods
    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $stateParams.patientID, parentState: $scope.parentState });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "GenderInfoController") $scope.navigateBack();
    });

});

/**
* Age Information
* [Birthdate & Age ]
*/
registrationModule.controller('AgeInfoController', function ($scope, $mdDialog, $ionicHistory, $state, $stateParams, PatientsStore, patient) {

    $ionicHistory.nextViewOptions({ expire: '' });  //NR: To supress console error when using menu-close directive of side-menu

    if (!patient) {
        //Nozel : Empty Patient , should never come at this stage, redirect to default page
        $scope.patient = {};
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!! Please Try again.')
                               .ariaLabel('Something went wrong :(')
                               .ok('OK!')).finally(function () {
                                   $state.go("identificationInfo", { patientID: "" });
                               });

    } else {
        $scope.patient = patient;
    }
    $scope.parentState = ($stateParams.parentState) ? $stateParams.parentState : 'registration';

    $scope.calculateAge = function() {
        var now = new Date(), birthdate="";
        if($scope.patient.birthdate) birthdate = new Date($scope.patient.birthdate);
        if (!$scope.patient.birthdate || birthdate > new Date()) return 0; // if the birthday is not defined yet return 'undefined'
        $scope.patient.age = Math.round((now - birthdate) / (100 * 60 * 60 * 24 * 365)) / 10; // calculate the age in years with one decimal
    };

    $scope.changeState = function (patient) {
        $scope.patient = patient;
        // transition to next state
        if ($scope.parentState === "dashboard") {       //NR: in case of calling via. edid profile from dashboard skip the vitals part.
            $state.go("dashboard", { patientID: $scope.patient.id });
        } else {
            $state.go("bodysizeInfo", { patientID: $scope.patient.id });
        }        
    };
    $scope.saveFailed = function (errorMessage) {
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Please Try again')
                               .ariaLabel(errorMessage)
                               .ok('OK!'));
    };

    $scope.skipAndProceed = function () {
        //$scope.patient.gender = "male";
        //var savePatientDataPromise = PatientsStore.save($scope.patient);
        //savePatientDataPromise.then($scope.changeState, $scope.saveFailed);
        // Show confirmation message and proceed
        $scope.changeState($scope.patient);
    };

    $scope.saveAndProceed = function () {
        if ($scope.age_info_form.$valid) {
            var savePatientDataPromise = PatientsStore.save($scope.patient);
            savePatientDataPromise.then($scope.changeState, $scope.saveFailed);
        }
    };

    //Action Methods
    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $stateParams.patientID, parentState: $scope.parentState });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "AgeInfoController") $scope.navigateBack();
    });

});


/**
* Body Size Information
* [Height & Weight ]
*/
registrationModule.controller('BodySizeInfoController', function ($scope, $mdDialog, $state, $stateParams, PatientsStore, VitalsStore, vitals) {
    if ((!$stateParams.patientID || $stateParams.patientID == "") && (!$stateParams.vitalsID || $stateParams.vitalsID == "")) {
        // Empty Patient Id , shouls never come at this stage, redirect to default page
        $scope.patient = {};
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + 'Error Code 00004')
                               .ariaLabel('Error Code 00004')
                               .ok('OK!')).finally(function() {
                                    $state.go("identificationInfo", { patientID: "" });
                               });
        
    } else {

        if (vitals) {
            $scope.vitals = vitals;
        } else {
            if($stateParams.patientID && $stateParams.patientID != "") {
                // create new record for vitals with current patient
                $scope.vitals = { patientID: parseInt($stateParams.patientID), heightunit: "Cm", weightunit: "Kg", datetime: castToLongDate(new Date()) };
            } else {
                $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + 'Error Code 00005')
                               .ariaLabel('Error Code 00005')
                               .ok('OK!')).finally(function() {
                                    $state.go("identificationInfo", { patientID: "" });
                               });
            }
            
        }

    }

    $scope.calculateBMI = function () {
        // Metric Units: BMI = Weight (kg) / (Height (m) x Height (m))
        //English Units: BMI = Weight (lb) / (Height (in) x Height (in)) x 703
        //http://www.freebmicalculator.net/healthy-bmi.php
        if ($scope.vitals.weight > 0 && $scope.vitals.height > 0) {
            $scope.vitals.bmi = parseInt($scope.vitals.weight / (($scope.vitals.height / 100) * ($scope.vitals.height / 100)));   //NR: convert height to meter & calculate
        } else {
            $scope.vitals.bmi = 0;
        }
    };

    $scope.changeState = function (vitals) {
        $scope.vitals = vitals;
        // transition to next state with patientID form vitals [$scope.vitals.patientID]
         $state.go("bloodpressureInfo",{patientID: $scope.vitals.patientID, vitalsID: $scope.vitals.id });
    };
    $scope.saveFailed = function (errorMessage) {
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + errorMessage)
                               .ariaLabel(errorMessage)
                               .ok('OK!'));
    };

    $scope.skipAndProceed = function () {
        //$scope.patient.gender = "male";
        //var savePatientDataPromise = PatientsStore.save($scope.patient);
        //savePatientDataPromise.then($scope.changeState, $scope.saveFailed);
        // Show confirmation message and proceed
        $scope.changeState($scope.vitals);
    };

    $scope.saveAndProceed = function () {
        if ($scope.bodysize_info_form.$valid) {
            $scope.vitals.height = parseInt($scope.vitals.height);
            var saveVitalsDataPromise = VitalsStore.save($scope.vitals);
            saveVitalsDataPromise.then($scope.changeState, $scope.saveFailed);
        }
    };

    //Action Methods
    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $stateParams.patientID, parentState: $scope.parentState });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "BodySizeInfoController") $scope.navigateBack();
    });

});


/**
* Bloodpressure Information
* [Systolic & Diastolic ]
*/
registrationModule.controller('BloodPressureInfoController', function ($scope, $mdDialog, $state, $stateParams, PatientsStore, VitalsStore, vitals) {
    if ((!$stateParams.patientID || $stateParams.patientID == "") && (!$stateParams.vitalsID || $stateParams.vitalsID == "")) {
        // Empty Patient Id , shouls never come at this stage, redirect to default page
        $scope.patient = {};
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + 'Error Code 00004')
                               .ariaLabel('Error Code 00004')
                               .ok('OK!')).finally(function() {
                                    $state.go("identificationInfo", { patientID: "" });
                               });
        
    } else {

        //If vitals id passed, load existing data for vitals
        if (vitals) {
            $scope.vitals = vitals;
        } else {
            if($stateParams.patientID && $stateParams.patientID != "") {
                // create new record for vitals with current patient
                $scope.vitals = { patientID:parseInt($stateParams.patientID) };
            } else {
                $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + 'Error Code 00005')
                               .ariaLabel('Error Code 00005')
                               .ok('OK!')).finally(function() {
                                    $state.go("identificationInfo", { patientID: "" });
                               });
            }
            
        }

    }

    $scope.validate = function() {

        //NR TODO : Validate and sow error and clear model values if needed
        
    };

    $scope.changeState = function (vitals) {
        $scope.vitals = vitals;
        // transition to next state with patientID form vitals [$scope.vitals.patientID]
        $state.go("dashboard", { patientID: $scope.vitals.patientID});
    };
    $scope.saveFailed = function (errorMessage) {
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + errorMessage)
                               .ariaLabel(errorMessage)
                               .ok('OK!'));
    };

    $scope.skipAndProceed = function () {
        //$scope.patient.gender = "male";
        //var savePatientDataPromise = PatientsStore.save($scope.patient);
        //savePatientDataPromise.then($scope.changeState, $scope.saveFailed);
        // Show confirmation message and proceed
        $scope.changeState($scope.vitals);
    };

    $scope.saveAndProceed = function () {
        if ($scope.bloodpressure_info_form.$valid) {
            var saveVitalsDataPromise = VitalsStore.save($scope.vitals);
            saveVitalsDataPromise.then($scope.changeState, $scope.saveFailed);
        }
    };

    //Action Methods
    $scope.navigateBack = function () {
        // transition to previous state
        $state.go($scope.parentState, { patientID: $stateParams.patientID, parentState: $scope.parentState });
    };

    $scope.$on("navigate-back", function (event, data) {
        if (data.intendedController === "BloodPressureInfoController") $scope.navigateBack();
    });

});




// Routings
registrationModule.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('identificationInfo', {
            //url: '/identificationInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/identification_info.html',
            resolve: {
                patient: function (PatientsStore, $stateParams) { return ($stateParams.patientID) ? PatientsStore.getPatientByID($stateParams.patientID) : null ; }
            },
            controller: 'IdentificationInfoController',
            params: { 'patientID': null, 'parentPatientID': null, 'parentState': null }
        })
        .state('genderInfo', {
            //url: '/genderInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/gender_info.html',
            resolve: {
                patient: function (PatientsStore, $stateParams) { return ($stateParams.patientID) ? PatientsStore.getPatientByID($stateParams.patientID) : null; }
            },
            controller: 'GenderInfoController',
            params: { 'patientID': null, 'parentState': 'identificationInfo' }
        })
        .state('ageInfo', {
            //url: '/genderInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/age_info.html',
            resolve: {
                patient: function (PatientsStore, $stateParams) { return ($stateParams.patientID) ? PatientsStore.getPatientByID($stateParams.patientID) : null; }
            },
            controller: 'AgeInfoController',
            params: { 'patientID': null, 'parentState': 'genderInfo' }
        })
        .state('bodysizeInfo', {
            //url: '/genderInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/body_size_info.html',
            resolve : {
                vitals : function(VitalsStore, $stateParams) { return ($stateParams.vitalsID) ? VitalsStore.getVitalByID($stateParams.vitalsID) : null; }
            },
            controller: 'BodySizeInfoController',
            params: { 'patientID': null, 'vitalsID': null, 'parentState': 'ageInfo' }
        })
        .state('bloodpressureInfo', {
            //url: '/genderInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/bloodpressure_info.html',
            resolve : {
                vitals : function(VitalsStore, $stateParams) { return ($stateParams.vitalsID) ? VitalsStore.getVitalByID($stateParams.vitalsID) : null; }
            },
            controller: 'BloodPressureInfoController',
            params: { 'patientID': null, 'vitalsID': null, 'parentState': 'bodysizeInfo' }
        });

});