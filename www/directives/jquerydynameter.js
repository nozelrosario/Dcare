var jqueryDynameterDirectives = angular.module('dCare.jqueryDynameterDirectives', []);

jqueryDynameterDirectives.directive('jqueryDynameter', function ($parse, $timeout) {
    return {
        restrict: 'A',
        compile: function(element, attributes){
            var linkFunction = function (scope, element, attrs) {
                var dynameterConfig = scope.$eval(attrs.jqueryDynameterConfig);
                var dynameterWidget = $(element).dynameter(dynameterConfig);
                //$timeout(function () {
                //    dynameterWidget.trigger('change');
                //    dynameterWidget.css("display", "inherit");
                //}, 200);  // NR: Hack to re-paint knob when renderedfirst time.

                //NR: update know when scope value changes
                scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                    dynameterWidget.changeValue(newValue);
                });
            };

            return linkFunction;
        }
        
    };
});