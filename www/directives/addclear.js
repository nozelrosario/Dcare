var addclearDirectives = angular.module('dCare.addclearDirectives', []);

mobiscrollDirectives.directive('addClear', function ($parse) {
    return {
        restrict: 'A',
        link: {
            post: function (scope, element, attrs) {
                var config = scope.$eval(attrs.addClearConfig);
                if (attrs.ngModel) {
                    var modelAccessor = $parse(attrs.ngModel);
                    config.onClear = function () {
                        scope.$apply(function (scope) {
                            modelAccessor.assign(scope, ((config.resetValue)?config.resetValue:""));
                            if (attrs.ngChange) scope.$eval(attrs.ngChange);
                        });
                    };
                }
                $(element).addClear(config);
            }
        }
    };
});