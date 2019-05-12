"use strict";
exports.__esModule = true;
var rmc = require("../bin/");
var fs = require("fs");
require("colors");
require("mocha");
var assert = require("assert");
require("source-map-support").install();
var customLog = console.log.bind(console.log, "[:TEST:]");
function validate(text, expectance, rm_ws, report_regex_evaluate_error) {
    if (rm_ws === void 0) { rm_ws = void 0; }
    var result = rmc(text, rm_ws, report_regex_evaluate_error);
    assert.strictEqual(result, expectance, "failed at case [" + text + "]");
}
function caseThrow(content, msg, error, report_regex_evaluate_error) {
    assert.throws(function () {
        rmc(content, true, report_regex_evaluate_error);
    }, error, msg);
}
var stripSource = function (path) {
    var js_source = fs.readFileSync(path, "utf-8");
    assert.doesNotThrow(function () {
        /* let result = */ rmc(js_source, true, true);
    });
};
// bash -c \"if [ ! -e test/test.js ]; then tsc ./test/test.ts --sourcemap true; fi\"
customLog("rm-cstyle-cmts, version: ", rmc.version);
// @ts-ignore 
rmc.testMode = true;
describe("Only throws invalid input content", function () {
    it("case invalid content", function () {
        // check invalid content, deceive for tsc.
        caseThrow({}, "check invalid content", TypeError);
    });
});
describe("The input source will be returned without any processing when exception occured", function () {
    it("QuoteScanner::imcomplete single quote", function () {
        validate("    let text = `this is a ${'pen'}`; '", "    let text = `this is a ${'pen'}`; '");
    });
    it("BackQuoteScanner::imcomplete backquote", function () {
        validate("{} as string ` back quote! ` `", "{} as string ` back quote! ` `");
    });
    it("SlashScanner::extra slash", function () {
        validate("const n: number = 1; /", "const n: number = 1; /");
    });
    it("SlashScanner::imcomplete block comment", function () {
        validate("const n: number = 1; /* comment /", "const n: number = 1; /* comment /");
    });
});
describe("Input and Result Verification", function () {
    it("case empty string.", function () {
        validate("", "");
    });
    describe("single line input", function () {
        it("remove ahead whitespace + linecomment #1", function () {
            validate("  var i = {} / 10; // -> NaN", "var i = {} / 10;");
        });
        it("remove ahead whitespace + linecomment #2", function () {
            validate(" var i = 10000 / 111.77; /[/*]/.test(i); // */", "var i = 10000 / 111.77; /[/*]/.test(i);");
        });
        it("remove ahead whitespace", function () {
            validate(" { i = \"aaa\\\"\" } /aaa/.test(i);", "{ i = \"aaa\\\"\" } /aaa/.test(i);");
        });
        it("remove ahead whitespace + blockcomment + linecomment", function () {
            validate(" /* comments */ var i = 10000 / 111.77; /\\][/*]/.test(i); // */", "var i = 10000 / 111.77; /\\][/*]/.test(i);");
        });
        it("remove ahead whitespace, detect regex", function () {
            validate("      [/\\s*\\(\\?#.*\\)\\/[/*///]\\s*$|#\\s.*$|\\s+/];", "[/\\s*\\(\\?#.*\\)\\/[/*///]\\s*$|#\\s.*$|\\s+/];");
        });
        it("linecomment at around calculation statement (properly detect line comment", function () {
            validate("let ok2 = 12.2 / 33 * .9 // \"comments\"...*/", "let ok2 = 12.2 / 33 * .9", true, true);
        });
        it("linecomment at around calculation statement (probably regex miss detect", function () {
            validate(" var re = 10000 / 111.77*gg /gg;;;;  ////// comments...", "var re = 10000 / 111.77*gg /gg;;;;");
        });
    });
    describe("multi line input (this case only remove kinds of comments, and blank line)", function () {
        it("#1", function () {
            validate("  let gg = 10;\nvar re = 10000 / 111.77*gg /gg;;;;  ////// comments...\n//             ^-------------^ <- this case is match. but, not regexp literal", "  let gg = 10;\nvar re = 10000 / 111.77*gg /gg;;;;  \n", false);
        });
        it("#2 nested es6 template string", function () {
            validate("const templete = `function ${name}($) {\n\
    // comment line.\n\
    var some = ${\n\
        // comment line...\n\
        `12.5 / 50 * 100,\n\
        \n\
        // might be a very important comment line.\n\
        things = \"${ name + `anything` }\",\n\
        obj={ \"\\\\\": null }`\n\
\n\
    }; \`\`\n\
    /**\n\
     * multi line comment...\n\
     */\n\
    return true;\n\
 }\n\
;`", "const templete = `function ${name}($) {\n\
    // comment line.\n\
    var some = ${\n\
        // comment line...\n\
        `12.5 / 50 * 100,\n\
        // might be a very important comment line.\n\
        things = \"${ name + `anything` }\",\n\
        obj={ \"\\\\\": null }`\n\
\n\
    }; \`\`\n\
    /**\n\
     * multi line comment...\n\
     */\n\
    return true;\n\
 }\n\
;`");
        });
        //
        // case tsx source fragment
        //
        it("#3 tsx source fragment", function () {
            validate("return <>\n{/* <div id=\"ccn\"/> */}\n<AlertDialog\n    open={open}\n    disAgreeButton={false}\n    mainTitle={`SPA web - ${Properties.version}`}\n    messageText={\n    <div /*style={{ backgroundColor: \"rgba(238, 238, 238, 0.25)\" }}*/>\n        <div className=\"about-content-header\" data-text=\"Dependencies\"/>\n        <div className=\"notice-sentence\" style={{ marginBottom: 14 }}>\n            {depsElementsRef.current}\n        </div>\n\n        <div className=\"about-content-header\" data-text=\"Shortcut keys\"/>\n        <div className=\"notice-sentence\" style={{ marginBottom: 14 }}>\n            {shortCutElementsRef.current}\n        </div>\n\n        <div className=\"about-content-header\" data-text=\"Apache License\"/>\n        <div className=\"notice-sentence\">{`Licensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n`}\n</div>\n        </div>\n        }\n        onCloseHandler={() => setOpenState(false)}\n    />\n    {/* <div className=\"sde-version\" onClick={() => setOpenState(true)}>{Properties.get(\"sde-version\")}</div> */}\n    {VersionElement}\n</>;", "return <>\n{}\n<AlertDialog\n    open={open}\n    disAgreeButton={false}\n    mainTitle={`SPA web - ${Properties.version}`}\n    messageText={\n    <div >\n        <div className=\"about-content-header\" data-text=\"Dependencies\"/>\n        <div className=\"notice-sentence\" style={{ marginBottom: 14 }}>\n            {depsElementsRef.current}\n        </div>\n        <div className=\"about-content-header\" data-text=\"Shortcut keys\"/>\n        <div className=\"notice-sentence\" style={{ marginBottom: 14 }}>\n            {shortCutElementsRef.current}\n        </div>\n        <div className=\"about-content-header\" data-text=\"Apache License\"/>\n        <div className=\"notice-sentence\">{`Licensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n`}\n</div>\n        </div>\n        }\n        onCloseHandler={() => setOpenState(false)}\n    />\n    {}\n    {VersionElement}\n</>;");
        });
        it("#4 with report_regex_evaluate_error: true", function () {
            validate("  return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);", "return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);", void 0, true);
        });
        it("#5 with report_regex_evaluate_error: false", function () {
            validate("  l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),", "l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),", void 0, false);
        });
    });
    describe("strip text file (this case only remove kinds of comments, and blank line)", function () {
        it("removing comments of ./samples/es6.js with 'report_regex_evaluate_error' flag", function () {
            stripSource("./samples/es6.js");
        });
        it("removing comments of ./samples/typeid-map.js with 'report_regex_evaluate_error' flag", function () {
            stripSource("./samples/typeid-map.js");
        });
    });
    after(function () {
        console.log();
        customLog(" - - - - - miscellaneous::statistics - - - - -");
        // @ts-ignore 
        rmc.avoidMinified = rmc.avoidMinified;
        console.dir(rmc, { getters: true });
        rmc.reset();
    });
});
//# sourceMappingURL=test.js.map