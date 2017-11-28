(function () {

    "use strict";

    let process = require("process");
    let async = require("async");
    let AWS = require("aws-sdk");

    AWS.config.region = process.env.AWS_REGION;
    let cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
    let cloudFormation = new AWS.CloudFormation();

    function getUserPoolId(stackName, callback) {

        let describeStackResourceParams = {
            StackName: stackName,
            LogicalResourceId: "CognitoUserPoolUserPool"
        };

        cloudFormation.describeStackResource(describeStackResourceParams, (error, result) => {
            if (error) callback(error);
            else callback(null, result.StackResourceDetail.PhysicalResourceId);
        });
    }

    function listUsers(userPoolId, username, email, callback) {

        let listUsersParams = {
            UserPoolId: userPoolId,
            Filter: username ? "username=\"" + username + "\"" : "email=\"" + email + "\""
        };

        cognitoIdentityServiceProvider.listUsers(listUsersParams, (error, result) => {
            if (error) callback(error);
            else callback(null, result.Users);
        });
    }

    function userExists(stackName, username, email, callback) {

        // @formatter:off

        async.waterfall([
            (callback)              =>  getUserPoolId(stackName, callback),
            (userPoolId, callback)  =>  listUsers(userPoolId, username, email, callback),
            (users, callback)       =>  callback(null, {userExists: users.length === 1}),
        ], callback);

        // @formatter:on
    }

    module.exports.handle = (event, context, callback) => {

        console.log(JSON.stringify(process.env, null, 2));

        if (event.httpMethod === "OPTIONS") {
            callback(null, {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true
                }
            });
        }

        let username = event.queryStringParameters.username;
        let email = event.queryStringParameters.email;

        let service = context.functionName.split("-")[0];
        let stage = context.functionName.split("-")[1];
        let stackName = service + "-" + stage;

        userExists(stackName, username, email, (error, result) => {
            if (error) {
                callback(null, {
                    statusCode: 500,
                    body: JSON.stringify(error, null, 2)
                });
                return;
            }

            callback(null, {
                statusCode: 200,
                body: JSON.stringify(result, null, 2),
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true
                }
            });
        });
    };
})();