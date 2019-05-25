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

/**
 * 
 */
let re_ws_qs_base: RegExp; {
    // DEVNOTE: The suffix "*" indicates the priority.
    const re_backquoted = /`(?:\\[\s\S]|[^`])*`/; // ***
    const re_dbquoted = /"(?:\\[\s\S]|[^"])*"/; // **
    const re_singlequoted = /'(?:\\[\s\S]|[^'])*'/; // **
    re_ws_qs_base = new RegExp(`${re_backquoted.source}|${re_dbquoted.source}|${re_singlequoted.source}|\/`);
}

type KnownNewLines = "\r" | "\n" | "\r\n";
const _detectNewLine = (source: string): KnownNewLines | null => {
    const length = source.length;
    let index = 0;
    while (index < length) {
        const ch = source[index++];
        if (ch === "\r") {
            return source[index] === "\n" ? "\r\n" : ch;
        } else if (ch === "\n") {
            return ch;
        }
    }
    return null;
};

/**
 * 
 * @param source 
 * @param holder 
 */
const buildWsQsReRegexp = (source: string, holder: { newline: KnownNewLines | null }) => {
    // specify new line character.
    let newline = _detectNewLine(source);
    const is_single_line_input = newline === null;
    // 
    holder.newline = newline;

    // let isCRLF: boolean | undefined;
    if (!is_single_line_input) {
        // escape CR or LF
        // @ts-ignore re-assign different type
        newline = newline === "\r\n" ? "\\r\\n" : newline === "\n" ? "\\n" : "\\r";
        // isCRLF = newline.length === 2;
    }

    // DEVNOTE: If there is no newline character, only the leading and trailing space characters are detected
    const re_ws_qs = is_single_line_input ? /^\s+|\s+$/g : new RegExp(`${newline}\\s+(?=${newline})|\\s+(?=${newline})|${re_ws_qs_base.source}`, "g");
    // \n\s+(?=\n)|\s+(?=\n)|...

    // DEVNOTE: "^" and "$" is consume a lot more cpu time.
    // let re_ws_qs: RegExp;
    // if (is_single_line_input) {
    //     re_ws_qs =  /^\s+|\s+$/g;
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
newline\s+(?=newline)| # whitespace line or ...
\s+(?=newline)|        # spaces ahead of new line
`(?:\\[\s\S]|[^`])*`|  # backquoted string
"(?:\\[\s\S]|[^"])*"|  # double quoted string
'(?:\\[\s\S]|[^'])*'|  # single quoted string
\/                     # ts reference tag, regex, jsx tag terminator
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
  ^newline| # first new line
  newline$  # last new line
  ```
        */
        re_first_n_last
    };
}

/**
 * CHANGES: 2019-5-23
 *  + This version uses the "RegExp Lookbehind Assertions" feature.  
 *    Therefore, the execution environment of node v8.10 or later is required.
 */
namespace ReUtil {

    /**
     * 
     */
    export const RE_NEWLINEs = /\r\n|\n|\r/;

    export const detectNewLine = _detectNewLine;

    /**
     * null(0), \r(13), \n(10), \r\n(23)
     * 
     * @param newline 
     */
    const convertToIndex = (newline: KnownNewLines | null) => {
        if (newline !== null) {
            const index = newline.charCodeAt(0);
            // \r(13), \n(10), \r\n(23)
            return newline.length === 1 ? index : index + newline.charCodeAt(1);
        } else {
            return 0;
        }
    };

    type RegexSet = ReturnType<typeof buildWsQsReRegexp>;
    const regexSets: RegexSet[] = []; {
        const newlines = ["", "\r", "\n", "\r\n"];
        const holder: Parameters<typeof buildWsQsReRegexp>[1] = { newline: null };
        for (const newline of newlines) {
            const rset = buildWsQsReRegexp(newline, holder);
            regexSets[
                convertToIndex(holder.newline)
            ] = rset;
        }
    }

    /**
     * 
     * @param source 
     */
    export const lookupRegexes = (source: string) => {
        const newline = _detectNewLine(source);
        const rset = regexSets[
            convertToIndex(newline)
        ];
        // DEVNOTE: fix: need reset lastIndex
        rset.re_ws_qs.lastIndex = 0;
        if (typeof rset.re_first_n_last !== "string") {
            rset.re_first_n_last.lastIndex = 0
        }
        return rset;
    };
}

export = ReUtil;
