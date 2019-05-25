///<reference path="../src/ts/index.d.ts"/>

import * as fs from "fs";
import * as assert from "assert";
// DEVNOTE: 2019-5-16 - This import statement make a read-only object.
// import * as rmc from "../src/ts/";
const rmc: IRemoveCStyleComments = require("../src/ts/");


const validate = (text: string, expectance: string, rm_ws?: boolean, report_regex_evaluate_error?: boolean): void => {
    const result = rmc(text, rm_ws, report_regex_evaluate_error);
    assert.strictEqual(result, expectance, `failed at case [${text}]`);
};
// const caseThrow = (content: string, msg: string, report_regex_evaluate_error?: boolean) => {
//     assert.throws(() => {
//         rmc(content, true, report_regex_evaluate_error);
//     }, TypeError, msg);
// };
const stripSource = (path: string) => {
    const js_source = fs.readFileSync(path, "utf-8");
    assert.doesNotThrow(() => {
        /* const result = */rmc(js_source, true, true);
    });
};


describe("Only throws invalid input content", () => {
    it("case invalid content", () => {
        // caseThrow({} as string, "check invalid content");
        assert.throws(() => {
            rmc({} as string);
        }, TypeError, "check invalid content");
    });
});

//
// 
//
describe.each([
    ["QuoteScanner::imcomplete single quote", "    let text = `this is a ${'pen'}`; '", "    let text = `this is a ${'pen'}`; '"],
    ["BackQuoteScanner::imcomplete backquote", "{} as string ` back quote! ` `", "{} as string ` back quote! ` `"],
    ["SlashScanner::extra slash", "const n: number = 1; /", "const n: number = 1; /"],
    ["SlashScanner::imcomplete block comment", "const n: number = 1; /* comment /", "const n: number = 1; /* comment /"],
])(
    "The input source will be returned without any processing when exception occured",
    (title, input, output) => {
        it(title, () => {
            validate(input, output);
        });
    },
);

describe("Input and Result Verification", () => {

    it("case empty string.", () => {
        validate("", "");
    });

    describe("single line input", () => {
        it("remove ahead whitespace + linecomment #1", () => {
            validate("  var i = {} / 10; // -> NaN", "var i = {} / 10;");
        });
        it("remove ahead whitespace + linecomment #2", () => {
            validate(" var i = 10000 / 111.77; /[/*]/.test(i); // */", "var i = 10000 / 111.77; /[/*]/.test(i);");
        });

        it("remove ahead whitespace", () => {
            validate(" { i = \"aaa\\\"\" } /aaa/.test(i);", "{ i = \"aaa\\\"\" } /aaa/.test(i);");
        });

        it("remove ahead whitespace + blockcomment + linecomment", () => {
            validate(" /* comments */ var i = 10000 / 111.77; /\\][/*]/.test(i); // */", "var i = 10000 / 111.77; /\\][/*]/.test(i);");
        });

        it("remove ahead whitespace, detect regex", () => {
            validate("      [/\\s*\\(\\?#.*\\)\\/[/*///]\\s*$|#\\s.*$|\\s+/];", "[/\\s*\\(\\?#.*\\)\\/[/*///]\\s*$|#\\s.*$|\\s+/];");
        });
        it("linecomment at around calculation statement (properly detect line comment", () => {
            validate("let ok2 = 12.2 / 33 * .9 // \"comments\"...*/", "let ok2 = 12.2 / 33 * .9", true, true);
        });
        it("linecomment at around calculation statement (probably regex miss detect", () => {
            validate(" var re = 10000 / 111.77*gg /gg;;;;  ////// comments...", "var re = 10000 / 111.77*gg /gg;;;;");
        });

    });

    describe("multi line input (this case only remove kinds of comments, and blank line)", () => {

        it("#1", () => {
            validate(`  let gg = 10;
var re = 10000 / 111.77*gg /gg;;;;  ////// comments...
//             ^-------------^ <- this case is match. but, not regexp literal`, `  let gg = 10;
var re = 10000 / 111.77*gg /gg;;;;  
`, false);
        });

        it("#2 nested es6 template string", () => {
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
;`");
        });

        //
        // case tsx source fragment
        //
        it("#3 tsx source fragment", () => {
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
</>;`
            );
        });

        it("#4 with report_regex_evaluate_error: true", () => {
            validate(
                "  return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);",
                "return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);",
                void 0, true
            );
        });

        it("#5 with report_regex_evaluate_error: false", () => {
            validate(
                "  l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),",
                "l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),",
                void 0, false
            );
        });

    });

    describe("strip text file (this case only remove kinds of comments, and blank line)", () => {
        it("removing comments of ./samples/es6.js with 'report_regex_evaluate_error' flag", () => {
            stripSource("./samples/es6.js");
        });
        it("removing comments of ./samples/typeid-map.js with 'report_regex_evaluate_error' flag", () => {
            stripSource("./samples/typeid-map.js");
        });
    });

    afterAll(() => {
        rmc.avoidMinified = rmc.avoidMinified;
        const context = rmc.getDetectedReContext();
        console.log(
`- - - - - miscellaneous::statistics - - - - -
noops      : ${rmc.noops}
processed  : ${rmc.processed}
evaluatedLiterals : ${context.evaluatedLiterals}
detectedReLiterals: [
  ${context.detectedReLiterals.join(",\n  ")}
]
`
        );
        rmc.reset();
    });
});

