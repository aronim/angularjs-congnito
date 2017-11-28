(function () {

    "use strict";

    angular
        .module("AngularJsCognito.EmailExistsValidatorDirective", ["AngularJsCognito.UserService"])
        .directive("emailExistsValidator", emailExistsValidator);

    /**
     * Email Exists Validator
     *
     * @param $q
     * @param userService
     * @returns {{require: string, link: link}}
     */
    function emailExistsValidator($q, userService) {
        return {
            require: "ngModel",
            link: function (scope, element, attrs, ngModel) {
                ngModel.$asyncValidators.emailExists = function (modelValue, viewValue) {
                    if (!viewValue) {
                        return $q.when(true);
                    }

                    var deferred = $q.defer();

                    userService
                        .exists({email:viewValue})
                        .then(function(result) {
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