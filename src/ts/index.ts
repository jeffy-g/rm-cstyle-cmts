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

/**
 * number of times successfully processed
 */
let processed = 0;
/**
 * number of times the process was bypassed because the line was too long
 */
let unable_to_process = 0;

/**
 * threshold to avoid processing such as minified source (*line length
 */
let avoid_minified = 8000;

const withNoop = <T>(contents: T) => {
    unable_to_process++;
    return contents;
}

// const MAX_LINE = 8000;
const re_newline = new RegExp(reutil.RE_NEWLINEs.source, "g");

/**
 * 
 * @param source 
 * @param rm_blank_line_n_ws 
 * @param report_regex_evaluate_error 
 */
// @ts-ignore 
const removeCStyleComments: IRemoveCStyleComments = (
    source: string,
    rm_blank_line_n_ws: boolean = true,
    report_regex_evaluate_error?: boolean
): string => {

    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }
    if (source.length === 0) {
        // DEVNOTE: whether return same reference or return new empty string
        return source; // "";
    }

    AVOID_MINFIED: {
        if (avoid_minified) {

            // DEVNOTE: this code take cpu cost
            // const re_line = /^.+$/gm;
            // let m: RegExpExecArray | null;
            // while ( m = re_line.exec(source) ) {
            //     if (m[0].length > avoid_minified) {
            //         return withNoop(source);
            //     }
            // }

            // const re_newline = new RegExp(reutil.RE_NEWLINEs.source, "g");
            re_newline.lastIndex = 0;
            // DEVNOTE: check the single line input
            /* istanbul ignore if */
            if (!re_newline.test(source) && avoid_minified < source.length) {
                console.log();
                // 🚸
                console.log("\u{1F6B8} AVOID_MINFIED: source.length: %s, re_newline.lastIndex: %s", source.length, re_newline.lastIndex);
                return withNoop(source);
            }

            let prev = 0;
            do {
                const lastIndex = re_newline.lastIndex;
                if ( (lastIndex - prev) > avoid_minified ) {
                    // ⛔ ⚠️ 🚸
                    // process.stderr.write(".");
                    return withNoop(source);
                }
                prev = lastIndex;
            } while ( re_newline.test(source) );

            /* istanbul ignore if */
            if ( (source.length - prev) > avoid_minified ) {
                return withNoop(source);
            }
        }
    }

    if (typeof report_regex_evaluate_error === "boolean") {
        Replacer.regexErrorReportEnable(report_regex_evaluate_error);
    }

    // Is nearly equal processing speed?
    // const replacer = is_multi_t? new replace.ReplaceFrontEnd(source): REPLACER.setSubject(source);

    // source = Replacer.apply(source);
    try {
        source = Replacer.apply(source);
    } catch (e) {
        console.warn("\n[Exception occured] The input source will be returned without any processing.");
        return withNoop(source);
    }

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
        regexes.re_ws_qs, ws_qs_replacer // /^\s*$|\s+$/gm, ""
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
        },
        reset: {
            value: () => {
                unable_to_process = 0;
                processed = 0;
                Replacer.reset();
            },
            configurable: false,
            writable: false
        },
        getDetectedReContext: {
            value: () => {
                return Replacer.getDetectedReContext();
            },
            configurable: false,
            writable: false
        },
    }
);

export = removeCStyleComments;
