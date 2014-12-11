var mobiscrollDirectives =  angular.module('dCare.dateTimeBoxDirectives', []);

mobiscrollDirectives.directive('dateTimeBox', function () {
    return {
        restrict: 'E',
        require: '^ngModel',
        scope: {
            ngModel: '='
        },
        template: "    <span class='weekday'>{{ngModel | date:'EEE'}}</span>\
                       <span class='day'>{{ngModel | date:'dd'}}</span>\
                       <span class='month'>{{ngModel | date:'MMM'}} {{ngModel | date:'yyyy'}}</span>\
                       <span class='year'>{{ngModel | date:'shortTime'}}</span>",
        link: function (scope, element, attr) {
            var size = (attr.boxSize) ? attr.boxSize : "20px";
            var position = (attr.boxPositioning) ? attr.boxPositioning : "inline-flex"; // can be one of ['position-pixels', 'position-em', 'inline-flex']
            element.addClass(position);
            element.css("font-size", size);
            element.addClass("date-as-calendar");
        }
    };
});