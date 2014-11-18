angular.module('myApp', ['ngMessages']);


angular.module('myApp')
    .directive('customAsyncValidator', ['$timeout', function ($timeout) {
        return {
            require: 'ngModel',
            link: function (_, _, _, ngModel) {
                ngModel.$asyncValidators.customAsyncValidator = function (value) {
                    return $timeout(angular.noop, 4000);
                };
            }
        }
    }])
    .controller('WatchMany', ['$scope', function ($scope) {
        $scope.changes = [];

        $scope.numbers = [{
            country: 'Poland',
            country_code: 'PL',
            land_code: '+48'
        }, {
            country: 'United Kingdom',
            country_code: 'GB',
            land_code: '+44'
        }, {
            country: 'United States',
            country_code: 'US',
            land_code: '+1'
        }];

        $scope.validNumber = false;
        $scope.formattedNumber = '';
        $scope.phoneNumber = null;
        $scope.landCode = {};

        $scope.$watchGroup(['landCode', 'phoneNumber'], function (newVal, oldVal) {
            if (angular.equals(newVal, oldVal)) {
                return;
            }

            function toStr(val) { return '[' + val[0].land_code + ',' + val[1] + ']'; }

            $scope.changes.push(toStr(oldVal) + ' -> ' + toStr(newVal));

            $scope.formattedNumber = formatInternational($scope.landCode.country_code, $scope.phoneNumber);
            $scope.validNumber = isValidNumber($scope.formattedNumber, $scope.landCode.country_code);
        });
    }]);