(function () {

    "use strict";

    module.exports.handle = (event, context, callback) => {
        console.log(JSON.stringify(event, null, 2));

        event.response.emailSubject = "Your verification code";
        event.response.emailMessage = "Your verification code is " + event.request.codeParameter + ".";
        callback(null, event);
    };

})();