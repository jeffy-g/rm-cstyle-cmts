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

import * as visitors from "./replace";


// NOTE: regex source for readability.
// regexp document: "remove C style comments. ++4-3-1"
// const RE_SOURCE = `
// (\\s*\\/\\*[\\s\\S]*?(.*)\\*\\/(?:\\s*$|\\s*))| (?# /* */ style block comment)
// (\\s*\\/\\/.*\\s*$)|                            (?# // style line comment)
// (^[\\s]$)|                                      (?# empty lines)
// (^[\\n])
// `;

// (?:\\s*\\/\\*[\\s\\S]*?.*\\*\\/(?:\\s*$|\\s*))| (?# /* */ style block comment)
const RE_SOURCE = `
(?:\\s*\\/\\/.*\\s*$)|                          (?# // style block comment)
(?:^[\\s]$)|                                    (?# empty lines)
(?:^[\\n])
`;

// NOTE: remove unnecessaries.
const RE_C_STYLE_COMMENT = new RegExp(RE_SOURCE.replace(/\s*\(\?#.*\)\s*$|#\s.*$|\s+/gm, ""), "gm");
// NOTE: use regexp document: "remove C style comments."
// /(\s*\/\*[\s\S]*?(.*)\*\/\s*$)|(\s*\/\/.*\s*$)|(^[\s]$)|(^[\n])|([\n]$)/gm;

// single, double, backquote
const SQ = 1;
const DQ = 2;
const BQ = 4;
const IN_QUOTE = SQ | DQ | BQ;
// in \ ?
const ESCAPE = 8;

function inQuote(state: number): boolean {
    return (state & IN_QUOTE) !== 0;
}
function inSQ(state: number): boolean {
    return (state & SQ) !== 0;
}
function inDQ(state: number): boolean {
    return (state & DQ) !== 0;
}
function inBQ(state: number): boolean {
    return (state & BQ) !== 0;
}
function outQuote(state: number): boolean {
    return (state & IN_QUOTE) === 0;
}

function inEscape(state: number): boolean {
    return (state & ESCAPE) !== 0;
}


/**
 * remove c style comments form "source" content.  
 * 
 * step 1: remove line comments, multi line comments.  
 * and skip regexp statement.  
 * .  
 * step 2: remove whitespaces.
 * ```
 * // regexp
 * `
 * ^[\s]+$|  (?# empty lines)
 * [\r\n]+$
 * `
 * ```
 * @param {string} source c style commented text source.
 * @param {boolean} is_multi_process_use multi thread like?
 */
function removeCStyleComments(source: string, is_multi_process_use: boolean = false): string {

    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }

    // const re = !is_multi_process_use ? RE_C_STYLE_COMMENT: new RegExp(RE_C_STYLE_COMMENT.source, "gm");

    // let m: RegExpExecArray;
    // while (m = re.exec(source)) {
    //     let left = source.substring(0, m.index);
    //     let right = source.substring(m.index + m[0].length);
    //     source = left + right;
    //     re.lastIndex = m.index;
    // }

    // let state = 0; // state bits.
    // let index = 0, limit = source.length;
    // let result = "";
    // let ch: string;
    // while (index < limit) {
    //     switch ((ch = source[index])) {
    //         case "'":
    //         case '"':
    //         case "`": {
    //             if (!inEscape(state)) {
    //                 // enter quote
    //                 state ^= ch === "'" ? SQ : ch === '"' ? DQ :
    //                         ch === "`" ? BQ : void 0;
    //             }
    //             break;
    //         }
    //         // single or multi line start
    //         case "/": {
    //             if (!inQuote(state)) {

    //             }
    //             break;
    //         }
    //         case "\\": // toggle escape.
    //             state ^= ESCAPE;
    //             break;

    //     }
    //     index++;
    //     result += ch;
    // }

    /**
     * 
     */
    const replacer = new visitors.ReplaceFrontEnd(source);
    // remove whitespaces.
    // source = source.replace(/^[\s]+$|[\r\n]+$/gm, "");
    return replacer.apply().replace(/^[\s]+$|[\r\n]+$/gm, "");
}

module.exports = removeCStyleComments;
