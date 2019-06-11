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

// DEVNOTE: When a newline character is CRLF, regexp instance specifying multiline flag can not correctly supplement CRLF with ^ and $
/*
 o It was necessary to do this when the newline character of inupt is CRLF.
    /\r\n\s+(?=\r\n)|\s+(?=\r\n)|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimsuy]+\b|)(?![?*+/])/g;

 o This looks good, but it does not work.
    /(?:\r\n|\r|\n)\s+(?=(?:\r\n|\r|\n))|\s+(?=(?:\r\n|\r|\n))/g
*/

/*
- - -
DEVNOTE: 2019/05/07
- - -

  Since regex group set can be nested logically without restriction, it is difficult to express as regex.

  Generally, the level of nest is thought to be deep and 3 or 4 but
  If you try to detect it incorrectly, you will not find the nested regex literal.

  So we dare to avoid defining the regex group set here.
  *Because of that, false positives increase, but it decides on the idea of cpu cost and the trade off of the complicated code.

*/
// /**
//  * `regex summary:`
//  * 
//  * ```perl
// #
// # javascript regex literal
// #
// (?<![<\w\]])         # avoidance: jsx or tsx start tag, available on node v8.10
// \/                   # regexp literal start@delimiter
//   (?![?*+\/])        # not meta character "?*+/" @anchor
//   (?:                # start non-capturing group $1)
//     \\[\s\S]|        # escaped any character or)
//     \[               # class set start
//       (?:            # non-capturing group $3
//         \\[\s\S]|    # escaped any character or
//         [^\]\r\n\\]  # without class set end, newline, backslash
//       )*             # end non-capturing group $3, q:0 or more
//     \]|              # class set end, or
//     [^\/\r\n\\]      # characters without group set end, class set end, slash, newline, backslash
//   )+                 # end non-capturing group $1, q:1 or more
// \/                   # regexp literal end@delimiter
// (?:                  # start non-capturing group $4
//   [gimsuy]{1,6}\b|   # validate regex flags, but this pattern is imcomplete
// )                    # end non-capturing group $4
// (?![?*+\/\[\\])      # not meta character [?*+/[\] @anchor ...
// ```
//  * ---
//  * or
//  * 
//  * ---
//  * 
//  * ```perl
// (?<![<\w\]])         # avoidance: jsx or tsx start tag, available on node v8.10
// \/                   # regexp literal start@delimiter
//   (?![?*+\/])        # not meta character "?*+/" @anchor
//   (?:                # start non-capturing group $1
//     \[               # class set start
//       (?:            # non-capturing group $3
//         \\[\s\S]|    # escaped any character or
//         [^\]\r\n\\]  # without class set end, newline, backslash
//       )*             # end non-capturing group $3, q:0 or more
//     \]|              # class set end, or
//     \\[\s\S]|        # escaped any character or
//     [^\/\r\n\\]      # characters without group set end, class set end, slash, newline, backslash
//   )+                 # end non-capturing group $1, q:1 or more
// \/                   # regexp literal end@delimiter
// (?:                  # start non-capturing group $4
//   [gimsuy]{1,6}\b|   # validate regex flags, but this pattern is imcomplete
// )                    # end non-capturing group $4
// (?![?*+\/\[\\])      # not meta character [?*+/[\] @anchor ...
// ```
//  * ---
//  * base
//  * ---
//  * 
//  * useful graphical view, see: https://regexper.com/  
//  *  then input:
//  * ```js
// /`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimsuy]{1,6}\b|)(?![?*+\/\[\\])/

// // in some case, reduce evaluate step
// /`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+\/])(?:\[(?:\\[\s\S]|[^\]\r\n\\])*\]|\\[\s\S]|[^\/\r\n\\])+\/(?:[gimsuy]{1,6}\b|)(?![?*+\/\[\\])/
// ```
//  */
// let re_ws_qs_base: RegExp; {

//     // DEVNOTE: The suffix "*" indicates the priority.
//     const re_backquoted   = /`(?:\\[\s\S]|[^`])*`/; // ***
//     const re_dbquoted     = /"(?:\\[\s\S]|[^"])*"/; // **
//     const re_singlequoted = /'(?:\\[\s\S]|[^'])*'/; // **

