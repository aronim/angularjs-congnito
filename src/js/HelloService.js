(function () {

    "use strict";

    angular
        .module("AngularJsCognito.HelloService", [])
        .service("helloService", helloService);

    function helloService($http, environment) {

        var serviceEndpoint = environment.ServiceEndpoint;

        return {
            hello: function () {
                return $http
                    .get(serviceEndpoint + "/hello")
                    .then(function(result) { return result.data; })
            }
        }
    }
})();