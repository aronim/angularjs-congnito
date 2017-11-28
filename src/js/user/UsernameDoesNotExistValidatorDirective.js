(function () {

    "use strict";

    angular
        .module("AngularJsCognito.UsernameDoesNotExistValidatorDirective", ["AngularJsCognito.UserService"])
        .directive("usernameDoesNotExistValidator", usernameDoesNotExistValidator);

    /**
     * Username Exists Validator
     *
     * @param $q
     * @param userService
     * @returns {{require: string, link: link}}
     */
    function usernameDoesNotExistValidator($q, userService) {
        return {
            require: "ngModel",
            link: function (scope, element, attrs, ngModel) {
                ngModel.$asyncValidators.usernameExists = function (modelValue, viewValue) {
                    if (!viewValue) {
                        return $q.when(true);
                    }

                    var deferred = $q.defer();

                    userService
                        .exists({username: viewValue})
                        .then(function (result) {
                            if (result.userExists) {
                                deferred.reject();
                            } else {
                                deferred.resolve();
                            }
                        });

                    return deferred.promise;
                };
            }
        };
    }
})();