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
registrationModule.controller('IdentificationInfoController', function ($scope, $mdDialog, $state, $stateParams, PatientsStore) {
    if (!$stateParams.patientID || $stateParams.patientID == "") {
        // new patient
        $scope.patient = {};
    } else {

    // TODO : Implement this via resolve on state provider : https://github.com/angular-ui/ui-router/wiki#resolve
        //alert("id = " + $stateParams.patientID);
        // existing patient , load data first
        var getPatientDataPromise = PatientsStore.getPatientByID($stateParams.patientID);
        getPatientDataPromise.then(function (patientData) {
            $scope.patient = patientData;
        });
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
registrationModule.controller('GenderInfoController', function ($scope, $mdDialog, $state, $stateParams, PatientsStore) {
    if (!$stateParams.patientID || $stateParams.patientID == "") {
        // Empty Patient Id , shouls never come at this stage, redirect to default page
        $scope.patient = {};
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + 'Error Code 00002')
                               .ariaLabel('Error Code 00002')
                               .ok('OK!')).finally(function() {
                                    $state.go("identificationInfo", { patientID: "" });
                               });
        
    } else {

    // TODO : Implement this via resolve on state provider : https://github.com/angular-ui/ui-router/wiki#resolve
        //alert("id = " + $stateParams.patientID);
        // existing patient , load data first
        var getPatientDataPromise = PatientsStore.getPatientByID($stateParams.patientID);
        getPatientDataPromise.then(function (patientData) {
            $scope.patient = patientData;
        });
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
registrationModule.controller('AgeInfoController', function ($scope, $mdDialog, $state, $stateParams, PatientsStore) {
    if (!$stateParams.patientID || $stateParams.patientID == "") {
        // Empty Patient Id , shouls never come at this stage, redirect to default page
        $scope.patient = {};
        $mdDialog.show($mdDialog.alert()
                               .title('Something went wrong :(')
                               .content('This is embarassing!!. Operation responded with ' + 'Error Code 00003')
                               .ariaLabel('Error Code 00003')
                               .ok('OK!')).finally(function() {
                                    $state.go("identificationInfo", { patientID: "" });
                               });
        
    } else {

    // TODO : Implement this via resolve on state provider : https://github.com/angular-ui/ui-router/wiki#resolve
        //alert("id = " + $stateParams.patientID);
        // existing patient , load data first
        var getPatientDataPromise = PatientsStore.getPatientByID($stateParams.patientID);
        getPatientDataPromise.then(function (patientData) {
            $scope.patient = patientData;
        });
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
registrationModule.controller('BodySizeInfoController', function ($scope, $mdDialog, $state, $stateParams, PatientsStore, VitalsStore) {
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
        //alert("id = " + $stateParams.patientID);
        // existing patient , load data first : Currently not required to load patient data here, as only dealing with Vitals
//        if($stateParams.patientID && $stateParams.patientID != "") {
//            var getPatientDataPromise = PatientsStore.getPatientByID($stateParams.patientID);
//            getPatientDataPromise.then(function (patientData) {
//                $scope.patient = patientData;
//            });
//        }

// TODO : Implement this via resolve on state provider : https://github.com/angular-ui/ui-router/wiki#resolve
        //If vitals id passed, load existing data for vitals
        if($stateParams.vitalsID && $stateParams.vitalsID != "") {
            var getvitalsDataPromise = VitalsStore.getVitalByID($stateParams.vitalsID);
            getvitalsDataPromise.then(function (vitalsData) {
                $scope.vitals = vitalsData;
            });
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
registrationModule.controller('BloodPressureInfoController', function ($scope, $mdDialog, $state, $stateParams, PatientsStore, VitalsStore) {
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
        //alert("id = " + $stateParams.patientID);
        // existing patient , load data first : Currently not required to load patient data here, as only dealing with Vitals
//        if($stateParams.patientID && $stateParams.patientID != "") {
//            var getPatientDataPromise = PatientsStore.getPatientByID($stateParams.patientID);
//            getPatientDataPromise.then(function (patientData) {
//                $scope.patient = patientData;
//            });
//        }


        // TODO : Implement this via resolve on state provider : https://github.com/angular-ui/ui-router/wiki#resolve
        //If vitals id passed, load existing data for vitals
        if($stateParams.vitalsID && $stateParams.vitalsID != "") {
            var getvitalsDataPromise = VitalsStore.getVitalByID($stateParams.vitalsID);
            getvitalsDataPromise.then(function (vitalsData) {
                $scope.vitals = vitalsData;
            });
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
            controller: 'IdentificationInfoController',
            params: ['patientID']
        })
        .state('genderInfo', {
            //url: '/genderInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/gender_info.html',
            controller: 'GenderInfoController',
            params: ['patientID']
        })
        .state('ageInfo', {
            //url: '/genderInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/age_info.html',
            controller: 'AgeInfoController',
            params: ['patientID']
        })
        .state('bodysizeInfo', {
            //url: '/genderInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/body_size_info.html',
            controller: 'BodySizeInfoController',
            params: ['patientID','vitalsID']
        })
        .state('bloodpressureInfo', {
            //url: '/genderInfo',  // cannot use as using params[]
            templateUrl: 'views/registration/bloodpressure_info.html',
            controller: 'BloodPressureInfoController',
            params: ['patientID','vitalsID']
        });

});