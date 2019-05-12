
import * as rmc from "../bin/";
import * as fs from "fs";
import "colors";

import * as assert from "assert";

if (!String.prototype.padEnd) {
    String.prototype.padEnd = function(n: number): string {
        let rem = n - this.length;
        if (rem < 0) rem = 0;
        let str = "";
        while (rem--) {
            str +=  " ";
        }
        return this + str;
    };
}

const log = console.log.bind(console.log, "[:test:]");
const warn = console.log.bind(console.log, "[:warn:]"["yellow"]);

const validate = (text: string, expectance: string, rm_ws: boolean = void 0, report_regex_evaluate_error?: boolean): void => {
    let result = rmc(text, rm_ws, report_regex_evaluate_error);
    assert.strictEqual(result, expectance, `failed at case [${text}]`);
    // ✔ :\u2714
    log("\u2714"["green"], `passed: input [${text["cyan"]}],`.padEnd(82), `result [${result["green"]}]`);
};
const caseThrow = (content: string, msg: string, report_regex_evaluate_error?: boolean) => {
    let error: Error = null;
    // check type error.
    try {
        // deceive for tsc.
        rmc(content, true, report_regex_evaluate_error);
    } catch (e) {
        error = e;
        warn(e.message);
    }
    console.assert(error instanceof Error, "failed type check...");
    log("\u2714"["green"], `passed: ${msg}`);
};
const caseCannotProcessed = (content: string, msg: string) => {
    let result = rmc(content);
    assert.strictEqual(content, result, "failed case cannot processed");
    log("\u2714"["green"], `passed: ${msg}`);
};
const stripFile = (path: string) => {
    let js_source = fs.readFileSync(path, "utf-8");
    let result = rmc(js_source, true, true);
    log("A minified source has been detected:", result === js_source);
}

log("rm-cstyle-cmts, version:", rmc.version);
log();

// check invalid content, deceive for tsc.
caseThrow({} as string, "check invalid content");

// QuoteScanner parse error.
caseCannotProcessed("{} as string \'", "QuoteScanner throw check");

// BackQuoteScanner parse error.
caseCannotProcessed("{} as string ` back quote! ` `", "BackQuoteScanner throw check");

// SlashScanner parse error.
caseCannotProcessed("const n: number = 1; /", "SlashScanner throw check");
// SlashScanner parse error.
caseCannotProcessed("const n: number = 1; /* comment /", "SlashScanner throw check");


log();

// case empty string.
validate("", "");

// --- single line input.
validate("  var i = {} / 10; // -> NaN", "var i = {} / 10;");

validate(" { i = \"aaa\\\"\" } /aaa/.test(i);", "{ i = \"aaa\\\"\" } /aaa/.test(i);");
validate(" var i = 10000 / 111.77; /[*]/.test(i); // */", "var i = 10000 / 111.77; /[*]/.test(i);");

validate(" /* comments */ var i = 10000 / 111.77; /\\][*]/.test(i); // */", "var i = 10000 / 111.77; /\\][*]/.test(i);");

validate("      [/\\s*\\(\\?#.*\\)\\/[/*///]\\s*$|#\\s.*$|\\s+/];", "[/\\s*\\(\\?#.*\\)\\/[/*///]\\s*$|#\\s.*$|\\s+/];");
validate("let ok2 = 12.2 / 33 * .9 // \"comments\"...*/", "let ok2 = 12.2 / 33 * .9");

validate(" var re = 10000 / 111.77*gg /gg;;;;  ////// comments...", "var re = 10000 / 111.77*gg /gg;;;;");

validate(" var text0 = 'is text.', text0 = \"is text.\"", "var text0 = 'is text.', text0 = \"is text.\"");
validate(" var text0 = '';", "var text0 = '';");

// --- multi line input.
validate(`  let gg = 10;
var re = 10000 / 111.77*gg /gg;;;;  ////// comments...
//             ^-------------^ <- this case is match. but, not regexp literal`,
`  let gg = 10;
var re = 10000 / 111.77*gg /gg;;;;  
`, false);

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
validate(`return <>
{/* <div id="ccn"/> */}
<AlertDialog
    open={open}
    disAgreeButton={false}
    mainTitle={\`SPA web - \${Properties.version}\`}
    messageText={
    <div /*style={{ backgroundColor: "rgba(238, 238, 238, 0.25)" }}*/>
        <div className="about-content-header" data-text="Dependencies"/>
        <div className="notice-sentence" style={{ marginBottom: 14 }}>
            {depsElementsRef.current}
        </div>

        <div className="about-content-header" data-text="Shortcut keys"/>
        <div className="notice-sentence" style={{ marginBottom: 14 }}>
            {shortCutElementsRef.current}
        </div>

        <div className="about-content-header" data-text="Apache License"/>
        <div className="notice-sentence">{\`Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
\`}
</div>
        </div>
        }
        onCloseHandler={() => setOpenState(false)}
    />
    {/* <div className="sde-version" onClick={() => setOpenState(true)}>{Properties.get("sde-version")}</div> */}
    {VersionElement}
</>;`, `return <>
{}
<AlertDialog
    open={open}
    disAgreeButton={false}
    mainTitle={\`SPA web - \${Properties.version}\`}
    messageText={
    <div >
        <div className="about-content-header" data-text="Dependencies"/>
        <div className="notice-sentence" style={{ marginBottom: 14 }}>
            {depsElementsRef.current}
        </div>
        <div className="about-content-header" data-text="Shortcut keys"/>
        <div className="notice-sentence" style={{ marginBottom: 14 }}>
            {shortCutElementsRef.current}
        </div>
        <div className="about-content-header" data-text="Apache License"/>
        <div className="notice-sentence">{\`Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
\`}
</div>
        </div>
        }
        onCloseHandler={() => setOpenState(false)}
    />
    {}
    {VersionElement}
</>;`);


// with report_regex_evaluate_error: true
validate(
    "  return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);",
    "return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);",
    void 0, true
);
// with report_regex_evaluate_error: true
validate(
    "  l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),",
    "l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),",
    void 0, false
);

 // for coverage (codecov 
// const js_source = fs.readFileSync("tmp/rmc-impossible#2.tsx", "utf-8");
log();
log("[removing comments of ./samples/es6.js with 'report_regex_evaluate_error' flag]".yellow);
stripFile("./samples/es6.js");

log();
log("[removing comments of ./samples/typeid-map.js with 'report_regex_evaluate_error' flag]".yellow);
// @ts-ignore 
rmc.avoidMinified = 5000;
stripFile("./samples/typeid-map.js");

log();
console.dir(rmc, { getters: true });
console.log(rmc.getDetectedReContext());
rmc.reset();

log(`all test done, processed: ${rmc.processed}, noops: ${rmc.noops}`);

