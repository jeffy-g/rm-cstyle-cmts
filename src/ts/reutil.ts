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

// // regexp document: "remove white spaces with replacer#comments removed"
// this regex cannot be processed correctly.
// /^[\s]+[\r\n]+|[\s]+$|^[\s]+$|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimsuy]+\b|)(?![?*+/])/gm

// BUG: When a newline character is CRLF, regexp instance specifying multiline flag can not correctly supplement CRLF with ^ and $
/*
 o It was necessary to do this when the newline character of inupt is CRLF.
    /\r\n\s+(?=\r\n)|\s+(?=\r\n)|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimsuy]+\b|)(?![?*+/])/g;

 o This looks good, but it does not work.
    /(?:\r\n|\r|\n)\s+(?=(?:\r\n|\r|\n))|\s+(?=(?:\r\n|\r|\n))/g
*/

/**
 * global flag for regexp.lastIndex.  
 * rewrite the lastIndex and execute it only once.
 * 
 * `regex summary:`
 * 
 * ```perl
\/                   # regexp literal start@delimiter
  (?![?*+\/])        # not meta character "?*+/" @anchor
  (?:                # start non-capturing group $1
    \\[\s\S]|        # escaped any character, or
    \[               # class set start
      (?:            # non-capturing group $2
        \\[\s\S]|    # escaped any character, or
        [^\]\r\n\\]  # without class set end, newline, backslash
      )*             # end non-capturing group $2 (q: 0 or more
    \]|              # class set end, or
    [^\/\r\n\\]      # without slash, newline, backslash
  )+                 # end non-capturing group $1 (q: 1 or more
\/                   # regexp literal end@delimiter
(?:                  # start non-capturing group $3
  [gimsuy]+\b|       # validate regex flags, but this pattern is imcomplete
)                    # end non-capturing group $3
(?![?*+\/\[\\])      # not meta character [?*+/[\] @anchor ...
```
 */
// NOTE: regexp document -> ***match regexp literal@mini#nocapture
// const RE_REGEXP_PATTERN = /\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimsuy]+\b|)(?![?*+\/\[\\])/g;

/**
 * ---
 * base
 * ---
 * see: https://regexper.com/#%60%28%3F%3A%5C%5C%5B%5Cs%5CS%5D%7C%5B%5E%60%5D%29*%60%7C%22%28%3F%3A%5C%5C%5B%5Cs%5CS%5D%7C%5B%5E%22%5D%29*%22%7C'%28%3F%3A%5C%5C%5B%5Cs%5CS%5D%7C%5B%5E'%5D%29*'%7C%5C%2F%28%3F!%5B%3F*%2B%5C%2F%5D%29%28%3F%3A%5C%5C%5B%5Cs%5CS%5D%7C%5C%5B%28%3F%3A%5C%5C%5B%5Cs%5CS%5D%7C%5B%5E%5C%5D%5Cr%5Cn%5C%5C%5D%29*%5C%5D%7C%5B%5E%5C%2F%5Cr%5Cn%5C%5C%5D%29%2B%5C%2F%28%3F%3A%5Bgimuy%5D%2B%5Cb%7C%29%28%3F!%5B%3F*%2B%5C%2F%5C%5B%5C%5C%5D%29
 */
const re_ws_qs_base: RegExp =
    /`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimsuy]+\b|)(?![?*+\/\[\\])/;


namespace ReUtil {
    export const RE_NEWLINEs = /\r\n|\n|\r/;
    const buildWsQsReRegexp = (source: string, holder: { m: RegExpExecArray | null }) => {
        // specify new line character.
        const m = RE_NEWLINEs.exec(source);
        const is_single_line_input = m === null;
        // 
        holder.m = m;

        /**
         * will not use "newline" when is_single_line_input is true
         */
        let newline: string | undefined;
        if (!is_single_line_input) {
            // escape CR or LF
            // @ts-ignore in this case m is not null
            newline = (newline = m[0]) === "\r\n"? "\\r\\n": newline === "\n"? "\\n": "\\r";
        }

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
\/(?![?*+/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimsuy]+\b|)(?![?*+/[\\]) # regex
```
         */
        // DEVNOTE: If there is no newline character, only the leading and trailing space characters are detected
        const re_ws_qs = is_single_line_input? /^\s+|\s+$/g: new RegExp(`${newline}\\s+(?=${newline})|\\s+(?=${newline})|${re_ws_qs_base.source}`, "g");

        /**
         * If do not specify a multiline flag,  
         * noticed that it matches the very first and last in the string ...
         * 
         * `regex summary:`
         * 
         * ```perl
^newline| # first new line
newline$  # last new line
```
         */
        const re_first_n_last = is_single_line_input? "": new RegExp(`^${newline}|${newline}$`, "g");
        return {
            /**
             * jsdoc
             */
            re_ws_qs,
            /**
             * jsdoc
             */
            re_first_n_last
        };
    }

    /**
     * null(0), \r(10), \n(13), \r\n(23)
     * 
     * @param m 
     */
    const convertToIndex = (m: RegExpExecArray | null) => {
        if (m !== null) {
            let newline: string;
            const index = (newline = m[0]).charCodeAt(0);
            // \r(10), \n(13), \r\n(23)
            return newline.length === 1? index: index + newline.charCodeAt(1);
        } else {
            return 0;
        }
    };

    type RegexSet = ReturnType<typeof buildWsQsReRegexp>;
    const regexSets: RegexSet[] = []; {
        const newlines = ["", "\r", "\n", "\r\n"];
        const holder: Parameters<typeof buildWsQsReRegexp>[1] = { m: null };
        for (const newline of newlines) {
            const rset = buildWsQsReRegexp(newline, holder);
            regexSets[
                convertToIndex(holder.m)
            ] = rset;
        }
    }

    /**
     * 
     * @param source 
     */
    export const lookupRegexes = (source: string) => {
        // const m = RE_NEWLINEs.exec("\r\n");
        // console.log(m[0].charCodeAt(0), m[0].charCodeAt(1));
        const m = RE_NEWLINEs.exec(source);
        return regexSets[
            convertToIndex(m)
        ];
    };
}

export = ReUtil;
