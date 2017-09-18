"use strict";
///<reference path="../bin/globals.d.ts"/>
exports.__esModule = true;
var rmc = require("../bin/");
var fs = require("fs");
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
function validate(text, expectance, rm_ws) {
    if (rm_ws === void 0) { rm_ws = true; }
    var result = rmc(text, rm_ws);
    console.assert(result === expectance, "failed at case [" + text + "]");
    // ✔ :\u2714
    console.log(("\u2714 passed: input [" + text + "],").padEnd(82), "result [" + result + "]");
}
function caseThrow(content, msg) {
    var error = null;
    // check type error.
    try {
        // deceive for tsc.
        rmc(content);
    }
    catch (e) {
        error = e;
    }
    console.assert(error instanceof Error, "failed type check...");
    console.log("\u2714 passed: " + msg);
}
console.log("rm-cstyle-cmts, version: %s", rmc.version);
console.log();
// check invalid content, deceive for tsc.
caseThrow({}, "check invalid content");
// QuoteVisitor parse error.
caseThrow("{} as string \'", "QuoteVisitor throw check");
// BackQuoteVistor parse error.
caseThrow("{} as string ` back quote! ` `", "BackQuoteVistor throw check");
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
validate(" var text0 = ''/", "var text0 = ''/");
// --- multi line input.
validate("  let gg = 10;\nvar re = 10000 / 111.77*gg /gg;;;;  ////// comments...\n//             ^-------------^ <- this case is match. but, not regexp literal", "  let gg = 10;\nvar re = 10000 / 111.77*gg /gg;;;;  \n", false);
// LF
validate("  let gg = 10;\nvar re = 10000 / 111.77*gg /gg;;;;  ////// comments...\n//             ^-------------^ <- this case is match. but, not regexp literal", "  let gg = 10;\nvar re = 10000 / 111.77*gg /gg;;;;");
// CR
validate("  let gg = 10;\rvar re = 10000 / 111.77*gg /gg;;;;  ////// comments...\r//             ^-------------^ <- this case is match. but, not regexp literal", "  let gg = 10;\rvar re = 10000 / 111.77*gg /gg;;;;");
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
// for coverage (codecov 
var js_source = fs.readFileSync("./samples/es6.js", "utf-8");
rmc(js_source, true);
