var jqueryKnobDirectives = angular.module('dCare.jqueryKnobDirectives', []);

jqueryKnobDirectives.directive('jqueryKnob', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var knobConfig = scope.$eval(attrs.jqueryKnobConfig);
            var modelAccessor = $parse(attrs.ngModel);
            var ngChangeExpression;
            if (typeof attrs.ngChange != 'undefined') {
                ngChangeExpression = ';' + attrs.ngChange;
            }
            
            var updateScope = function (v) {
                scope.$apply(function (scope) {
                    modelAccessor.assign(scope, Math.round(v));  //NR: assign changed value in scope
                });
                if (ngChangeExpression) scope.$apply(ngChangeExpression);
            };
            knobConfig.change = updateScope;
           // knobConfig.release = updateScope; //NR: Issue with Knob control, release doesnot trigger change event, hence mouse scroll not working
            $(element).knob(knobConfig);
            setTimeout(function () { $(element).trigger('change'); }, 200);  // NR: Hack to re-paint knob when renderedfirst time.
            //NR: update know when scope value changes
            scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                if (newValue != oldValue) {
                    $(element).val(newValue, true).trigger('change');
                }
            });
        }
    };
});