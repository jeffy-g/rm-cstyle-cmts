/*
-----------------------------------------------------------------------

Copyright 2017 motrohi hirotom1107@gmail.com

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

/** for detect newline. */
export const RE_NEWLINEs = /\r\n|\n|\r/;

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

/** base */
const re_ws_qs_base: RegExp =
    /`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+/])/;

/**
 * create regex by newline character of source.
 * @param source parsing source.
 */
export function buildWsQsReRegexp(source: string): RegExp {
    // specify new line character.
    const m = RE_NEWLINEs.exec(source);
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