//     // NOTE: using regexp document: "without group set detect - [loose]"
//     const RE_SOURCE = `
// (?<![<\\w\\]])            (?# avoidance: jsx or tsx start tag, available on node v8.10)
// \\/                       (?# regexp literal start@delimiter)
//   (?![?*+\\/])            (?# not meta character "?*+/" @anchor)
//   (?:                     (?# start non-capturing group $1)
//     \\[                   (?# class set start)
//       (?:                 (?# non-capturing group $2)
//         \\\\[\\s\\S]|     (?# escaped any character or)
//         [^\\]\\r\\n\\\\]  (?# without class set end, newline, backslash)
//       )*                  (?# end non-capturing group $2, q:0 or more)
//     \\]|                  (?# class set end, or)
//     \\\\[\\s\\S]|         (?# escaped any character or)
//     [^\\/\\r\\n\\\\]      (?# characters without slash, newline, backslash)
//   )+                      (?# end non-capturing group $1, q:1 or more)
// \\/                       (?# regexp literal end@delimiter)
// (?:                       (?# start non-capturing group $3)
//   [gimsuy]{1,6}\\b|       (?# validate regex flags, but this pattern is imcomplete)
// )                         (?# end non-capturing group $3)
// (?![?*+\\/\\[\\\\])       (?# not meta character [?*+/[\\] @anchor ...)
// `;
// // const RE_SOURCE = `\
// // (?<![<\\w\\]])                                   (?# avoidance: jsx or tsx start tag, available on node v8.10)
// // \\/                                              (?# regexp literal start@delimiter)
// //   (?![?*+\\/])                                   (?# not meta character "?*+/" @anchor)
// //   (?:                                            (?# start non-capturing group @1)
// //    \\(                                           (?# ➡️start group set)
// //     (?:                                          (?# start non-capturing group @2)
// //      \\\\[\\s\\S]|                               (?# escaped any character or)
// //      \\[(?:\\\\[\\s\\S]|[^\\]\\r\\n\\\\])*\\]|   (?# class set)
// //      \\(                                         (?# ➡️start group set)
// //       (?:                                        (?# start non-capturing group @3)
// //        \\\\[\\s\\S]|                             (?# escaped any character or)
// //        \\[(?:\\\\[\\s\\S]|[^\\]\\r\\n\\\\])*\\]| (?# class set)
// //        \\(                                       (?# ➡️ group set nests...)
// //         (?:                                      (?# start non-capturing group @4)
// //          \\((?:                                  (?# start non-capturing group @5)
// //           \\((?:[^\\r\\n]*)\\)|                  (?# ➡️ group set infinite)
// //           [^\\r\\n]*)
// //          \\)|                                    (?# ⬅️ end group set infinite)
// //          [^\\r\\n]*
// //         )
// //        \\)|                                      (?# ⬅️end gs nests...)
// //        [^)\\r\\n\\\\]|                           (?# without group set end, newline, backslash)
// //       )*                                         (?# end non-capturing group @2, q:0 or more)
// //      \\)|                                        (?# ⬅️group set end, or)
// //      [^)\\r\\n\\\\]                              (?# without gs end, nl, backslash)
// //     )*                                           (?# end non-capturing group @2, q:0 or more)
// //    \\)|                                          (?# ⬅️group set end, or)
// //    \\[                                           (?# ▶ class set start)
// //     (?:                                          (?# non-capturing group @3)
// //      \\\\[\\s\\S]|                               (?# escaped any character or)
// //      [^\\]\\r\\n\\\\]                            (?# without class set end, newline, backslash)
// //     )*                                           (?# end non-capturing group @3, q:0 or more)
// //    \\]|                                          (?# class set end, or)
// //    \\\\[\\s\\S]|                                 (?# escaped any character or)
// //    [^\\/)\\]\\r\\n\\\\]                          (?# characters without group set end, class set end, slash, newline, backslash)
// //   )+                                             (?# end non-capturing group @1, q:1 or more)
// // \\/                                              (?# regexp literal end@delimiter)
// // (?:                                              (?# start non-capturing group @4)
// //   [gimsuy]{1,6}\\b|                              (?# validate regex flags, but this pattern is imcomplete)
// // )                                                (?# end non-capturing group @4)
// // (?![?*+\\/\\[\\\\])                              (?# not meta character [?*+/[\\] @anchor ...)
// // `;

