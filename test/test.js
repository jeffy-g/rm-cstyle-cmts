///<reference path="../src/ts/index.ts"/>
///<reference path="../src/ts/globals.d.ts"/>
/** @type {IRemoveCStyleCommentsModule} */
var rmc = require("../bin/");
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
function validate(text, expectance) {
    var result = rmc(text);
    console.assert(result === expectance, "failed at case [" + text + "]");
    // ✔ :\u2714
    console.log(("\u2714 passed: input [" + text + "],").padEnd(82), "result [" + result + "]");
}
// case empty string.
validate("", "");
// --- single line input.
validate("  var i = {} / 10; // -> NaN", "var i = {} / 10;");
validate(" { i = \"aaa\" } /aaa/.test(i);", "{ i = \"aaa\" } /aaa/.test(i);");
validate(" var i = 10000 / 111.77; /[/*]/.test(i); // */", "var i = 10000 / 111.77; /[/*]/.test(i);");
validate(" /* comments */ var i = 10000 / 111.77; /\\][/*]/.test(i); // */", "var i = 10000 / 111.77; /\\][/*]/.test(i);");
validate("      [/\\s*\\(\\?#.*\\)\\/[/*///]\\s*$|#\\s.*$|\\s+/];", "[/\\s*\\(\\?#.*\\)\\/[/*///]\\s*$|#\\s.*$|\\s+/];");
validate(" var re = 10000 / 111.77*gg /gg;;;;  ////// comments...", "var re = 10000 / 111.77*gg /gg;;;;");
// --- multi line input.
validate("  let gg = 10;\nvar re = 10000 / 111.77*gg /gg;;;;  ////// comments...\n//             ^-------------^ <- this case is match. but, not regexp literal", "  let gg = 10;\nvar re = 10000 / 111.77*gg /gg;;;;");
