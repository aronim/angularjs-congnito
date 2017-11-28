// Karma configuration
// Generated on Sun Oct 29 2017 15:52:23 GMT-0700 (PDT)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: "",


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ["jasmine"],


        // list of files / patterns to load in the browser
        files: [
            "src/lib/aws-sdk-2.145.0.min.js",
            "src/lib/aws-cognito-sdk.js",
            "src/lib/amazon-cognito-identity.js",
            "src/vendor/jquery/dist/jquery.min.js",
            "src/vendor/moment/min/moment.min.js",
            "src/vendor/angular/angular.js",
            "src/vendor/angular-mocks/angular-mocks.js",
            "src/vendor/angular-animate/angular-animate.js",
            "src/vendor/angular-aria/angular-aria.js",
            "src/vendor/angular-local-storage/dist/angular-local-storage.js",
            "src/vendor/angular-material/angular-material.js",
            "src/vendor/angular-messages/angular-messages.js",
            "src/vendor/angular-ui-router/release/angular-ui-router.js",
            "src/vendor/async/dist/async.js",
            "src/js/**/*.js"
        ],


        // list of files to exclude
        exclude: [ "src/js/Environment.js", "serverless/**" ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: "dots", "progress"
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ["progress"],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ["Chrome"],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
};
