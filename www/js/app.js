// Ionic D-Care App

// angular.module is a global place for creating, registering and retrieving Angular modules

var dCare = angular.module('dCare', ['ionic', 'dCare.init', 'dCare.registration', 'dCare.dashboard', 'ngMaterial', 'ngMessages', 'dCare.overlayHelp']);

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
    document.addEventListener("deviceready", function () {
        app.log.info("CORDOVA PLATFORM READY!!");
    }, false);
});


/*
* App Config 
*/
dCare.config(function ($logProvider, $mdThemingProvider) {
    $logProvider.debugEnabled((app.LOGGINGLEVEL !== "off"));

    $mdThemingProvider.theme('default')
    .primaryPalette('amber', {
        'default': '400',   // by default use shade 400 from the pink palette for primary intentions
        'hue-1': '100',     // use shade 100 for the <code>md-hue-1</code> class
        'hue-2': '600',     // use shade 600 for the <code>md-hue-2</code> class
        'hue-3': 'A100'     // use shade A100 for the <code>md-hue-3</code> class
    })
    // If you specify less than all of the keys, it will inherit from the
    // default shades
    .accentPalette('amber', {
        'default': '200' // use shade 200 for default, and keep all other shades the same
    });

});

/*
* App Initialization 
*/
dCare.controller('InitApp', function ($state) {
    $state.transitionTo('start');
});


