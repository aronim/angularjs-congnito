(function () {

    "use strict";

    module.exports.handle = (event, context, callback) => {
        console.log(JSON.stringify(event, null, 2));
        console.log(JSON.stringify(context, null, 2));

        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: "Go Serverless v1.0! Your function executed successfully!",
                input: event,
            }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            }
        };

        callback(null, response);
    };

})();