(function () {

    let AWS = require("aws-sdk");
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'aronim'});

    let userExists = require("./UserExists");

    let event = {
        queryStringParameters: {
            // username: "geoff.vader",
            email: "geoff.vader@test.aronim.com"
        }
    };

    let context = {
        functionName: "AngularJsCognito-Dev-UserExists",
        invokedFunctionArn: "arn:aws:lambda:us-east-1:568798185469:function:AngularJsCognito-Dev-Hello"
    };

    userExists
        .handle(event, context, (error, result) => {
            if (error) console.error(error);
            else console.log(JSON.stringify(result, null, 2));
        });
})();