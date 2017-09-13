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

/** class ReplaceFrontEnd */
import * as replace from "./replace";
/** buildWsQsReRegexp, RE_NEWLINEs */
import * as reutil from "./reutil";

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
 * singleton instance.
 */
const REPLACER: IReplaceFrontEnd = replace.getFrondEnd();

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
        const re_ws_qs_re = reutil.buildWsQsReRegexp(source);
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