//     // regexp document: "use util.getRegexpSource stable version"
//     const re_literalSource = RE_SOURCE.replace(/\s*\(\?#.*\)\s*$|#\s.*$|\s+/gm, "");

//     // is available "RegExp Lookbehind Assertions"?
//     // DEVNOTE: 2019-5-4
//     // >node -p process.versions.v8
//     // see: http://kangax.github.io/compat-table/es2016plus/
//     //   -> node.js seems to be able to use "RegExp Lookbehind Assertions" from v 8.10
//     //
//     // *with this new regex feature, you can almost certainly delete blank lines with jsx and tsx sources.
//     // 
//     const re_RegexLiteral: RegExp = new RegExp(re_literalSource);

//     re_ws_qs_base = new RegExp(`${re_backquoted.source}|${re_dbquoted.source}|${re_singlequoted.source}|${re_RegexLiteral.source}`);
// }


namespace ReUtil {
    export type KnownNewLines = "\r" | "\n" | "\r\n";
    export type DetectedNewLines = KnownNewLines | "";
}

/**
 * DEVNOTE: 190531 - removed regex detection
 */
// let re_ws_qs_base: RegExp; {
//     // const re_bases = {
//     //     // "2.2.1"
//     //     1: [
//     //         /"(?:\\[\s\S]|[^"])*"/, /'(?:\\[\s\S]|[^'])*'/
//     //     ],
//     //     // v2.2.2: reduce regex back track (slightly
//     //     2: [
//     //         /"(?:[^\\"]|\\[\s\S])*"/, /'(?:[^\\']|\\[\s\S])*'/
//     //     ],
//     //     4: [
//     //         /"(?:[^\\"]+|\\[\s\S])*"/, /'(?:[^\\']+|\\[\s\S])*'/
//     //     ],
//     // };
//     // const re_quotes = re_bases[4];
//     // // DEVNOTE: 2019-6-11 - simplified back quoted strings detection regex (v2.2.3
//     // re_ws_qs_base = new RegExp(`\`|${re_quotes[0].source}|${re_quotes[1].source}|\/`);

//     re_ws_qs_base = /`|"(?:[^\\"]+|\\[\s\S])*"|'(?:[^\\']+|\\[\s\S])*'|\//;

//     // // DEVNOTE: The suffix "*" indicates the priority.
//     // const use_old = 0;
//     // const re_backquoted   = use_old? /`(?:\\[\s\S]|[^`])*`/: /`(?:[^\\`]|\\[\s\S])*`/; // ***
//     // const re_dbquoted     = use_old? /"(?:\\[\s\S]|[^"])*"/: /"(?:[^\\"]|\\[\s\S])*"/; // **
//     // const re_singlequoted = use_old? /'(?:\\[\s\S]|[^'])*'/: /'(?:[^\\']|\\[\s\S])*'/; // **
//     // re_ws_qs_base = new RegExp(`${re_backquoted.source}|${re_dbquoted.source}|${re_singlequoted.source}|\/`);
// }

