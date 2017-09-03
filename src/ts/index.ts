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
import * as replace from "./replace";

// for String.replace
declare type StringReplacer = (matchBody: string, ...args: (string | number)[]) => string;
declare interface IRemoveCStyleCommentsTypeSig {
    (a: string, b?: boolean, c?: boolean): string;
    setVersion(v: string): void;
    version: string;
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

const latest_version = "v1.2.4";
/**
 * singleton instance for single process use.
 */
const REPLACER = new replace.ReplaceFrontEnd("");

/**  */
let _rwq: StringReplacer;
// replace without quoted.
let re_blank: RegExp;
let re_crlf_end: RegExp;
let re_crlf_start: RegExp;

/**
 * change use version.
 * @param v specify version tag
 */
function setVersion(v: string): void {
    switch(v) {
        case "v1.2.3":
            _rwq = (all, bq: string, dq: string, sq: string, index: number) => {
                return (bq || dq || sq)? all: "";
            };
            re_blank = /^[\s]+$|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
            re_crlf_end = /[\r\n]+$|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
            re_crlf_start = /^[\r\n]|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
            break;
        case "v1.2.4":
            _rwq = (all, bq: string, index: number) => {
                return bq? all: "";
            };
            re_blank = /^[\s]+$|(`(?:\\[\s\S]|[^`])*`)/gm;
            re_crlf_end = /[\r\n]+$|(`(?:\\[\s\S]|[^`])*`)/gm;
            re_crlf_start = /^[\r\n]|(`(?:\\[\s\S]|[^`])*`)/gm;
            break;
    }
    module.exports.version = v;
}


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
function removeCStyleComments(source: string, rm_blank_line_n_ws: boolean = true, is_multi_t: boolean = false): string {
// const removeCStyleComments: IRemoveCStyleCommentsTypeSig = (source, rm_blank_line_n_ws = true, is_multi_t = false): string => {

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
};

setVersion(latest_version);
module.exports = removeCStyleComments;
module.exports.setVersion = setVersion;
module.exports.version = latest_version;

// const version = "v1.2.4";
// module.exports = {
//     version,
//     snipe: removeCStyleComments
// };

