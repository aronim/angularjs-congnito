(function () {

    "use strict";

    angular
        .module("AngularJsCognito.EmailDoesNotExistValidatorDirective", ["AngularJsCognito.UserService"])
        .directive("emailDoesNotExistValidator", emailDoesNotExistValidator);

    /**
     * Email Does Not Exist Validator
     *
     * @param $q
     * @param userService
     * @returns {{require: string, link: link}}
     */
    function emailDoesNotExistValidator($q, userService) {
        return {
            require: "ngModel",
            link: function (scope, element, attrs, ngModel) {
                ngModel.$asyncValidators.emailDoesNotExist = function (modelValue, viewValue) {
                    if (!viewValue) {
                        return $q.when(true);
                    }

                    var deferred = $q.defer();

                    userService
                        .exists({email:viewValue})
                        .then(function(result) {
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