"use strict";
///<reference path="../bin/globals.d.ts"/>
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
function validate(text, expectance, rm_ws, report_regex_evaluate_error) {
    if (rm_ws === void 0) { rm_ws = void 0; }
    var result = rmc(text, rm_ws, report_regex_evaluate_error);
    console.assert(result === expectance, "failed at case [" + text + "]");
    // ✔ :\u2714
    console.log("\u2714"["green"], ("passed: input [" + text["cyan"] + "],").padEnd(82), "result [" + result["green"] + "]");
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
    console.log("\u2714"["green"], "passed: " + msg);
}
console.log("rm-cstyle-cmts, version: %s", rmc.version);
console.log();
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
console.log();
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
// with report_regex_evaluate_error: true
validate("  return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);", "return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);", void 0, true);
// with report_regex_evaluate_error: true
validate("  l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),", "l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),", void 0, false);
// for coverage (codecov 
var js_source = fs.readFileSync("./samples/es6.js", "utf-8");
console.log();
console.log("[removing comments of ./samples/es6.js with 'report_regex_evaluate_error' flag]".yellow);
rmc(js_source, true, true);
