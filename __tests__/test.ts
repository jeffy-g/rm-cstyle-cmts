/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
///<reference path="../src/index.d.ts"/>

import * as fs from "fs";
import * as assert from "assert";
import "colors";


type KRmcImportPath = `../${"src" | "dist" | "dist/webpack" | "dist/umd"}/`;
type TRmcImport = {
    [index in KRmcImportPath]: typeof import("../src");
};

// mute the "warn"
console.warn = () => ({});

const defaultOpt: TRemoveCStyleCommentsOpt = {
    // preserveBlanks: false,
    collectRegex: true,
    // showErrorMessage: false
};

jest.setTimeout(20_000);
//*
eachModule("../src/");
eachModule("../dist/");
eachModule("../dist/webpack/");
eachModule("../dist/umd/");
/*/
eachModule("../dist/esm/index.mjs"); // error
//*/

function eachModule(path: KRmcImportPath) {

    let rmc: typeof import("../src/");
    const validate = (text: string, expectance: string, opt: TRemoveCStyleCommentsOpt = {}, isWalk = false): void => {
        opt = { ...defaultOpt, ...opt };
        if (!isWalk) {
            const result = rmc(text, opt);
            assert.strictEqual(result, expectance, `failed at case [${text}]`);
        } else { // walk through mode
            rmc.walk(text, opt);
        }
    };
    const stripSource = (path: string) => {
        const jsSource = fs.readFileSync(path, "utf-8");
        assert.doesNotThrow(() => {
            /* const result = */
            rmc(jsSource, { collectRegex: true });
        });
    };
    const listener: IScanEventCallback = ({ event, fragment }) => {
        if (event === EScannerEvent.SingleLineComment) {
            // fake
            return /^---/.test(fragment);
        }
        return false;
    };

    beforeAll(async () => {
        const mod: TRmcImport[typeof path] = await import(path);
        rmc = mod;
        rmc.setListener(listener);
    });

    describe("Only throws invalid input content", () => {
        it(`[${path}] case invalid content`, () => {
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
        ["QuoteScanner::incomplete single quote", "    let text = `this is a ${'pen'}`; '", "    let text = `this is a ${'pen'}`; '"],
        ["BackQuoteScanner::incomplete backquote", "{} as string ` back quote! ` `", "{} as string ` back quote! ` `"],
        ["SlashScanner::extra slash", "const n: number = 1; /", "const n: number = 1; /"],
        ["SlashScanner::incomplete block comment", "const n: number = 1; /* comment /", "const n: number = 1; /* comment /"],
    ])(
        "The input source will be returned without any processing when exception occured",
        (title, input, output) => {
            it(`[${path}] ${title}` + " (showErrorMessage)", () => {
                validate(input, output, { showErrorMessage: true });
            });
            it(`[${path}] ${title}`, () => {
                validate(input, output);
            });
        },
    );

    describe("Input and Result Verification", () => {

        it(`[${path}] remove comments with default options`, () => {
            rmc("text");
        });
        it(`[${path}] walk through with default options`, () => {
            rmc.walk("text");
        });

        it(`[${path}] case empty string.`, () => {
            validate("", "");
        });

        describe("single line input", () => {
            it(`[${path}] remove ahead whitespace + linecomment #1`, () => {
                validate("  var i = {} / 10; // -> NaN", "var i = {} / 10;");
            });
            it(`[${path}] remove ahead whitespace + linecomment #2`, () => {
                validate(" var i = 10000 / 111.77; /[/*]/.test(i); // */", "var i = 10000 / 111.77; /[/*]/.test(i);");
            });

            it(`[${path}] remove ahead whitespace`, () => {
                validate(" { i = \"aaa\\\"\" } /aaa/.test(i);", "{ i = \"aaa\\\"\" } /aaa/.test(i);");
            });

            it(`[${path}] remove ahead whitespace + blockcomment + linecomment`, () => {
                validate(" /* comments */ var i = 10000 / 111.77; /\\][/*]/.test(i); // */", "var i = 10000 / 111.77; /\\][/*]/.test(i);");
            });

            it(`[${path}] remove ahead whitespace, detect regex`, () => {
                validate("      [/\\s*\\(\\?#.*\\)\\/[/*[)(?\\]]\\s*$|#\\s.*$|\\s+/];", "[/\\s*\\(\\?#.*\\)\\/[/*[)(?\\]]\\s*$|#\\s.*$|\\s+/];");
            });
            it(`[${path}] linecomment at around calculation statement (properly detect line comment`, () => {
                validate("let ok2 = 12.2 / 33 * .9 // \"comments\"...*/", "let ok2 = 12.2 / 33 * .9");
            });
            it(`[${path}] linecomment at around calculation statement (probably regex miss detect`, () => {
                validate(" var re = 10000 / 111.77*gg /gg;;;;  ////// comments...", "var re = 10000 / 111.77*gg /gg;;;;");
            });

        });

        describe("multi line input (this case only remove kinds of comments, and blank line)", () => {

            it(`[${path}] #1 this test source newline is ` + "[CRLF]".red + "(preserveBlanks)", () => {
                validate(`  let gg = 10;
var re = 10000 / 111.77*gg /gg;;;;  ////// comments...
//             ^-------------^ <- this case is match. but, not regexp literal`, `  let gg = 10;
var re = 10000 / 111.77*gg /gg;;;;  
`, { preserveBlanks: true });
            });

            it(`[${path}] #2 nested es6 template string`, () => {
                validate("const templete = `function ${name + (1 / 2)}($) {\n\
    // comment line (in template string)\n\
    var some = ${\n\
        // comment line...\n\
        `12.5 / 50 * 100,\n\
        \n\
        // might be a very important comment line (in template string)\n\
        things = \"${ name + `anything` }\",\n\
        obj={ \"\\\\\": null }`\n\
\n\
    }; \`\`\n\
    /**\n\
     * multi line comment (in template string)\n\
     */\n\
    return true;\n\
}\n\
;`", "const templete = `function ${name + (1 / 2)}($) {\n\
    // comment line (in template string)\n\
    var some = ${\n\
        \n\
        `12.5 / 50 * 100,\n\
        \n\
        // might be a very important comment line (in template string)\n\
        things = \"${ name + `anything` }\",\n\
        obj={ \"\\\\\": null }`\n\
\n\
    }; \`\`\n\
    /**\n\
     * multi line comment (in template string)\n\
     */\n\
    return true;\n\
}\n\
;`");
            });

            //
            // case tsx source fragment
            //
            it(`[${path}] #3 tsx source fragment`, () => {
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

            it(`[${path}] #4 with report_regex_evaluate_error: true`, () => {
                validate(
                    "  return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);",
                    "return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);",
                );
            });

            it(`[${path}] #5 with report_regex_evaluate_error: false`, () => {
                validate(
                    "  l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),",
                    "l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),",
                );
            });
            it(`[${path}] #5-2 with report_regex_evaluate_error: false`, () => {
                validate(
                    "  const nn = value/(ret++)*8/gm;",
                    "const nn = value/(ret++)*8/gm;",
                );
            });

            it(`[${path}] #6 newline is ` + "[LF]".red, () => {
                validate(
                    "const anonymouse = () => {\n    const x = 777 / 3;\n    /// this is line comment  \n    return x % 2;\n};\n\n/* block comments */",
                    "const anonymouse = () => {\n    const x = 777 / 3;\n    return x % 2;\n};",
                );
            });
            it(`[${path}] #7 newline is ` + "[CR]".red, () => {
                validate(
                    "const anonymouse = () => {\r    const x = 777 / 3;\r    /// this is line comment  \r    return x % 2;\r};\r\r/* block comments */",
                    "const anonymouse = () => {\r    const x = 777 / 3;\r    return x % 2;\r};",
                );
            });

        });

        describe("strip text file (this case only remove kinds of comments, and blank line)", () => {
            it(`[${path}] removing comments of ./samples/es6.js with 'report_regex_evaluate_error' flag`, () => {
                stripSource("./samples/es6.js");
            });
            // DEVNOTE: 2022/1/21 3:05:02
            // it("removing comments of ./samples/typeid-map.js with 'report_regex_evaluate_error' flag", () => {
            //     stripSource("./samples/typeid-map.js");
            // });
        });

        // describe("preserve JSDoc by TScanEventCallback", () => {
        describe("preserve JSDoc by " + "TScanEventCallback".cyan, () => {
            // beforeAll(() => {
            //     return new Promise<void>(resolve => {
            //         rmc.setListener((a, b) => {
            //             if (a === ScannerEvent.MultiLineComment) {
            //                 return /^\/\*\*\s/m.test(b);
            //                 // return false;
            //             }
            //             return false;
            //         });
            //         resolve();
            //     });
            // });
            // afterAll(() => {
            //     rmc.setListener(listener);
            // });
            it(`[${path}] #1 jsdoc comment must be preserve`, () => {
                let counter = 0;
                rmc.setListener(({ event, fragment }) => {
                    counter++;
                    if (event === EScannerEvent.MultiLineComment) {
                        return /^\/\*\*\s/m.test(fragment);
                    }
                    return false;
                });
                validate(
`
/**
 * for test
 * @see {@link https://example.com Dummy link}
 * @type {boolean} some number variable
 */
// DEVNOTE: dummy var
const some = 100; 
`,
`/**
 * for test
 * @see {@link https://example.com Dummy link}
 * @type {boolean} some number variable
 */
const some = 100;`
                );
                rmc.setListener(listener);
                // TODO: "The current implementation calls the scan event listener twice"
                expect(counter).toBe(2);
            });
        });

        describe("The Walk through mode", () => {
            it(`[${path}] #1 case invalid content`, () => {
                // caseThrow({} as string, "check invalid content");
                assert.throws(() => {
                    rmc.walk({} as string);
                }, TypeError, "check invalid content");
            });
            it(`[${path}] #2 case empty string`, () => {
                validate("", "", {}, true);
            });
            it(`[${path}] #3 case syntax error`, () => {
                validate("    let text = `this is a ${'pen'}`; '", "", { showErrorMessage: true }, true);
            });
            // describe("The " + "Walk through mode".cyan, () => {
            it(`[${path}] #4 when listener always return \`true\``, () => {
                rmc.setListener((/* { event, fragment } */) => {
                    // if (event === ScannerEvent.MultiLineComment) {
                    //     return /^\/\*\*\s/m.test(fragment);
                    // }
                    return true;
                });
                validate(
`/**
 * for test
 * @see {@link https://example.com Dummy link}
 * @type {boolean} some number variable
 */
// DEVNOTE: dummy var
const Component = <div></div>; 
`,
"", {}, true);
                rmc.setListener(listener);
            });
        });

        afterAll(() => {
            const context = rmc.getDetectedReContext();
            const noops = rmc.noops;
            const processed = rmc.processed;
            if (!process.env.CI) {
                console.log(
`- - - - - miscellaneous::statistics - - - - -
noops      : ${noops}
processed  : ${processed}
detected regex count: ${context.detectedReLiterals.length}
uniqReLiterals: [
  ${context.uniqReLiterals.join(",\n  ")}
]
`);
            }
            rmc.reset();
            rmc.setListener();
            rmc("// DEVNOTE:");
            rmc.setListener();
            rmc.walk("// DEVNOTE:");
        });
    });

}
