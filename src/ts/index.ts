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

/** IReplaceFrontEnd */
import * as replace from "./replace";
// import { IReplaceFrontEnd } from "./replace";

/** buildWsQsReRegexp, RE_NEWLINEs */
import * as reutil from "./reutil";

/** TODO: edit jsdoc */
const latest_version: string = "pkg.version";

/**
 * singleton instance.
 */
const Replacer = replace.getFrondEnd();
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

const removeCStyleComments: IRemoveCStyleComments = (
    source: string,
    rm_blank_line_n_ws: boolean = true,
    report_regex_evaluate_error?: boolean
): string => {

    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }

    if (typeof report_regex_evaluate_error === "boolean") {
        Replacer.regexErrorReportEnable(report_regex_evaluate_error);
    }
    // Is nearly equal processing speed?
    // const replacer = is_multi_t? new replace.ReplaceFrontEnd(source): REPLACER.setSubject(source);
    source = Replacer.apply(source);

    if (!rm_blank_line_n_ws) {
        return source;
    }

    const regexes = reutil.lookupRegexes(source);
    // NOTE: this combination does not do the intended work...
    // return rm_blank_line_n_ws? source.replace(/^\s+$|[\r\n]+$|^[\r\n]/gm, ""): source;
    // return rm_blank_line_n_ws? source.replace(/^\s+$|[\r\n]+$|^[\r\n]|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm, _rwq): source;
    /* remove whitespaces.*/
    return source.replace(
        // BUG: 2017/9/6 23:52:13 #cannot keep blank line at nested es6 template string. `rm_blank_line_n_ws` flag is `true`
        // FIXED:? 2017/9/6 22:00:10 #cannot beyond regex.
        regexes.re_ws_qs, ws_qs_replacer).replace(regexes.re_first_n_last, "");
    // .replace(/^\s+|\s+$/g, ""); // can handle it reliably, but consume a lot more cpu time a little.
};

/* removeCStyleComments = */ Object.defineProperties(removeCStyleComments, {
        // create readonly property "version"
        version: {
            value: latest_version,
            enumerable: true,
            configurable: false,
            writable: false
        }
    }
);

export = removeCStyleComments;
