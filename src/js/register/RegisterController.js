(function () {
    "use strict";

    angular
        .module("AngularJsCognito.RegisterController", [
            "AngularJsCognito.UserService",
            "AngularJsCognito.EmailDoesNotExistValidatorDirective",
            "AngularJsCognito.UsernameDoesNotExistValidatorDirective"
        ])
        .controller("RegisterController", RegisterController);

    function RegisterController($scope, $state, userService) {
        var vm = this;

        vm.confirmPasswordPattern = "\b\b";

        vm.command = {
            password: "",
            confirmPassword: ""
        };

        vm.registerUser = function() {
            userService
                .registerUser(vm.command)
                .then(function() {
                    $state.go("confirmRegistration");
                })
                .catch(function(error) {
                    console.error(error);
                })
        };

        $scope.$watch("vm.command.password", function () {
            vm.confirmPasswordPattern = "\\b" + vm.command.password + "\\b";
        })
    }

})();