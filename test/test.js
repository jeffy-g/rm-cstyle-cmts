"use strict";
exports.__esModule = true;
var rmc = require("../bin/");
var fs = require("fs");
require("colors");
if (!String.prototype.padEnd) {
    String.prototype.padEnd = function (n) {
        var rem = n - this.length;
        if (rem < 0)
            rem = 0;
        var str = "";
        while (rem--) {
            str += " ";
        }
        return this + str;
    };
}
var customLog = console.log.bind(console.log, "[TEST::]");
function validate(text, expectance, rm_ws, report_regex_evaluate_error) {
    if (rm_ws === void 0) { rm_ws = void 0; }
    var result = rmc(text, rm_ws, report_regex_evaluate_error);
    console.assert(result === expectance, "failed at case [" + text + "]");
    // ✔ :\u2714
    customLog("\u2714"["green"], ("passed: input [" + text["cyan"] + "],").padEnd(82), "result [" + result["green"] + "]");
}
function caseThrow(content, msg, report_regex_evaluate_error) {
    var error = null;
    // check type error.
    try {
        // deceive for tsc.
        rmc(content, true, report_regex_evaluate_error);
    }
    catch (e) {
        error = e;
        console.info("[message]"["yellow"], e.message);
    }
    console.assert(error instanceof Error, "failed type check...");
    customLog("\u2714"["green"], "passed: " + msg);
}
customLog("rm-cstyle-cmts, version: %s", rmc.version);
customLog();
// check invalid content, deceive for tsc.
caseThrow({}, "check invalid content");
// QuoteScanner parse error.
caseThrow("{} as string \'", "QuoteScanner throw check");
// BackQuoteScanner parse error.
caseThrow("{} as string ` back quote! ` `", "BackQuoteScanner throw check");
// SlashScanner parse error.
caseThrow("const n: number = 1; /", "SlashScanner throw check");
// SlashScanner parse error.
caseThrow("const n: number = 1; /* comment /", "SlashScanner throw check");
customLog();
// case empty string.
validate("", "");
// --- single line input.
validate("  var i = {} / 10; // -> NaN", "var i = {} / 10;");
validate(" { i = \"aaa\\\"\" } /aaa/.test(i);", "{ i = \"aaa\\\"\" } /aaa/.test(i);");
validate(" var i = 10000 / 111.77; /[/*]/.test(i); // */", "var i = 10000 / 111.77; /[/*]/.test(i);");
validate(" /* comments */ var i = 10000 / 111.77; /\\][/*]/.test(i); // */", "var i = 10000 / 111.77; /\\][/*]/.test(i);");
validate("      [/\\s*\\(\\?#.*\\)\\/[/*///]\\s*$|#\\s.*$|\\s+/];", "[/\\s*\\(\\?#.*\\)\\/[/*///]\\s*$|#\\s.*$|\\s+/];");
validate("let ok2 = 12.2 / 33 * .9 // \"comments\"...*/", "let ok2 = 12.2 / 33 * .9");
validate(" var re = 10000 / 111.77*gg /gg;;;;  ////// comments...", "var re = 10000 / 111.77*gg /gg;;;;");
validate(" var text0 = 'is text.', text0 = \"is text.\"", "var text0 = 'is text.', text0 = \"is text.\"");
validate(" var text0 = '';", "var text0 = '';");
// --- multi line input.
validate("  let gg = 10;\nvar re = 10000 / 111.77*gg /gg;;;;  ////// comments...\n//             ^-------------^ <- this case is match. but, not regexp literal", "  let gg = 10;\nvar re = 10000 / 111.77*gg /gg;;;;  \n", false);
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
//
// case tsx source fragment
//
validate("return <>\n{/* <div id=\"ccn\"/> */}\n<AlertDialog\n    open={open}\n    disAgreeButton={false}\n    mainTitle={`SPA web - ${Properties.version}`}\n    messageText={\n    <div /*style={{ backgroundColor: \"rgba(238, 238, 238, 0.25)\" }}*/>\n        <div className=\"about-content-header\" data-text=\"Dependencies\"/>\n        <div className=\"notice-sentence\" style={{ marginBottom: 14 }}>\n            {depsElementsRef.current}\n        </div>\n\n        <div className=\"about-content-header\" data-text=\"Shortcut keys\"/>\n        <div className=\"notice-sentence\" style={{ marginBottom: 14 }}>\n            {shortCutElementsRef.current}\n        </div>\n\n        <div className=\"about-content-header\" data-text=\"Apache License\"/>\n        <div className=\"notice-sentence\">{`Licensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n`}\n</div>\n        </div>\n        }\n        onCloseHandler={() => setOpenState(false)}\n    />\n    {/* <div className=\"sde-version\" onClick={() => setOpenState(true)}>{Properties.get(\"sde-version\")}</div> */}\n    {VersionElement}\n</>;", "return <>\n{}\n<AlertDialog\n    open={open}\n    disAgreeButton={false}\n    mainTitle={`SPA web - ${Properties.version}`}\n    messageText={\n    <div >\n        <div className=\"about-content-header\" data-text=\"Dependencies\"/>\n        <div className=\"notice-sentence\" style={{ marginBottom: 14 }}>\n            {depsElementsRef.current}\n        </div>\n        <div className=\"about-content-header\" data-text=\"Shortcut keys\"/>\n        <div className=\"notice-sentence\" style={{ marginBottom: 14 }}>\n            {shortCutElementsRef.current}\n        </div>\n        <div className=\"about-content-header\" data-text=\"Apache License\"/>\n        <div className=\"notice-sentence\">{`Licensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n`}\n</div>\n        </div>\n        }\n        onCloseHandler={() => setOpenState(false)}\n    />\n    {}\n    {VersionElement}\n</>;");
// with report_regex_evaluate_error: true
validate("  return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);", "return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);", void 0, true);
// with report_regex_evaluate_error: true
validate("  l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),", "l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),", void 0, false);
// for coverage (codecov 
// const js_source = fs.readFileSync("tmp/rmc-impossible#2.tsx", "utf-8");
var js_source = fs.readFileSync("./samples/es6.js", "utf-8");
customLog();
customLog("[removing comments of ./samples/es6.js with 'report_regex_evaluate_error' flag]".yellow);
var result = rmc(js_source, true, true);
js_source = fs.readFileSync("./samples/typeid-map.js", "utf-8");
customLog();
customLog("[removing comments of ./samples/typeid-map.js with 'report_regex_evaluate_error' flag]".yellow);
// @ts-ignore 
rmc.avoidMinified = rmc.avoidMinified - 1;
console.dir(rmc, { getters: true });
result = rmc(js_source, true, true);
customLog("all test done, processed: %s, noops:", rmc.processed, rmc.noops);
rmc.reset();
//# sourceMappingURL=test.js.map