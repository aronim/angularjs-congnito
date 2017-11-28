(function () {
    "use strict";

    angular
        .module("AngularJsCognito.LoginController", ["AngularJsCognito.UserService"])
        .controller("LoginController", LoginController);

    function LoginController(userService) {
        var vm = this;

        vm.command = {
            password: "1",
            confirmPassword: "1"
        };

        vm.login = function() {
            userService
                .authenticateUser(vm.command.username, vm.command.password)
                .then(function() {

                })
                .catch(function() {

                });
        }
    }

})();