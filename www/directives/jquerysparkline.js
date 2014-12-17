var jqSparklineDirectives = angular.module('dCare.jqSparklineDirectives', []);

jqSparklineDirectives.directive('jqSparkline', [function () {
    'use strict';
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {

            var compositeConfig = angular.fromJson(scope.$eval(attrs.sparklineConfig));  // convert to json
            scope.$watch(attrs.ngModel, function () {
                render();
            });

            scope.$watch(attrs.sparklineConfig, function () {
                render();
            });

            var render = function () {
                var model, isCompositeConfig = false, isCompositeModel = false;

                // config can be one of foll :
                // {type:'line', spotColoe: 'green', lineWidth: 5}
                // [{type:'line', lineColor: 'green', lineWidth: 5} , {type:'line', lineColor: 'red', lineWidth: 5}]

                if (angular.isArray(compositeConfig)) {
                    isCompositeConfig = true;
                } else if (angular.isObject(compositeConfig)) {
                    isCompositeConfig = false;
                }

                //Setup Model : Model can be [1,2,3,4,5] or [[1,2,3,4,5],[6,7,8,9]]
                // Trim trailing comma if we are a string
                angular.isString(ngModel.$viewValue) ? model = ngModel.$viewValue.replace(/(^,)|(,$)/g, "") : model = ngModel.$viewValue;
                // convert model to json
                model = angular.fromJson(model);
                // Validate data & render sparkline
                var composite = false;
                if (angular.isArray(model)) {
                    for (var j = 0; j < model.length; j++) {
                        if (angular.isArray(model[j])) {
                            if (j != 0 && isCompositeModel != true) {
                                alert("Data not in valid format!!");
                                break;
                            } else {
                                isCompositeModel = true;
                                $(elem).sparkline(model[j], (isCompositeConfig) ? reconcileConfig(compositeConfig[j], composite) : reconcileConfig(compositeConfig, composite));
                                composite = true;
                            }
                        } else {
                            if (j != 0 && isCompositeModel != false) {
                                alert("Data not in valid format!!");
                                break;
                            } else {
                                isCompositeModel = false;
                            }
                        }
                    }
                }
                // In case not composite, render once
                if (!isCompositeModel) $(elem).sparkline(model, reconcileConfig(compositeConfig));

            };

            // can be used for validating & defaulting config options
            var reconcileConfig = function (config, composite) {
                if (!config) config = {};
                config.type = config.type || 'line';
                config.composite = composite;
                config.disableTooltips = true;
                //config.disableInteraction = true;
                return config;
            };
        }
    }
} ]);