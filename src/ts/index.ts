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
/// <reference path="./index.d.ts"/>
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** character scanner module */
import * as JsScanner from "./js-scanner";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * replace to version string at build time
 */
const latest_version: string = "v2.3.4";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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

const withNoop = (contents: string) => {
    unable_to_process++;
    return contents;
};


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
        if (avoid_minified > 0) {

            // DEVNOTE: this code take cpu cost
            // const re_line = /^.+$/gm;
            // let m: RegExpExecArray | null;
            // while ( m = re_line.exec(source) ) {
            //     if (m[0].length > avoid_minified) {
            //         return withNoop(source);
            //     }
            // }

            const re_newline = /\r\n|\n|\r/g;
            // DEVNOTE: check the single line input
            /* istanbul ignore if */
            if (!re_newline.test(source) && avoid_minified < source.length) {
                console.log("\n\u{1F6B8} AVOID_MINFIED: source.length: %s, re_newline.lastIndex: %s", source.length, re_newline.lastIndex);
                return withNoop(source);
            }

            let prev = 0;
            do {
                const lastIndex = re_newline.lastIndex;
                if ( (lastIndex - prev) > avoid_minified ) {
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
        JsScanner.regexErrorReportEnable(report_regex_evaluate_error);
    }

    try {
        source = JsScanner.apply(source, rm_blank_line_n_ws);
        processed++;
        return source;
    } catch (e) {
        console.warn("\n[Exception occured] The input source will be returned without any processing.");
        return withNoop(source);
    }

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
            get: () => avoid_minified,
            set: (value: number) => { avoid_minified = value; },
            enumerable: true,
            configurable: true,
        },
        noops: {
            get: () => unable_to_process,
            enumerable: true,
            configurable: false,
        },
        processed: {
            get: () => processed,
            enumerable: true,
            configurable: false,
        },
        reset: {
            value: () => {
                unable_to_process = 0;
                processed = 0;
                JsScanner.reset();
            },
            configurable: false,
            writable: false
        },
        getDetectedReContext: {
            value: () => JsScanner.getDetectedReContext(),
            configurable: false,
            writable: false
        },
        // getDetectedJSDocTags: {
        //     value: () => JsScanner.getDetectedJSDocTags(),
        //     configurable: false,
        //     writable: false
        // },
        addListener: {
            value: (listener: IScannerListener) => {
                JsScanner.setListener(listener);
            },
            configurable: false,
            writable: false
        },
    }
);

export = removeCStyleComments;
