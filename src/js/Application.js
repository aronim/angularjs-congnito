(function () {
    "use strict";

    angular
        .module("AngularJsCognito.Application", [
            "LocalStorageModule",
            "AngularJsCognito.DashboardController",
            "AngularJsCognito.LoginController",
            "AngularJsCognito.LogoutController",
            "AngularJsCognito.RegisterController",
            "AngularJsCognito.ResetPasswordController",
            "AngularJsCognito.ResetPasswordConfirmationController",
            "AngularJsCognito.UserService",
            "ngMaterial",
            "ngMessages",
            "ui.router"
        ])
        .config(ApplicationConfig)
        .run(ApplicationRun);

    /**
     * ApplicationConfig
     *
     * @param localStorageServiceProvider
     * @param $stateProvider
     * @param $urlRouterProvider
     * @param $locationProvider
     * @constructor
     */
    function ApplicationConfig(localStorageServiceProvider, $stateProvider, $urlRouterProvider, $locationProvider) {
        localStorageServiceProvider
            .setPrefix("ondersteuners.in3sixty.com");

        $stateProvider
            .state({
                name: "login",
                url: "/login",
                templateUrl: "html/login.html",
                controller: "LoginController as vm"
            })
            .state({
                name: "logout",
                url: "/logout",
                authenticate: true,
                templateUrl: "html/logout.html",
                controller: "LogoutController as vm"
            })
            .state({
                name: "dashboard",
                url: "/dashboard",
                authenticate: true,
                templateUrl: "html/dashboard.html",
                controller: "DashboardController as vm"
            })
            .state({
                name: "register",
                url: "/register",
                templateUrl: "html/register.html",
                controller: "RegisterController as vm"
            })
            .state({
                name: "resetPassword",
                url: "/resetPassword",
                templateUrl: "html/resetPassword.html",
                controller: "ResetPasswordController as vm"
            })
            .state({
                name: "resetPasswordConfirmation",
                url: "/resetPasswordConfirmation",
                templateUrl: "html/resetPasswordConfirmation.html",
                controller: "ResetPasswordConfirmationController as vm"
            });

        $urlRouterProvider.otherwise(function ($injector) {
            $injector.get("$state").go("dashboard");
        });

        $locationProvider.html5Mode(true);
    }

    /**
     * Application Run
     *
     * @param $rootScope
     * @param $state
     * @param $log
     * @param $timeout
     * @param $interval
     * @param $location
     * @param $transitions
     * @param userService
     * @constructor
     */
    function ApplicationRun($rootScope, $state, $log, $timeout, $interval, $location, $transitions, userService) {

        $transitions
            .onStart(
                {
                    to: function (state) {
                        return !$rootScope.authenticated && state.authenticate;
                    }
                },
                function (transition) {
                    var fromState = transition.from();
                    var toState = transition.to();

                    $log.info("$stateChangeStart: fromState[" + fromState.name + "] toState[" + toState.name + "]");

                    userService
                        .isAuthenticated()
                        .then(function(authenticated) {
                            if (!authenticated) {
                                $state.go("login");
                            }
                            else {
                                var params = $location.search();
                                $rootScope.authenticated = true;
                                $state.go(toState, params, {location: false})
                            }
                        })
                        .catch(function(error) {
                            $state.go("login");
                        });

                });

        var refreshTokenInterval;

        $rootScope.$watch("authenticated", function () {

            if ($rootScope.authenticated) {
                refreshTokenInterval = $interval(function () {
                    userService.refreshToken();
                }, 60000);

                return;
            }

            if (!$rootScope.authenticated && refreshTokenInterval) {
                $interval.cancel(refreshTokenInterval);
            }
        })
    }

})();