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

        /** package version */
        readonly version: string;
    }
    // for String.replace
    type StringReplacer = (matchBody: string, ...args: (string | number)[]) => string;
}

/**  */
// const pkg = JSON.parse(     
//     fs.readFileSync("./package.json", 'utf-8')
// );
/** TODO: edit jsdoc */
const latest_version = "v1.4.3"; //pkg.version;

/**
 * singleton instance for synchronous use.
 */
const REPLACER = new replace.ReplaceFrontEnd("");

/**
 * regex: whitespaces, quoted string, regexp literal
 * 
 * `regex summary:`
 * 
 * - none capture version:
 * 
 * ```
 *  ^[\s]+[\r\n]+|        # headspaces
 *  [\s]+$|               # spaces
 *  ^[\s]+$|              # whitespace line
 *  `(?:\\[\s\S]|[^`])*`| # back quote
 *  "(?:\\[\s\S]|[^"])*"| # double quote
 *  '(?:\\[\s\S]|[^'])*'| # single quote
 *  \/(?![?*+/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+/]) # regex
 * 
 *```
 */
const re_ws_qs_re: RegExp =
/^[\s]+[\r\n]+|[\s]+$|^[\s]+$|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+/])/gm;

/**
 * If do not specify a multiline flag,  
 * noticed that it matches the very first and last in the string ...
 * 
 * `regex summary:`
 * 
 * ```
 * ^[\r\n]| # first new line
 * [\r\n]$  # last new line
 * ```
 */
const re_first_n_last_newline = /^[\r\n]|[\r\n]$/g;

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
// Same as module.exports
// declare var exports: any;

const removeCStyleComments = Object.defineProperties(
    (source: string, rm_blank_line_n_ws = true, is_multi_t = false): string => {

        if (typeof source !== "string") {
            throw new TypeError("invalid text content!");
        }

        // Is nearly equal processing speed?
        const replacer = is_multi_t? new replace.ReplaceFrontEnd(source): REPLACER.setSubject(source);
        source = replacer.apply();

        // NOTE: this combination does not do the intended work...
        // return rm_blank_line_n_ws? source.replace(/^[\s]+$|[\r\n]+$|^[\r\n]/gm, ""): source;
        // return rm_blank_line_n_ws? source.replace(/^[\s]+$|[\r\n]+$|^[\r\n]|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm, _rwq): source;

        /* remove whitespaces.*/
        if (rm_blank_line_n_ws) {
            return source.replace(
                // BUG: 2017/9/6 20:23:40 #cannot remove last new line char.
                // BUG: 2017/9/6 23:52:13 #cannot keep blank line at nested es6 template string. `rm_blank_line_n_ws` flag is `true`
                // FIXED:? 2017/9/6 22:00:10 #cannot beyond regex.
                re_ws_qs_re, (all, index: number, inputs: string) => {
                    const first = all[0];
                    return (first === "`" || first === "/" || first === "'" || first === '"')? all: "";
            })
            // FIXED: In some cases, a newline character remains at the beginning or the end of the file. (rm_blank_line_n_ws=true, at src/ts/index.ts
            .replace(re_first_n_last_newline, "");

        }
        return source;
    }, {
        // create readonly property "version"
        version: {
            get: (): string => latest_version,
            enumerable: true,
            configurable: false,
        }
    }
) as IRemoveCStyleCommentsTypeSig;

export = removeCStyleComments;
// module.exports = removeCStyleComments;
// module.exports.version = latest_version;
// module.exports.keepMoreBlankLine = keepMoreBlankLine;
// module.exports.isKeep = false;

// NOTE: export default
// removeCStyleComments.version = latest_version;
// removeCStyleComments.keepMoreBlankLine = keepMoreBlankLine;
// export default removeCStyleComments;
