var registrationModule = angular.module('dCare.registration', ['ionic',
                                                                'dCare.Services.PatientsStore', 'dCare.Services.VitalsStore',
                                                                'dCare.jqueryDynameterDirectives', 'dCare.mobiscrollDirectives', 'dCare.jqueryKnobDirectives', 'dCare.addclearDirectives']);

// Controllers

registrationModule.controller('RegistrationController', function ($scope, $stateParams, PatientsStore, $state) {
    // NR: here stateParam 'patientID' is not required, might be needed for testing.
    // NR: also no need of passing to the 'identification' controller.

    $scope.isFirstRun = JSON.parse($stateParams.isFirstRun);
    $scope.proceed = function () {
        $state.go("identificationInfo", { patientID: $stateParams.patientID });
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
});


/**
* Identification Information
* [FirstName, Last Name, email, Phone ]
*/
registrationModule.controller('IdentificationInfoController', function ($scope, $mdDialog, $state, $stateParams, PatientsStore, patient) {
    if (!patient) {
        // new patient
        $scope.patient = {};
    } else {
        $scope.patient = patient;
    }

    $scope.changeState = function (patient) {
        $scope.patient = patient;
        // transition to next state
        $state.go("genderInfo",{patientID: $scope.patient.id});
    };
    $scope.saveFailed = function (errorMessage) {
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + errorMessage)
                               .ariaLabel(errorMessage)
                               .ok('OK!'));
    };

    $scope.proceed = function () {
        var savePatientDataPromise = PatientsStore.save($scope.patient);
        savePatientDataPromise.then($scope.changeState, $scope.saveFailed);
    };

});

/**
* Gender Information
* [FirstName, Last Name, email, Phone ]
*/
registrationModule.controller('GenderInfoController', function ($scope, $mdDialog, $state, $stateParams, PatientsStore, patient) {
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

    $scope.changeState = function (patient) {
        $scope.patient = patient;
        // transition to next state
        $state.go("ageInfo",{patientID: $scope.patient.id});
    };
    $scope.saveFailed = function (errorMessage) {
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + errorMessage)
                               .ariaLabel(errorMessage)
                               .ok('OK!'));
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

});

/**
* Age Information
* [Birthdate & Age ]
*/
registrationModule.controller('AgeInfoController', function ($scope, $mdDialog, $state, $stateParams, PatientsStore, patient) {
    if (!patient) {
        // Empty Patient , should never come at this stage, redirect to default page
        $scope.patient = {};
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + 'Error Code 00002')
                               .ariaLabel('Error Code 00002')
                               .ok('OK!')).finally(function () {
                                   $state.go("identificationInfo", { patientID: "" });
                               });

    } else {
        $scope.patient = patient;
    }

    $scope.calculateAge = function() {
        var now = new Date(), birthdate="";
        if($scope.patient.birthdate) birthdate = new Date($scope.patient.birthdate);
        if (!$scope.patient.birthdate || birthdate > new Date()) return 0; // if the birthday is not defined yet return 'undefined'
        $scope.patient.age = Math.round((now - birthdate) / (100 * 60 * 60 * 24 * 365)) / 10; // calculate the age in years with one decimal
    };

    $scope.changeState = function (patient) {
        $scope.patient = patient;
        // transition to next state
        $state.go("bodysizeInfo",{patientID: $scope.patient.id});
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
        $scope.changeState($scope.patient);
    };

    $scope.saveAndProceed = function () {
        var savePatientDataPromise = PatientsStore.save($scope.patient);
        savePatientDataPromise.then($scope.changeState, $scope.saveFailed);
    };

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
            $scope.vitals.bmi = parseInt(($scope.vitals.height / $scope.vitals.weight) * $scope.vitals.height);
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
        $scope.vitals.height = parseInt($scope.vitals.height);
        var saveVitalsDataPromise = VitalsStore.save($scope.vitals);
        saveVitalsDataPromise.then($scope.changeState, $scope.saveFailed);
    };

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
        var saveVitalsDataPromise = VitalsStore.save($scope.vitals);
        saveVitalsDataPromise.then($scope.changeState, $scope.saveFailed);
    };

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
            params: { 'patientID': null }
        })
        .state('genderInfo', {
            //url: '/genderInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/gender_info.html',
            resolve: {
                patient: function (PatientsStore, $stateParams) { return ($stateParams.patientID) ? PatientsStore.getPatientByID($stateParams.patientID) : null; }
            },
            controller: 'GenderInfoController',
            params: { 'patientID': null }
        })
        .state('ageInfo', {
            //url: '/genderInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/age_info.html',
            resolve: {
                patient: function (PatientsStore, $stateParams) { return ($stateParams.patientID) ? PatientsStore.getPatientByID($stateParams.patientID) : null; }
            },
            controller: 'AgeInfoController',
            params: { 'patientID': null }
        })
        .state('bodysizeInfo', {
            //url: '/genderInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/body_size_info.html',
            resolve : {
                vitals : function(VitalsStore, $stateParams) { return ($stateParams.vitalsID) ? VitalsStore.getVitalByID($stateParams.vitalsID) : null; }
            },
            controller: 'BodySizeInfoController',
            params: { 'patientID': null, 'vitalsID': null }
        })
        .state('bloodpressureInfo', {
            //url: '/genderInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/bloodpressure_info.html',
            resolve : {
                vitals : function(VitalsStore, $stateParams) { return ($stateParams.vitalsID) ? VitalsStore.getVitalByID($stateParams.vitalsID) : null; }
            },
            controller: 'BloodPressureInfoController',
            params: { 'patientID': null, 'vitalsID': null }
        });

});