// DEVNOTE: 2019-6-11 - v2.2.4
const re_ws_qs_base = /`|"(?:[^\\"]+|\\[\s\S])*"|'(?:[^\\']+|\\[\s\S])*'|\//;

// DEVNOTE: 2019-6-11
//  Although it may seem difficult to read at first glance,
//  it should improve processing efficiency by reducing unnecessary tests.
// 
//  We decided not to use it because the processing speed of regex above
//  was somewhat faster (about 1 sec) in however, "batch-rmc-test". (at node v12.4
// 
//  The probable cause is that this slightly
//  more complex regex requires some cost to create a RegExp object instance, 
//  as the current specification detects a newline character 
//  for each string inputs and builds a regex each time. maybe.
// const re_ws_qs_base = /`|"[^\\"]*(?:\\[\s\S][^\\"]*)*"|'[^\\']*(?:\\[\s\S][^\\']*)*'|\//;

// const _detectNewLine = (source: string): ReUtil.KnownNewLines | null => {
//     let length = source.length - 1;
//     let ch: string | undefined;
//     while (ch = source[length--]) {
//         if (ch === "\n") {
//             return source[length] === "\r" ? "\r\n" : ch;
//         } else if (ch === "\r") {
//             return ch;
//         }
//     }
//     return null;
// };

// 
// DEVNOTE: 2019-6-11 - because sourceMap may be at the end of file,
// detection from the end of the input string can be dis-advantageous. (v2.2.5
// 
const _detectNewLine = (source: string): ReUtil.KnownNewLines | null => {
    let index = 0;
    let ch: string | undefined;
    while (ch = source[index++]) {
        if (ch === "\r") {
            return source[index] === "\n" ? "\r\n" : ch;
        } else if (ch === "\n") {
            return ch;
        }
    }
    return null;
};
// const _detectNewLine = (source: string): ReUtil.KnownNewLines | null => {
//     const m = /\r\n|\n|\r/.exec(source);
//     return m? m[0] as ReUtil.KnownNewLines: null;
// };


/**
 * 
 * @param newline 
 */
const buildWsQsReRegexp = (newline: ReUtil.DetectedNewLines) => {

    const is_single_line_input = newline === "";

    if (!is_single_line_input) {
        // escape CR or LF
        // @ts-ignore re-assign different type
        newline = newline === "\r\n" ? "\\r\\n" : newline === "\n" ? "\\n" : "\\r";
    }

    // DEVNOTE: If there is no newline character, only the leading and trailing space characters are detected
    const re_ws_qs = is_single_line_input ? /^\s+|\s+$/g : new RegExp(`${newline}\\s+(?=${newline})|\\s+(?=${newline})|${re_ws_qs_base.source}`, "g");
    // \n\s+(?=\n)|\s+(?=\n)|...

    // DEVNOTE: "^" and "$" is consume a lot more cpu time.
    // let re_ws_qs: RegExp;
    // if (is_single_line_input) {
    //     re_ws_qs = /^\s+|\s+$/g;
    // } else {
    //     if (isCRLF) {
    //         re_ws_qs = new RegExp(`${newline}\\s+(?=${newline})|\\s+(?=${newline})|${re_ws_qs_base.source}`, "g");
    //     } else {
    //         re_ws_qs = new RegExp(`^\\s+(?=$)|\\s+(?=$)|${re_ws_qs_base.source}`, "gm");
    //     }
    // }

    const re_first_n_last = is_single_line_input ? "" : new RegExp(`^${newline}|${newline}$`, "g");

    return {
        /**
         * regex: whitespaces, quoted string, regexp literal.
         *
         * `regex summary:`
         *
         * ```perl
$newline\s+(?=$newline)| # whitespace line or ...
\s+(?=$newline)|         # spaces ahead of new line
`(?:\\[\s\S]|[^`])*`|    # backquoted string
"(?:\\[\s\S]|[^"])*"|    # double quoted string
'(?:\\[\s\S]|[^'])*'|    # single quoted string
\/                       # detection for ts reference tag, regex, jsx tag terminator
```
        */
        re_ws_qs,
        /**
         * If do not specify a multiline flag,  
         * noticed that it matches the very first and last in the string ...
         * 
         * `regex summary:`
         *
         ```perl
^$newline| # first new line
$newline$  # last new line
```
        */
        re_first_n_last
    };
};

/**
 * ~~CHANGES: 2019-5-23~~
 *  + ~~This version uses the "RegExp Lookbehind Assertions" feature.  
 *    Therefore, the execution environment of node v8.10 or later is required.~~
 *
 * CHANGES: 2019-5-29
 *  + Since the step2 implementation only by regex is very difficult,  
 *    regex for detecting regex literal has been removed and it has been made simple "/".
 *    The processing can be completed with the aid of the ICharacterScanner code.
 */
namespace ReUtil {
    /**
     * detect newline by script
     */
    export const detectNewLine = _detectNewLine;
    /**
     * lookup cached regexes by newline character 
     *
     * @param source 
     */
    export const lookupRegexes = buildWsQsReRegexp;
}

export = ReUtil;
