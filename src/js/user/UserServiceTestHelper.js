(function () {
    "use strict";

    angular
        .module("AngularJsCognito.UserServiceTestHelper", ["AngularJsCognito.Environment"])
        .factory("userServiceTestHelper", userServiceTestHelper);

    /**
     * User Service Test Helper
     *
     * @param $q
     * @param $log
     * @param environment
     */
    function userServiceTestHelper($rootScope, $q, $log, environment) {
        var self = this;

        AWS.config.region = environment.AWSRegion;
        AWS.config.credentials = new AWS.Credentials({
            accessKeyId: environment.AdminAccessKey,
            secretAccessKey: environment.AdminSecretKey
        });

        self.sqs = new AWS.SQS();
        self.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

        self.emailReceivedQueueUrl = "https://sqs.us-east-1.amazonaws.com/" + environment.AWSAccountId + "/AngularJsCognito-EmailReceived";

        /**
         * Callback To Promise
         *
         * @param deferred
         * @returns {Function}
         */
        function callbackToPromise(deferred) {
            return function (error, result) {
                $rootScope.$apply(function () {
                    if (error) deferred.reject(error);
                    else deferred.resolve(result);
                });
            }
        }

        /**
         * Clear Email Queue
         */
        function clearEmailQueue() {

            $log.info("AngularJsCognito.UserServiceTestHelper.clearEmailQueue");

            var deferred = $q.defer();

            var params = {
                QueueUrl: self.emailReceivedQueueUrl
            };

            self.sqs.purgeQueue(params, function (error, results) {
                if (error) deferred.reject(error);
                else deferred.resolve();
            });

            return deferred.promise;
        }

        /**
         * Delete User
         * @param username
         */
        function deleteUser(username) {

            $log.info("AngularJsCognito.UserServiceTestHelper.deleteUser: " + username);

            var deferred = $q.defer();

            var params = {Username: username, UserPoolId: environment.UserPoolId};
            self.cognitoIdentityServiceProvider.adminDeleteUser(params, callbackToPromise(deferred));

            return deferred.promise;
        }

        /**
         * Get Confirmation Code
         *
         * @param emailAddress
         */
        function getConfirmationCode(emailAddress) {

            $log.info("AngularJsCognito.UserServiceTestHelper.getConfirmationCode: " + emailAddress);

            var deferred = $q.defer();

            var receiveMessageParams = {
                QueueUrl: self.emailReceivedQueueUrl
            };

            var messages = [];
            var attempts = 0;
            async.whilst(
                function () {
                    return messages.length === 0 && attempts < 3;
                },
                function (callback) {
                    self.sqs.receiveMessage(receiveMessageParams, function (error, results) {
                        if (error) {
                            callback(error);
                        } else {
                            attempts++;

                            messages = results
                                .Messages
                                .map(function (sqsMessage) {
                                    let sesMessage = JSON.parse(sqsMessage.Body);
                                    let email = JSON.parse(sesMessage.Message);
                                    return {
                                        receiptHandle: sqsMessage.ReceiptHandle,
                                        email: email
                                    };
                                })
                                .filter(function (message) {
                                    return message.email.mail.destination[0] === emailAddress;
                                });

                            callback(null, messages)
                        }
                    })
                },
                function (err, messages) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        messages = messages.sort(function (message1, message2) {
                            return moment(message1.email.mail.timestamp).diff(moment(message2.email.mail.timestamp), "seconds");
                        });
                        if (messages.length === 0) {
                            deferred.reject({message: "No emails found"});
                        } else {
                            deferred.resolve(messages[0].email.content.match(/Your verification code is (\d+)/)[1]);
                        }
                    }
                }
            );

            return deferred.promise;
        }

        /**
         * Get User
         *
         * @param username
         */
        function getUser(username) {

            $log.info("AngularJsCognito.UserServiceTestHelper.getUser: " + username);

            var deferred = $q.defer();

            var params = {Username: username, UserPoolId: environment.UserPoolId};
            self.cognitoIdentityServiceProvider.adminGetUser(params, callbackToPromise(deferred));

            return deferred.promise;
        }

        return {
            clearEmailQueue: clearEmailQueue,
            deleteUser: deleteUser,
            getConfirmationCode: getConfirmationCode,
            getUser: getUser
        }
    }
})();