var mobiscrollDirectives =  angular.module('dCare.mobiscrollDirectives', []);

mobiscrollDirectives.directive('mobiscrollDate', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.Date = function (date) {
                    if (date) {
                        return (new Date(date));
                    } else {
                        return (new Date());
                    }                    
                };

                $(element).mobiscroll().date(scope.$eval(attrs.mobiscrollConfig));

                // Set model value on widget
                var dateValue = scope.$eval(attrs.ngModel);
                if (dateValue && dateValue != "") {
                    $(element).mobiscroll('setDate', new Date((scope.$eval(attrs.ngModel))), true);
                }

            }
        };
    });

    mobiscrollDirectives.directive('mobiscrollDateTime', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.Date = function (date) {
                    if (date) {
                        return (new Date(date));
                    } else {
                        return (new Date());
                    }
                };

                $(element).mobiscroll().datetime(scope.$eval(attrs.mobiscrollConfig));
                
                // Set model value on widget
                var dateValue = scope.$eval(attrs.ngModel);
                if (dateValue && dateValue != "") {
                    $(element).mobiscroll('setDate', new Date((scope.$eval(attrs.ngModel))), true);
                }

            }
        };
    });