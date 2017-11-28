(function () {

    "use strict";

    angular
        .module("AngularJsCognito.UsernameExistsValidatorDirective", ["AngularJsCognito.UserService"])
        .directive("usernameExistsValidator", usernameExistsValidator);

    /**
     * Username Exists Validator
     *
     * @param $q
     * @param userService
     * @returns {{require: string, link: link}}
     */
    function usernameExistsValidator($q, userService) {
        return {
            require: "ngModel",
            link: function (scope, element, attrs, ngModel) {
                ngModel.$asyncValidators.usernameDoesNotExist = function (modelValue, viewValue) {
                    if (!viewValue) {
                        return $q.when(true);
                    }

                    var deferred = $q.defer();

                    userService
                        .exists({username: viewValue})
                        .then(function (result) {
                            if (result.userExists) {
                                deferred.resolve();
                            } else {
                                deferred.reject();
                            }
                        });

                    return deferred.promise;
                };
            }
        };
    }
})();