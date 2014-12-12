var mobiscrollDirectives =  angular.module('dCare.mobiscrollDirectives', []);

mobiscrollDirectives.directive('mobiscrollDate', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).mobiscroll().date(scope.$eval(attrs.mobiscrollConfig));
            }
        };
    });

    mobiscrollDirectives.directive('mobiscrollDateTime', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).mobiscroll().datetime(scope.$eval(attrs.mobiscrollConfig));
                
                // Set model value on widget
                var dateValue = scope.$eval(attrs.ngModel);
                if (dateValue && dateValue != "") {
                    $(element).mobiscroll('setDate', new Date(JSON.parse(scope.$eval(attrs.ngModel))), true);
                }

            }
        };
    });