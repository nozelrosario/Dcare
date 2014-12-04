angular.module('starter.controllers', ['ionic','patientsStore.services'])

.controller('DashboardController', function($scope, $ionicLoading, PatientsStore) {
	$ionicLoading.show({
	      template: 'Loading...'
	    });
	//$ionicLoading.hide();
})
