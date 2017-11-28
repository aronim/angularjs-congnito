const fs = require("fs");

const environmentTemplateStart = "(function () {\n" +
    "    \"use strict\";\n" +
    "\n" +
    "    angular\n" +
    "        .module(\"AngularJsCognito.Environment\", [])\n" +
    "        .factory(\"environment\", environment);\n" +
    "\n" +
    "    function environment() {\n" +
    "        return ";

const environmentTemplateEnd =
    ";\n" +
    "    }\n" +
    "})();";

function handle (environment) {

    let environmentJs = environmentTemplateStart + JSON.stringify(environment, null, 2) + environmentTemplateEnd;
    fs.writeFileSync("../src/js/EnvironmentTest.js", environmentJs, "utf-8");

    delete environment.AdminAccessKey;
    delete environment.AdminSecretKey;
    delete environment.AWSRegion;
    delete environment.AWSAccountId;

    environmentJs = environmentTemplateStart + JSON.stringify(environment, null, 2) + environmentTemplateEnd;
    fs.writeFileSync("../src/js/Environment.js", environmentJs, "utf-8");
}

module.exports = { handle };