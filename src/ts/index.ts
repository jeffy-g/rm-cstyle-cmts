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
         * @deprecated since v1.3.8
         */
        keepMoreBlankLine?(is: boolean): void;

        /**
         * current keepMoreBlankLine state.
         * @deprecated since v1.3.8
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
const latest_version = "v1.3.8"; //pkg.version;
/**
 * singleton instance for synchronous use.
 */
const REPLACER = new replace.ReplaceFrontEnd("");

/**
 * state of "keep more blank line"
 * @deprecated since v1.3.8
 */
let is_keep = true;
/**
 * maintain blank lines in ["] or [']. (if need
 * @param is ...
 * @deprecated since v1.3.8
 */
function keepMoreBlankLine(is: boolean): void {
    is_keep = is;
}

// /**  */
// let _rwq: StringReplacer;

// replace without quoted.
/**
 * `regex summary:`
 * 
 * - capture version:
 * 
 * ```
 * ^([\s]+[\r\n]+)|       # headspaces@capture
 * ([\s]+[\r\n]+)|        # spaces@capture
 * ^([\s]+)$|             # spaces2@capture
 * `(?:\\[\s\S]|[^`])*`|  # back quote
 * "(?:\\[\s\S]|[^"])*"|  # double quote
 * '(?:\\[\s\S]|[^'])*'|  # single quote
 * \/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/]) # regex
 * ```
 * 
 * - none capture version:
 * 
 * ```
 * ^[\s]+[\r\n]+|       # headspaces
 * ([\s]+[\r\n]+)|      # spaces@capture
 * ^[\s]+$|             # spaces2
 * `(?:\\[\s\S]|[^`])*`|  # back quote
 * "(?:\\[\s\S]|[^"])*"|  # double quote
 * '(?:\\[\s\S]|[^'])*'|  # single quote
 * \/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/]) # regex
 * 
 *```
 */
const re_blank: RegExp =
// /^([\s]+[\r\n]+)|([\s]+[\r\n]+)|^([\s]+)$|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/])/gm;
/^[\s]+[\r\n]+|([\s]+[\r\n]+)|^[\s]+$|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/])/gm;


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
            let NEW_LINE: string;
            // specify new line character.
            const m = /[\r\n]{1,2}/.exec(source);
            if (m !== null) {
                const crlf = m[0];
                NEW_LINE = /\r\n/.test(crlf)? "\r\n": crlf[0];
            } else NEW_LINE =  "";

            return source.replace(
                // BUG: 2017/9/6 20:23:40 #cannot beyond regex and cannot remove last new line char.
                // FIXED:? 2017/9/6 22:00:10 #cannot beyond regex.
                re_blank,
                (all, spaces: string, index: number, inputs: string) => {
                    if (spaces) {
                        return NEW_LINE;
                        // return index === inputs.length - NEW_LINE.length? "": NEW_LINE;
                    }
                    const first = all[0];
                    return (first === "`" || first === '"' || first === "'" || first === "/")? all: "";
                });
        }
        return source;
    }, {
        // create readonly property "isKeep"
        // NOTE: v.1.3.8 currently ignore this property value.
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
// NOTE: v.1.3.8 currently ignore this function.
// keepMoreBlankLine(true);

// module.exports = removeCStyleComments;
// module.exports.version = latest_version;
// module.exports.keepMoreBlankLine = keepMoreBlankLine;
// module.exports.isKeep = false;

// NOTE: export default
// removeCStyleComments.version = latest_version;
// removeCStyleComments.keepMoreBlankLine = keepMoreBlankLine;
// export default removeCStyleComments;
