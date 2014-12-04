var addclearDirectives = angular.module('dCare.addclearDirectives', []);

mobiscrollDirectives.directive('addClear', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var config = scope.$eval(attrs.addClearConfig);
                var modelAccessor = $parse(attrs.ngModel);
                config.onClear = function() {
                    modelAccessor.assign(scope, "");
                };
                $(element).addClear(config);
            }
        };
    });