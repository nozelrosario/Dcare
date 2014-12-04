var mobiscrollDirectives =  angular.module('dCare.mobiscrollDirectives', []);

mobiscrollDirectives.directive('mobiscrollDate', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).mobiscroll().date(scope.$eval(attrs.mobiscrollConfig));
            }
        };
    });