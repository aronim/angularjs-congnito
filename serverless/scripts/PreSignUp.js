(function () {

    "use strict";

    module.exports.handle = (event, context, callback) => {
        console.log(JSON.stringify(event, null, 2));

        if (event.request.userAttributes.email.indexOf("test.aronim.com") < 0) {
            callback("Email is not part of the test.aronim.com domain")
        } else {
            callback(null, event);
        }
    };

})();