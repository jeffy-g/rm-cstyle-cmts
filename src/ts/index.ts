/*
-----------------------------------------------------------------------

Copyright 2017 motrohi

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

------------------------------------------------------------------------
*/
///<reference path="./index.d.ts"/>
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** IReplaceFrontEnd */
import * as replace from "./replace";
/** lookupRegexes, RE_NEWLINEs */
import * as reutil from "./reutil";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * replace to version string at build time
 */
const latest_version: string = "pkg.version";
/**
 * singleton instance.
 */
const Replacer = replace.getFrondEnd();


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * 
 * @param matched 
 */
const ws_qs_replacer = (matched: string/*, index: number, inputs: string*/) => {
    const head = matched[0];
    // NOTE: need skip quoted string, regexp literal.
    return (head === "`" || head === "/" || head === "'" || head === '"')? matched: "";
// FIXED: In some cases, a newline character remains at the beginning or the end of the file. (rm_blank_line_n_ws=true, at src/ts/index.ts
// NOTE: this regex seems to be the correct answer...
};

let processed = 0;
let unable_to_process = 0;
let avoid_minified = 8000;

// const MAX_LINE = 8000;
const re_newline = new RegExp(reutil.RE_NEWLINEs.source, "g");

/**
 * 
 * @param source 
 * @param rm_blank_line_n_ws 
 * @param report_regex_evaluate_error 
 */
const removeCStyleComments: IRemoveCStyleComments = (
    source: string,
    rm_blank_line_n_ws: boolean = true,
    report_regex_evaluate_error?: boolean
): string => {

    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }

    AVOID_MINFIED: {
        if (avoid_minified) {

            // DEVNOTE: this code take cpu cost
            // const re_line = /^.+$/gm;
            // let m: RegExpExecArray | null;
            // while ( m = re_line.exec(source) ) {
            //     if (m[0].length > avoid_minified) {
            //         unable_to_process++;
            //         return source;
            //     }
            // }

            // const re_newline = new RegExp(reutil.RE_NEWLINEs.source, "g");
            re_newline.lastIndex = 0;
            let prev = 0;
            while ( re_newline.test(source) ) {
                if ((re_newline.lastIndex - prev) > avoid_minified) {
                    // console.log("detect minified source, cannot proceed process...");
                    // ⛔ ⚠️ 🚸
                    // process.stderr.write(".");
                    unable_to_process++;
                    return source;
                }
                prev = re_newline.lastIndex;
                // console.log(`prev: ${prev}`);
            }
        }
    }

    if (typeof report_regex_evaluate_error === "boolean") {
        Replacer.regexErrorReportEnable(report_regex_evaluate_error);
    }
    // Is nearly equal processing speed?
    // const replacer = is_multi_t? new replace.ReplaceFrontEnd(source): REPLACER.setSubject(source);
    source = Replacer.apply(source);

    processed++;
    if (!rm_blank_line_n_ws) {
        return source;
    }

    const regexes = reutil.lookupRegexes(source);
    // NOTE: this combination does not do the intended work...
    // return rm_blank_line_n_ws? source.replace(/^\s+$|[\r\n]+$|^[\r\n]/gm, ""): source;
    // return rm_blank_line_n_ws? source.replace(/^\s+$|[\r\n]+$|^[\r\n]|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm, _rwq): source;
    /* remove whitespaces.*/
    // BUG : 2017/9/6 23:52:13 #cannot keep blank line at nested es6 template string. `rm_blank_line_n_ws` flag is `true`
    // FIXED:? 2017/9/6 22:00:10 #cannot beyond regex.
    return source.replace(
        regexes.re_ws_qs, ws_qs_replacer
    )
    .replace(regexes.re_first_n_last, "");
    // .replace(/^\s+|\s+$/g, ""); // can handle it reliably, but consume a lot more cpu time a little.
};

/* removeCStyleComments = */ Object.defineProperties(removeCStyleComments, {
        // create readonly property "version"
        version: {
            value: latest_version,
            enumerable: true,
            configurable: false,
            writable: false
        },
        avoidMinified: {
            get: () => { return avoid_minified; },
            set: (value: number) => { avoid_minified = value; },
            enumerable: true,
            configurable: true,
        },
        noops: {
            get: () => { return unable_to_process; },
            enumerable: true,
            configurable: false,
        },
        processed: {
            get: () => { return processed; },
            enumerable: true,
            configurable: false,
        }
    }
);

export = removeCStyleComments;
