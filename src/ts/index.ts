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
import * as fs from "fs";
import * as path from "path";

import * as replace from "./replace";

declare global {
    /**
     * remove c style comments interface.
     */
    interface IRemoveCStyleCommentsTypeSig {
        /**
         * #### remove c style comments form "source" content.  
         * 
         * step 1:  
         *  - remove line comments, multi line comments.  
         *  - and search the regexp literal. if found then concat it to results.  
         * 
         * step 2:  
         *  - remove whitespaces.(if need, see @param rm_blank_line_n_ws
         * 
         * @param {string} source c style commented text source.
         * @param {boolean} rm_blank_line_n_ws remove black line and whitespaces, default is "true".
         * @param {boolean} is_multi_t use multi process?, default is "false".
         */
        (source: string, rm_blank_line_n_ws?: boolean, is_multi_t?: boolean): string;
        /**
         * maintain blank lines in double quotes and single quotes. (if need
         */
        keepMoreBlankLine?(is: boolean): void;

        /**
         * current keepMoreBlankLine state.
         */
        readonly isKeep?: boolean;

        /** package version */
        readonly version?: string;
    }
    // for String.replace
    type StringReplacer = (matchBody: string, ...args: (string | number)[]) => string;
}

/**  */
// const pkg = JSON.parse(
//     fs.readFileSync("./package.json", 'utf-8')
// );
/** TODO: edit jsdoc */
const latest_version = "v1.3.6"; //pkg.version;
/**
 * singleton instance for synchronous use.
 */
const REPLACER = new replace.ReplaceFrontEnd("");

/** TODO: edit jsdoc */
let _rwq: StringReplacer;

// replace without quoted.
/** TODO: edit jsdoc */
let re_blank: RegExp;
/** TODO: edit jsdoc */
let re_crlf_end: RegExp;
/** TODO: edit jsdoc */
let re_crlf_start: RegExp;

/** state of "keep more blank line" */
let is_keep = false;
/**
 * maintain blank lines in ["] or [']. (if need
 * @param is ...
 */
function keepMoreBlankLine(is: boolean): void {
    if (is) {
        // case "v1.2.3":
        // _rwq = (all, bq: string, dq: string, sq: string, index: number) => {
        //     return (bq || dq || sq)? all: "";
        // };
        // re_blank = /^[\s]+$|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
        // re_crlf_end = /[\r\n]+$|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
        // re_crlf_start = /^[\r\n]|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;

        // ["\r", "\n", "'", `"`, "`", " "].map(v => v.charCodeAt(0).toString(2));
        _rwq = (all, index: number) => {
            const q = all[0];
            return (q === "`" || q === `"` || q === `'`)? all: "";
        };
        re_blank = /^[\s]+$|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'/gm;
        re_crlf_end = /[\r\n]+$|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'/gm;
        re_crlf_start = /^[\r\n]|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'/gm;
    } else {
        // case "v1.3.0":
        // _rwq = (all, bq: string, index: number) => {
        //     return bq? all: "";
        // };
        // re_blank = /^[\s]+$|(`(?:\\[\s\S]|[^`])*`)/gm;
        // re_crlf_end = /[\r\n]+$|(`(?:\\[\s\S]|[^`])*`)/gm;
        // re_crlf_start = /^[\r\n]|(`(?:\\[\s\S]|[^`])*`)/gm;
        _rwq = (all, index: number) => {
            return all[0] === "`"? all: "";
        };
        re_blank = /^[\s]+$|`(?:\\[\s\S]|[^`])*`/gm;
        re_crlf_end = /[\r\n]+$|`(?:\\[\s\S]|[^`])*`/gm;
        re_crlf_start = /^[\r\n]|`(?:\\[\s\S]|[^`])*`/gm;
    }
    is_keep = is;
}

// interface NodeModule {
//     exports: IRemoveCStyleCommentsTypeSig;
//     require: NodeRequireFunction;
//     id: string;
//     filename: string;
//     loaded: boolean;
//     parent: NodeModule | null;
//     children: NodeModule[];
// }
// declare var module: NodeModule;

module.exports = Object.defineProperties(
    (source, rm_blank_line_n_ws = true, is_multi_t = false): string => {

        if (typeof source !== "string") {
            throw new TypeError("invalid text content!");
        }

        // Is nearly equal processing speed?
        const replacer = is_multi_t? new replace.ReplaceFrontEnd(source): REPLACER.setSubject(source);
        /**
         * 
         */
        source = replacer.apply();
        /* remove whitespaces. /^[\s]+$|[\r\n]+$|^[\r\n](?=\S)/gm */
        // NOTE: this combination does not do the intended work...
        // return rm_blank_line_n_ws? source.replace(/^[\s]+$|[\r\n]+$|^[\r\n]/gm, ""): source;
        // return rm_blank_line_n_ws? source.replace(/^[\s]+$|[\r\n]+$|^[\r\n]|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm, _rwq): source;

        // NOTE: these are good.
        // DONE: fix: cannot keep blank line at es6 template string.
        return rm_blank_line_n_ws? source
            .replace(re_blank, _rwq)
            .replace(re_crlf_end, _rwq)
            .replace(re_crlf_start, _rwq): source;
    }, {
        // create readonly property "isKeep"
        isKeep: {
            get: (): boolean => is_keep,
            enumerable: true,
            configurable: false,
        },
        // create readonly property "version"
        version: {
            get: (): string => latest_version,
            enumerable: true,
            configurable: false,
        },
        "keepMoreBlankLine": {
            enumerable: true,
            configurable: false,
            writable: false,
            value: keepMoreBlankLine
        }
    }
) as IRemoveCStyleCommentsTypeSig;

// default: maintain blank line in back quote.
keepMoreBlankLine(false);

// module.exports = removeCStyleComments;
// module.exports.version = latest_version;
// module.exports.keepMoreBlankLine = keepMoreBlankLine;
// module.exports.isKeep = false;

// NOTE: export default
// removeCStyleComments.version = latest_version;
// removeCStyleComments.keepMoreBlankLine = keepMoreBlankLine;
// export default removeCStyleComments;
