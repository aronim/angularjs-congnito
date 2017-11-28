(function () {
    "use strict";

    angular
        .module("AngularJsCognito.LogoutController", ["AngularJsCognito.UserService"])
        .controller("LogoutController", LogoutController);

    function LogoutController() {
        var vm = this;

    }

})();