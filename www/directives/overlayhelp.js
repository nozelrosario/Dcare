var appHelpDirectives = angular.module('dCare.overlayHelp', []);

//TODO: Revamp this directive for more intuitive functionality via. config properties and more configurable.
appHelpDirectives.directive('overlayHelp', function ($compile) {
    return {
        restrict: 'E',
        //require: '^ngModel',
        transclude: true,
        scope: {
            topLeftInfo: '@',
            topRightInfo: '@',
            midLeftInfo: '@',
            midRightInfo: '@',
            show: '='
        },
        compile: function (element, attr) {
            var overlayContainer = angular.element('<div ng-click="onTap()" ng-show="show" style="position: absolute;top: 0;left: 0;height: 100%;width: 100%;z-index: 1000;background-color: rgba(0, 0, 0, 0.64);"></div>');
            var topRow = angular.element('<div style="width:100%;height: 40%;"></div>');
            var leftTopContent = angular.element('<div style="width: 50%;float: left;clear: right;"><div ng-show="topLeftInfo"><img src="img/tap.png" style="transform: rotate(-35deg) translate(25px);" height="132" width="71"><span style="color: white;font-style: italic;font-size: 1.5em;line-height: 1.5em;">{{topLeftInfo}}</span><div></div>');
            var rightTopContent = angular.element('<div style="width: 50%;float: right;clear: right;"><div ng-show="topRightInfo"><img src="img/tap.png" style="transform: translate(-20px) scaleX(-1) rotate(-25deg);float: right;" height="132" width="71"><div style="color: white; font-style: italic; font-size: 1.5em; float: left; clear: both;width: 100%;text-align: center;line-height: 1.5em;"><span>&nbsp;&nbsp;&nbsp;&nbsp;{{topRightInfo}}</span></div></div></div>');
            topRow.append(leftTopContent);
            topRow.append(rightTopContent);
            overlayContainer.append(topRow);

            var middleRow = angular.element('<div style="width:100%;height: 40%;"></div>');
            var leftMiddleContent = angular.element('<div style="width: 50%;float: left;clear: right;"><div ng-show="midLeftInfo"><div style="color: white;font-style: italic;font-size: 1.5em;margin: 10px;line-height: 1.5em;">{{midLeftInfo}}</div><img src="img/swipe-right.png" style="transform: translate(25px);" height="132" width=""></div></div>');
            var rightMiddleContent = angular.element('<div style="width: 50%;float: left;clear: right;"><div ng-show="midRightInfo"><div style="color: white;font-style: italic;font-size: 1.5em;float: left;margin-top: 79px;width: 100%;text-align: center;line-height: 1.5em;">{{midRightInfo}}</div><img src="img/swipe-left.png" style="transform: translate(-15px);float: right;" height="132" width=""></div></div>');
            middleRow.append(leftMiddleContent);
            middleRow.append(rightMiddleContent);
            overlayContainer.append(middleRow);

            element.append(overlayContainer);

            var link = function (scope, element, attr) {
                scope.onTap = function () {
                    scope.show = false;
                };

                $compile(element.contents())(scope);
            };
            return link;
        }
    };
});