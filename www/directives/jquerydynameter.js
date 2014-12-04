var jqueryDynameterDirectives = angular.module('dCare.jqueryDynameterDirectives', []);

jqueryDynameterDirectives.directive('jqueryDynameter', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var dynameterConfig = scope.$eval(attrs.jqueryDynameterConfig);
            var dynameterWidget = $(element).dynameter(dynameterConfig);
            setTimeout(function () { dynameterWidget.trigger('change'); }, 200);  // NR: Hack to re-paint knob when renderedfirst time.
            //NR: update know when scope value changes
            scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                    dynameterWidget.changeValue(newValue);
            });
        }
    };
});