/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2017 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/

export type TKnownNewLines = "\r" | "\n" | "\r\n";
export type TDetectedNewLines = TKnownNewLines | "";
/**
 * @typedef {"\r" | "\n" | "\r\n"} TKnownNewLines
 * @typedef {TKnownNewLines | ""} TDetectedNewLines
 */

/**
 * @param {string} src 
 */
export const detectNewLine = (src: string): TDetectedNewLines => {
    let index = 0, ch: string;
    while (ch = src[index++]) {
        if (ch === "\n") {
            return "\n";
        } else if (ch === "\r") {
            return src[index] === "\n" ? "\r\n" : "\r";
        }
    }
    /*/
    for (let i = 0, ch: string; i < src.length;) {
        if ((ch = src[i++]) === "\n") {
            return "\n";
        } else if (ch === "\r") {
            return src[i] === "\n" ? "\r\n" : "\r";
        }
    }
    //*/
    return "";
};

const reF = /^\s+/;
/**
 * lookup regexes by newline character 
 *
 * @param {"" | "\r" | "\n" | "\r\n"} nl MUST be "" or "\r" or "\n" or "\r\n"
 */
export const lookupRegexes = (nl: TDetectedNewLines) => {
    return {
        /**
         * regex: whitespaces, quoted string, regexp literal
         * 
         *   + If there is no newline character, only the leading and trailing space characters are detected
         *
         * `regex summary:`
         *
         * ```perl
         * $newline\s+(?=$newline)| # whitespace line or ...
         * \s+(?=$newline)|         # spaces ahead of new line
         * `(?:\\[\s\S]|[^`])*`|    # backquoted string
         * "(?:\\[\s\S]|[^"])*"|    # double quoted string
         * '(?:\\[\s\S]|[^'])*'|    # single quoted string
         * \/                       # detection for ts reference tag, regex, jsx tag terminator
         * ```
         */
        // reduce memory usage (maybe slightly
        /* eslint-disable indent */
        wsqs: nl === "\n" ? /\n\s+(?=\n)|\s+(?=\n)|`|"(?:[^\\"]+|\\[^])*"|'(?:[^\\']+|\\[^])*'|\//g: // lgtm[js/redos]
            nl === "\r\n" ? /\r\n\s+(?=\r\n)|\s+(?=\r\n)|`|"(?:[^\\"]+|\\[^])*"|'(?:[^\\']+|\\[^])*'|\//g: // lgtm[js/redos]
            nl === "\r" ? /\r\s+(?=\r)|\s+(?=\r)|`|"(?:[^\\"]+|\\[^])*"|'(?:[^\\']+|\\[^])*'|\//g: // lgtm[js/redos]
            /^\s+|\s+$/g,

        /**
         * create regex for remove first newline from each newline character
         *
         * `regex summary:`
         *
         * ```js
         * /^\s+/ // first new line
         * ```
         */
        // DEVNOTE: 2020/4/16 - can apply `/^\s+|\s+$/g` to everything but performance will be slower
        first: nl ? reF: ""
        /* eslint-enable indent */
    };
};

/**
 * return type of `detectRegex`
 * 
 * @date 2020/5/7
 * @see {@link detectRegex}
 */
export type TRegexDetectResult = {
    body: string;
    lastIndex: number;
};
/**
 * @typedef TRegexDetectResult
 * @prop {string} body
 * @prop {number} lastIndex
 */

/**
 * verifies that the regex immediately follows the delimiter "/" with a valid character
 * @date 2020/5/7
 * ```js
 * // NOTE: "*" and "/" not consider because already check it on call side
 * /^\/(?![?+])/
 * ```
 */
const reValidFirst = /^\/(?![?+])/;

/**
 * if `true`, regex is invalid
 * 
 * ```js
 * // must use with /^([gimsuy]{1,6})?(?:\s*(?:;|,|\.|]|\)|\s))?/g
 * /[^gimsuy\d?*+\/\\]/.test(flagsPartAfter);
 * ```
 * @date 2020/5/7
 */
// TODO: 2020/5/26 11:16:15 - need review because maybe this regex is incomplete
const reFlagsPartAfter = /[^gimsuyd\d?*+\/\\]/;

const reLFCR = /[\n\r]/;

/**
 * detect regex body and flag part
 * 
 * + perform verification of regex literal.
 * 
 * NOTE:
 *  + here is only validate the placement of "(" and ")" briefly.  
 *  **this will be avoid the costly "eval" quite a number of times**.
 * 
 * @param {string} line MUST starts with "/" string
 * @returns {TRegexDetectResult | null}
 */
export const detectRegex = (line: string): TBC<TRegexDetectResult> => {

    if (!reValidFirst.test(line) || reLFCR.test(line)) return null;

    let groupIndex = 0,
        inEscape = false,
        inClass = 0;

    const end = line.length;
    /** @type {string | undefined} */
    let reBody: string | undefined;
    let i = 1;
    // always starts offset is "one" because line[0] is supposed to be "/"
    for (; i < end;) {
        const ch = line[i++];

        // if (ch === "\n" || ch === "\r") return null;

        if (ch === "\\") {
            inEscape = !inEscape;
        } else if (!inEscape) {

            if (ch === "/" && !inClass) {
                if (groupIndex) return null;
                reBody = line.substring(0, i);
                break;
            }

            if (ch === "(") {
                !inClass && groupIndex++;
            } else if (ch === ")") {
                !inClass && groupIndex--;
            } else if (ch === "[") {
                // DEVNOTE: ignore "in class" state because escape of "[" is not required
                inClass = 1;
            } else if (ch === "]") {
                // DEVNOTE: **In the regex implementation of ecma script, "[" and "]" do not necessarily need escape ("\[", "\]".
                // e.g - const re = /][\d]*/; // OK
                // However, such a regex source is rare, so I think it makes sense to validate "in class" state.
                inClass = 0;
            } else if (
                groupIndex < 0 ||
                // number (increment|decrement), calcrate exponentiation by "**"
                // "++" is implemented in other scripting languages (e.g - PCRE (php) 
                ((ch === "+" || ch === "*") && line[i] === ch)
            ) {
                return null;
            }

        } else {
            inEscape = false;
        }
    }

    if (reBody) {
        const re = /^([gimsuyd]{1,7})?(?:\s*(?:;|,|\.|]|\)|\s))?/g;
        const maybeFlagPart = line.substring(i);
        const m = re.exec(maybeFlagPart)!;
        if (re.lastIndex === 0 && reFlagsPartAfter.test(maybeFlagPart)) {
            return null;
        }
        const flags = m[1] || "";
        return {
            body: reBody + flags,
            lastIndex: i + flags.length
        };
    }

    return null;
};
