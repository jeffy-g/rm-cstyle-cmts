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
         */
        (source: string, rm_blank_line_n_ws?: boolean): string;
    }
    /**
     * remove c style comments interface.
     */
    interface IRemoveCStyleCommentsModule extends IRemoveCStyleCommentsTypeSig {
        /** package version */
        readonly version?: string;
    }
}

const pkg: IStringMap<string> = require("../package.json");
/** TODO: edit jsdoc */
const latest_version: string = pkg.version;

/**
 * singleton instance for synchronous use.
 */
const REPLACER: replace.ReplaceFrontEnd = new replace.ReplaceFrontEnd();

// // regexp document: "remove white spaces with replacer#comments removed"
// this regex cannot be processed correctly.
// /^[\s]+[\r\n]+|[\s]+$|^[\s]+$|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+/])/gm

// BUG: When a newline character is CRLF, regexp instance specifying multiline flag can not correctly supplement CRLF with ^ and $
/*
 o It was necessary to do this when the newline character of inupt is CRLF.
    /\r\n\s+(?=\r\n)|\s+(?=\r\n)|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+/])/g;

 o This looks good, but it does not work.
    /(?:\r\n|\r|\n)\s+(?=(?:\r\n|\r|\n))|\s+(?=(?:\r\n|\r|\n))/g
*/

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

const re_ws_qs_base: RegExp =
    /`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+/])/;
/**
 * create regex by newline character of source.
 * @param source parsing source.
 */
function buildWsQsReRegexp(source: string): RegExp {
    // specify new line character.
    const m = /\r\n|\n|\r/.exec(source);
    let newline = m? m[0]: "";
    if (newline === "") return null;

    // escape CR or LF
    newline = newline === "\r\n"? "\\r\\n": newline === "\n"? "\\n": "\\r";

    /**
     * regex: whitespaces, quoted string, regexp literal.
     *
     * `regex summary:`
     *
     * ```
     *  newline\s+(?=newline)| # whitespace line or ...
     *  \s+(?=newline)|        # spaces ahead of new line
     *  `(?:\\[\s\S]|[^`])*`|  # back quote
     *  "(?:\\[\s\S]|[^"])*"|  # double quote
     *  '(?:\\[\s\S]|[^'])*'|  # single quote
     *  \/(?![?*+/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+/]) # regex
     *
     *```
    */
    return new RegExp(`${newline}\\s+(?=${newline})|\\s+(?=${newline})|${re_ws_qs_base.source}`, "g");

    // /^newline|newline$/g;
    /**
     * If do not specify a multiline flag,  
     * noticed that it matches the very first and last in the string ...
     * 
     * `regex summary:`
     * 
     * ```
     * ^newline| # first new line
     * newline$  # last new line
     * ```
     */
    // const re_first_n_last = new RegExp(`^${newline}|${newline}$`, "g"); NG
    // const re_first_n_last = new RegExp(`^(${newline})+|(${newline})+$`, "g"); OK
    // return {
    //     re_ws_qs, re_first_n_last
    // };
}

const removeCStyleComments: IRemoveCStyleCommentsModule = (source: string, rm_blank_line_n_ws = true): string => {

    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }

    // Is nearly equal processing speed?
    // const replacer = is_multi_t? new replace.ReplaceFrontEnd(source): REPLACER.setSubject(source);
    source = REPLACER.apply(source);

    // NOTE: this combination does not do the intended work...
    // return rm_blank_line_n_ws? source.replace(/^[\s]+$|[\r\n]+$|^[\r\n]/gm, ""): source;
    // return rm_blank_line_n_ws? source.replace(/^[\s]+$|[\r\n]+$|^[\r\n]|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm, _rwq): source;

    /* remove whitespaces.*/
    if (rm_blank_line_n_ws) {
        const re_ws_qs_re = buildWsQsReRegexp(source);
        if (re_ws_qs_re === null) return source;
        return source.replace(
            // BUG: 2017/9/6 23:52:13 #cannot keep blank line at nested es6 template string. `rm_blank_line_n_ws` flag is `true`
            // FIXED:? 2017/9/6 22:00:10 #cannot beyond regex.
            re_ws_qs_re, (all, index: number, inputs: string) => {
                const first = all[0];
                return (first === "`" || first === "/" || first === "'" || first === '"')? all: "";
        })
        // FIXED: In some cases, a newline character remains at the beginning or the end of the file. (rm_blank_line_n_ws=true, at src/ts/index.ts
        // NOTE: this regex seems to be the correct answer...
        .replace(/^\s+|\s+$/g, "");
    }
    return source;
};

/* removeCStyleComments = */ Object.defineProperties(removeCStyleComments, {
        // create readonly property "version"
        version: {
            get: (): string => latest_version,
            enumerable: true,
            configurable: false,
        }
    }
);

export = removeCStyleComments;
// module.exports = removeCStyleComments;
// module.exports.version = latest_version;

// NOTE: export default
// removeCStyleComments.version = latest_version;
// removeCStyleComments.keepMoreBlankLine = keepMoreBlankLine;
// export default removeCStyleComments;
