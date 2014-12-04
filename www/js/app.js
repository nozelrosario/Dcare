// Ionic D-Care App

// angular.module is a global place for creating, registering and retrieving Angular modules

var dCare = angular.module('dCare', ['ionic', 'starter.controllers', 'dCare.registration', 'ngMaterial']);

dCare.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

    });
});


/*
* App Config 
*/
dCare.config(function ($logProvider) {
    $logProvider.debugEnabled(true);
});

/*
* App Initialization 
*/
dCare.controller('InitApp', function ($state) {
    $state.transitionTo('start');
});


