(function() {
  var wrap,
    __slice = [].slice;

  wrap = function(listener, toDo, invokeAlways, isDefined) {
    return _.wrap(toDo, function() {
      var args, originalFn, value, valueIsDefined;
      originalFn = arguments[0], value = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      valueIsDefined = isDefined(value);
      if (!invokeAlways && !valueIsDefined) {
        return;
      }
      originalFn.call.apply(originalFn, [this, value].concat(__slice.call(args)));
      if (valueIsDefined) {
        return listener.cleanup();
      }
    });
  };

  angular.module('ngWatchWhen', []).constant('ngWatchWhenRegEx', /^\:\:([^\:]+)(\:\:[^\:]+)$/).value('ngWatchWhenCloneExpression', function(getter) {
    var clone;
    clone = function() {
      return getter.apply(this, arguments);
    };
    return _.merge(clone, getter);
  }).config(function($provide) {
    return $provide.decorator('$parse', function($delegate, ngWatchWhenRegEx, ngWatchWhenDelegateFactory, ngWatchWhenCloneExpression) {
      return _.wrap($delegate, function($parse, exp, interceptor) {
        var args, match, onceExp, onceStr, whenExp, whenStr;
        if (angular.isString(exp) && (match = exp.match(ngWatchWhenRegEx))) {
          exp = match[0], whenStr = match[1], onceStr = match[2];
          whenExp = $parse.apply(this, [whenStr]);
          onceExp = ngWatchWhenCloneExpression($parse.apply(this, [onceStr, interceptor]));
          onceExp.$$watchDelegate = ngWatchWhenDelegateFactory(whenExp, onceExp);
          return onceExp;
        } else {
          args = [exp];
          if (interceptor != null) {
            args.push(interceptor);
          }
          return $parse.apply(this, args);
        }
      });
    });
  }).value('ngWatchWhenDelegateFactory', function(whenExp, onceExp) {
    return _.wrap(onceExp.$$watchDelegate, function(originalWatchDelegate, scope, listener, objectEquality, parsedExpression) {
      var onceWatch, registerOnceWatch, whenWatch;
      onceWatch = null;
      registerOnceWatch = function() {
        onceWatch = {};
        onceWatch.deregister = originalWatchDelegate.call(this, scope, listener, objectEquality, parsedExpression);
        return onceWatch.watcher = _.first(scope.$$watchers);
      };
      registerOnceWatch();
      whenWatch = scope.$watch(whenExp, function() {
        if (!_.contains(scope.$$watchers, onceWatch.watcher)) {
          return registerOnceWatch();
        }
      });
      return function() {
        whenWatch();
        if (_.contains(scope.$$watchers, onceWatch.watcher)) {
          return onceWatch.deregister();
        }
      };
    });
  });

}).call(this);

angular.module('myApp', []);

angular.module('myApp')
    .directive('customAsyncValidator', ['$timeout', function ($timeout) {
        return {
            require: 'ngModel',
            link: function ($scope, _, _, ngModel) {
                $scope.$watch(function () {
                    return ngModel.$modelValue;
                }, function () {
                    if (!ngModel.$dirty || !ngModel.$valid) {
                        return;
                    }

                    ngModel.$setValidity('customAsyncValidator', false);
                    $timeout(function () {
                        ngModel.$setValidity('customAsyncValidator', true);
                    }, 4000);
                });
            }
        }
    }])
    .controller('OptionsCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
        var timer;
        $scope.onBlur = function () {
            $timeout.cancel(timer);
            $scope.finalModelValue2 = $scope.modelValue2;
        };

        $scope.$watch('modelValue2', function (newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }

            $timeout.cancel(timer);
            timer = $timeout(function () {
                $scope.finalModelValue2 = $scope.modelValue2;
            }, 1000);
        });
    }])
    .controller('WatchMany', ['$scope', function ($scope) {
        $scope.changes = [];

        $scope.$watchGroup(['landCode', 'phoneNumber'], function (newVal, oldVal) {
            if (angular.equals(newVal, oldVal)) {
                return;
            }

            $scope.changes.push('[' + oldVal + '] -> [' + newVal + ']');
        });
    }]);