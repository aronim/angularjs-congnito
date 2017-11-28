const gulp = require("gulp"),
    clean = require("gulp-clean"),
    inject = require("gulp-inject"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    babel = require("gulp-babel"),
    ngAnnotate = require("gulp-ng-annotate"),
    flatten = require("gulp-flatten"),
    gzip = require("gulp-gzip"),
    embedTemplates = require('gulp-angular-embed-templates');

const vendorCss = [
    "src/vendors/bootstrap/dist/css/bootstrap.css",
    "src/vendors/angular-bootstrap/ui-bootstrap-csp.css",
    "src/vendors/font-awesome/css/font-awesome.css",
    "src/vendors/select2/select2.css",
    "src/css/select2-bootstrap.css",
    "src/vendors/angularjs-slider/dist/rzslider.css"
];

const appCss = [
    "src/css/global.css",
    "src/css/login.css",
    "src/css/dashboard.css",
    "src/css/verifier.css",
    "src/css/viewer.css"
];

const vendorJs = [
    "src/vendors/jquery/dist/jquery.js",
    "src/vendors/bootstrap/dist/js/bootstrap.js",
    "src/vendors/angular/angular.js",
    "src/vendors/angular-animate/angular-animate.js",
    "src/vendors/angular-local-storage/dist/angular-local-storage.js",
    "src/vendors/angular-resource/angular-resource.js",
    "src/vendors/angular-sanitize/angular-sanitize.js",
    "src/vendors/angular-touch/angular-touch.js",
    "src/vendors/angular-bootstrap/ui-bootstrap.js",
    "src/vendors/angular-bootstrap/ui-bootstrap-tpls.js",
    "src/vendors/select2/select2.js",
    "src/vendors/angular-ui-select2/src/select2.js",
    "src/vendors/angular-ui-router/release/angular-ui-router.js",
    "src/vendors/angularjs-slider/dist/rzslider.min.js",
    "src/vendors/d3/d3.js",
    "src/vendors/d3-tip/index.js",
    "src/vendors/async/dist/async.js"
];

const libJs = [
    "src/libs/aws-sdk.min.js",
    "src/libs/amazon-cognito-identity.min.js"
];

const appJs = [
    "src/js/seat.service.js",
    "src/js/moment.service.js",
    "src/js/LoginService.js",
    "src/js/LoginController.js",
    "src/js/LogoutController.js",
    "src/js/panTilts.service.js",
    "src/js/panTilts.controller.js",
    "src/js/verifier.controller.js",
    "src/js/viewer.controller.js",
    "src/js/viewports.service.js",
    "src/js/viewports.controller.js",
    "src/js/DashboardController.js",
    "src/js/feedback.controller.js",
    "src/js/naming.controller.js",
    "src/js/app.controller.js",
    "src/js/Application.js"
];

const timestamp = Date.now();
const vendorCssName = "vendor.css";
const appCssName = "app-" + timestamp + ".css";
const vendorJsName = "vendor.js";
const libJsName = "lib.js";
const appJsName = "app-" + timestamp + ".js";

gulp.task("clean", function () {
    return gulp.src("dist", {read: false})
        .pipe(clean());
});

gulp.task("bootstrapFonts", function () {
    return gulp.src([
        "src/vendors/bootstrap/fonts/*.otf",
        "src/vendors/bootstrap/fonts/*.eot",
        "src/vendors/bootstrap/fonts/*.svg",
        "src/vendors/bootstrap/fonts/*.ttf",
        "src/vendors/bootstrap/fonts/*.woff",
        "src/vendors/bootstrap/fonts/*.woff2",
        "src/vendors/font-awesome/fonts/*.otf",
        "src/vendors/font-awesome/fonts/*.eot",
        "src/vendors/font-awesome/fonts/*.svg",
        "src/vendors/font-awesome/fonts/*.ttf",
        "src/vendors/font-awesome/fonts/*.woff",
        "src/vendors/font-awesome/fonts/*.woff2"
    ])
        .pipe(flatten())
        .pipe(gulp.dest("./dist/fonts"));
});

gulp.task("data", function () {
    return gulp.src([
        "src/data/**/*.json"
    ])
        .pipe(gzip({append: false}))
        .pipe(gulp.dest("./dist/data/"));
});

gulp.task("images", function () {
    return gulp.src([
        "src/vendors/select2/select2.png",
        "src/vendors/select2/select2x2.png",
        "src/favicon.ico"
    ])
        .pipe(gulp.dest("./dist/"));
});

gulp.task("img", function () {
    return gulp.src([
        "src/img/*"
    ])
        .pipe(gulp.dest("./dist/img"));
});

gulp.task("appCss", function () {
    return gulp.src(appCss)
        .pipe(concat(appCssName))
        .pipe(gzip({append: false}))
        .pipe(gulp.dest("./dist"));
});

gulp.task("vendorCss", function () {
    return gulp.src(vendorCss)
        .pipe(concat(vendorCssName))
        .pipe(gzip({append: false}))
        .pipe(gulp.dest("./dist"));
});

gulp.task("appJs", function () {
    return gulp.src(appJs)
        .pipe(concat(appJsName))
        .pipe(ngAnnotate())
        .pipe(embedTemplates({basePath: "src/"}))
        .pipe(uglify())
        .pipe(gzip({append: false}))
        .pipe(gulp.dest("./dist"));
});

gulp.task("vendorJs", function () {
    return gulp.src(vendorJs)
        .pipe(concat(vendorJsName))
        .pipe(gzip({append: false}))
        .pipe(gulp.dest("./dist"));
});

gulp.task("libJs", function () {
    return gulp.src(libJs)
        .pipe(concat(libJsName))
        .pipe(gzip({append: false}))
        .pipe(gulp.dest("./dist"));
});

gulp.task("build", ["bootstrapFonts", "data", "img", "images", "appCss", "vendorCss", "appJs", "vendorJs", "libJs"], function () {
    gulp.src("./src/index.html")
        .pipe(
            inject(
                gulp.src(
                    [vendorJsName, libJsName, appJsName, vendorCssName, appCssName, ],
                    {read: false, cwd: __dirname + "/dist"}
                )
            )
        )
        .pipe(gulp.dest("./dist"));
});