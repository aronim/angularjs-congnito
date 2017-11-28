(function () {
    "use strict";

    angular
        .module("AngularJsCognito.UserService", ["AngularJsCognito.Environment"])
        .factory("userService", userService);

    /**
     * User Service
     *
     * @param $rootScope
     * @param $q
     * @param $http
     * @param $log
     * @param environment
     * @returns {{authenticateUser: authenticateUser, completeNewPasswordChallenge: completeNewPasswordChallenge, isAuthenticated: isAuthenticated, logout: logout, refreshToken: refreshToken, registerUser: registerUser}}
     */
    function userService($rootScope, $q, $http, $log, environment) {
        var self = this;

        AWSCognito.config.region = environment.AWSRegion;
        var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
        var CognitoIdentityServiceProvider = AWSCognito.CognitoIdentityServiceProvider;
        var AuthenticationDetails = CognitoIdentityServiceProvider.AuthenticationDetails;
        var CognitoUser = CognitoIdentityServiceProvider.CognitoUser;
        var CognitoUserAttribute = CognitoIdentityServiceProvider.CognitoUserAttribute;

        self.cognitoIdentityParams = {
            IdentityPoolId: environment.IdentityPoolId
        };

        self.configureCognitoCredentials = function (jwtIdToken) {
            let credentials = {
                IdentityPoolId: self.cognitoIdentityParams.IdentityPoolId,
                Logins: {}
            };

            credentials.Logins[environment.UserPoolProviderName] = jwtIdToken;

            AWSCognito.config.credentials = new AWSCognito.CognitoIdentityCredentials(credentials);

            $http.defaults.headers.common.Authorization = jwtIdToken;
        };

        self.cognitoUserPool = new CognitoUserPool({
            UserPoolId: environment.UserPoolId,
            ClientId: environment.UserPoolClientId
        });

        self.cognitoUser = self.cognitoUserPool.getCurrentUser();
        if (self.cognitoUser) {
            self.cognitoUser.getSession(function (err, session) {
                if (err) {
                    $log.error(err);
                }
                if (!err && session.isValid()) {
                    self.configureCognitoCredentials(session.getIdToken().getJwtToken());
                }
            });
        }

        self.userAttributes = undefined;

        /**
         * Authenticate User
         *
         * @param username
         * @param password
         */
        function authenticateUser(username, password) {
            $log.info("AngularJsCognito.UserService.authenticateUser: " + username);

            var deferred = $q.defer();

            var authenticationDetails = new AuthenticationDetails({
                Username: username,
                Password: password
            });

            self.cognitoUser = new CognitoUser({Username: username, Pool: self.cognitoUserPool});

            self.cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (session) {
                    self.configureCognitoCredentials((session.getIdToken().getJwtToken()));
                    $rootScope.$apply(function () {
                        deferred.resolve({message: "Success"})
                    });
                },
                onFailure: function (error) {
                    $rootScope.$apply(function () {
                        deferred.reject(error);
                    });
                },
                newPasswordRequired: function (userAttributes, requiredAttributes) {
                    self.userAttributes = userAttributes;
                    $rootScope.$apply(function () {
                        deferred.resolve({message: "newPasswordRequired"});
                    });
                }
            });

            return deferred.promise;
        }

        /**
         * Confirm Password
         *
         * @param username
         * @param verificationCode
         * @param newPassword
         */
        function confirmPassword(username, newPassword, verificationCode) {

            $log.info("AngularJsCognito.UserService.confirmPassword: " + username);

            var deferred = $q.defer();

            var cognitoUser = new CognitoUser({Username: username, Pool: self.cognitoUserPool});

            cognitoUser.confirmPassword(verificationCode, newPassword, {
                onSuccess: function (result) {
                    deferred.resolve({message: "Success"});
                },
                onFailure: function (error) {
                    deferred.reject(error);
                }
            });

            return deferred.promise;
        }

        /**
         * Confirm Registration
         *
         * @param username
         * @param verificationCode
         */
        function confirmRegistration(username, verificationCode) {

            $log.info("AngularJsCognito.UserService.confirmRegistration: " + username);

            var deferred = $q.defer();

            var cognitoUser = new CognitoUser({Username: username, Pool: self.cognitoUserPool});

            cognitoUser.confirmRegistration(verificationCode, true, function (error, result) {
                if (error) deferred.reject(error);
                else deferred.resolve({message: "Success"});
            });

            return deferred.promise;
        }

        /**
         * Complete New Password Challenge
         *
         * @param newPassword
         * @param authenticateUserResponseHandler
         */
        function completeNewPasswordChallenge(username, newPassword, authenticateUserResponseHandler) {

            $log.info("AngularJsCognito.UserService.completeNewPasswordChallenge: " + username);

            delete self.userAttributes.email_verified;

            self.cognitoUser.completeNewPasswordChallenge(newPassword, self.userAttributes, authenticateUserResponseHandler);
        }

        /**
         * Exists
         *
         * @param query
         */
        function exists(query) {
            return $http
                .get(environment.ServiceEndpoint + "/users/exists", {params: query})
                .then(function (response) {
                    return response.data;
                });
        }

        /**
         * Forgot Password
         *
         * @param username
         */
        function forgotPassword(username) {

            $log.info("AngularJsCognito.UserService.forgotPassword: " + username);

            var deferred = $q.defer();

            var cognitoUser = new CognitoUser({Username: username, Pool: self.cognitoUserPool});

            cognitoUser.forgotPassword({
                onSuccess: function (result) {
                    $rootScope.$apply(function () {
                        deferred.resolve({message: "Success"})
                    });
                },
                onFailure: function (error) {
                    $rootScope.$apply(function () {
                        deferred.reject(error)
                    });
                },
                inputVerificationCode: function () {
                    $rootScope.$apply(function () {
                        deferred.resolve({message: "InputVerificationCode"})
                    });
                }
            });

            return deferred.promise;
        }

        /**
         * Is User Authenticated
         */
        function isAuthenticated() {
            var deferred = $q.defer();

            if (self.cognitoUser) {
                self.cognitoUser.getSession(function (err, session) {
                    $rootScope.$apply(function () {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(session.isValid());
                        }
                    });
                });
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        }

        /**
         * Logout
         */
        function logout() {

            $log.info("AngularJsCognito.UserService.logout");

            if (self.cognitoUser) self.cognitoUser.clearCachedTokens();
            self.cognitoUser = undefined;

            if (AWSCognito.config.credentials) AWSCognito.config.credentials.clearCachedId();
            AWSCognito.config.credentials = new AWSCognito.CognitoIdentityCredentials(self.cognitoIdentityParams);

            delete $http.defaults.headers.common.Authorization
        }

        /**
         * Refresh Token
         */
        function refreshToken() {

            async.waterfall([
                function (callback) {
                    self.cognitoUser.getSession(callback);
                },
                function (session, callback) {
                    if (session.isValid()) {
                        self.cognitoUser.refreshSession(session.getRefreshToken(), callback)
                    } else {
                        callback("Session is invalid");
                    }
                }
            ], function (error, refreshedSession) {
                if (error) {
                    $log.error(error);
                } else if (refreshedSession.isValid()) {
                    self.configureCognitoCredentials(refreshedSession.getIdToken().getJwtToken());
                }
            });
        }

        /**
         * Register User
         *
         * @param command
         */
        function registerUser(command) {
            $log.info("AngularJsCognito.UserService.registerUser: " + JSON.stringify(command));

            var deferred = $q.defer();

            var username = command.username;
            var password = command.password;
            var attributeList = [
                new CognitoUserAttribute({Name: "name", Value: command.name}),
                new CognitoUserAttribute({Name: "email", Value: command.email})
            ];

            self.cognitoUserPool.signUp(username, password, attributeList, null, function (error, result) {
                $rootScope.$apply(function () {
                    if (error) {
                        deferred.reject(error);
                    } else {
                        // do stuff with the result
                        deferred.resolve({message: "Success"});
                    }
                });
            });

            return deferred.promise;
        }

        return {
            authenticateUser: authenticateUser,
            exists: exists,
            completeNewPasswordChallenge: completeNewPasswordChallenge,
            confirmPassword: confirmPassword,
            confirmRegistration: confirmRegistration,
            forgotPassword: forgotPassword,
            isAuthenticated: isAuthenticated,
            logout: logout,
            refreshToken: refreshToken,
            registerUser: registerUser
        };
    }

})();