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
 * Detects the newline character used in a given string.
 * @param {string} src 
 * @returns {TDetectedNewLines}
 */
export const detectNewLine = (src: string): TDetectedNewLines => {
    let index = 0, ch: TBD<string>;
    while (ch = src[index++]) {
        if (ch === "\n") {
            return "\n";
        } else if (ch === "\r") {
            return src[index] === "\n" ? "\r\n" : "\r";
        }
    }
    return "";
};

const reF = /^\s+/;
/**
 * Lookup regexes by newline character.
 * @param {TDetectedNewLines} nl 
 * @returns {object}
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

        wsqs: nl === "\n" ? /\n\s+(?=\n)|\s+(?=\n)|`|"(?:[^\\"]|\\[^])*"|'(?:[^\\']|\\[^])*'|\//g:
            nl === "\r\n" ? /\r\n\s+(?=\r\n)|\s+(?=\r\n)|`|"(?:[^\\"]|\\[^])*"|'(?:[^\\']|\\[^])*'|\//g:
                nl === "\r" ? /\r\s+(?=\r)|\s+(?=\r)|`|"(?:[^\\"]|\\[^])*"|'(?:[^\\']|\\[^])*'|\//g:
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

// /**
//  * if `true`, regex is invalid
//  * 
//  * ```js
//  * // must use with /^([dgimsuy]{1,6})?(?:\s*(?:;|,|\.|]|\)|\s))?/g
//  * /[^dgimsuy\d?*+\/\\]/.test(flagsPartAfter);
//  * ```
//  * @date 2020/5/7
//  */
// // TODO: 2020/5/26 11:16:15 - need review because maybe this regex is incomplete
// const reFlagsPartAfter = /[^dgimsuy\d?*+\/\\]/;
// /**
//  * strict check for regex flags
//  *  + This check allows us to eliminate statements that may be arithmetic expressions.
//  * 
//  * ```js
//  * /^(?!.*(.).*\1)[dgimsuy]*$/
//  * ```
//  * @date 2025/1/28
//  */
// const reFixedRegexFlags = /^(?!.*(.).*\1)[dgimsuy]*$/;
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
 * NOTE: 2025/1/28
 *  + Even if it is not written as a regular expression in the text,  
 *    it will be detected if it is valid as a regex (this is by design).
 * 
 * @param {string} line MUST starts with "/" string
 * @param {true=} dontCountPlz
 * @returns {TRegexDetectResult | null}
 */
export const detectRegex = (line: string, dontCountPlz?: true): TBC<TRegexDetectResult> => {

    if (!reValidFirst.test(line) || reLFCR.test(line)) return null;

    let groupIndex = 0, inEscape = false, inClass = 0;
    /** current line offset */
    let i = 1;
    /** line limit */
    const end = line.length;
    /** @type {string | undefined} */
    let reBody: TBD<string>;
    // always starts offset is "one" because line[0] is supposed to be "/"
    for (; i < end;) {
        const ch = line[i++];

        // if (ch === "\n" || ch === "\r") return null;

        if (ch === "\\") {
            inEscape = !inEscape;
        } else if (!inEscape) {
            if (ch === "/" && !inClass) {
                if (groupIndex) return null;
                reBody = line.slice(0, i);
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
        !dontCountPlz && scanRegex++;
        //* ctt DEVNOTE: 2025/1/29 - Processing speed has improved by a few percent.
        const flags = check(line, i);
        if (flags !== null) {
            return {
                body: reBody + flags,
                lastIndex: i + flags.length
            };
        }
        /*/
        /**
         * #### JavaScript regular expressions. Here is a breakdown of the pattern:
         * 
         * ```js
         * /^([dgimsuy]{0,7})(?=\s*(?:;|,|\.|]|\)|:|\s|$)).?/g;
         * ```
         * 
         * 1. `^`: Asserts the position at the start of a line.
         * 
         * 2. `([dgimsuy]{0,7})`: Matches a sequence of 0 to 7 characters that can be any of the following:  
         *   `d`, `g`, `i`, `m`, `s`, `u`, `y`. These are valid flags for JavaScript regular expressions.
         * 
         * 3. `(?=\s*(?:;|,|\.|]|\)|:|\s|$))`: Positive lookahead that asserts that what follows is:
         *    - `\s*`: Zero or more whitespace characters.
         *    - `(?:;|,|\.|]|\)|:|\s|$)`: A non-capturing group that matches one of the following:  
         *      a semicolon (`;`), a comma (`,`), a period (`.`), a closing bracket (`]`),  
         *      a closing parenthesis (`)`), a colon (`:`), any whitespace character (`\s`), or the end of the string (`$`).
         * 
         * 4. `.?`: Matches any single character (if present).
         * 
         * 5. `g`: Global flag, which means the regex will match all occurrences in the input string, not just the first one.
         * 
         * This regex is useful for validating and extracting regular expression flags in JavaScript code.
         * 
         * /
        // Is this the best choice?
        const re = /^([dgimsuy]{0,7})(?=\s*(?:;|,|\.|]|\)|:|\s|$)).?/g;
        // A case like /\w+/gm["lastIndex"] is also possible,
        // but this code is meaningless, so it is excluded.
        // const re = /^([dgimsuy]{0,7})(?=\s*(?:;|,|\.|]|\)|:|\[|\s|$)).?/g;
        // - - - - - - - - - - - - - - - - - - - - - - - - - - -^
        // const re = /^(\w{0,7})(?=\s*(?:;|,|\.|]|\)|:|\s|$)).?/g;
        const maybeFlagPart = line.substring(i);
        const m = re.exec(maybeFlagPart);
        if (re.lastIndex === 0 && reFlagsPartAfter.test(maybeFlagPart)) {
            return null;
        }
        // @ts-ignore
        const flags = m[1] || "";
        if (reFixedRegexFlags.test(flags)) {
            return {
                body: reBody + flags,
                lastIndex: i + flags.length
            };
        }
        //*/
    }

    return null;
};

/** Constants for regex flags. */
const REGEX_FLAGS = "dgimsuy";
/** Expected characters after flags. */
const EXPECT_AFTER_CHARS = ";,.])}: \t"; // FIX: 2025/5/13 - incomplete chars (add "}")
/**
 * @param {string} line
 * @param {number} x
 * @param {number=} limit default is `line.length`
 * @returns {TBC<string>}
 */
function check(line: string, x: number, limit = line.length): TBC<string> {
    let reflags = "";
    while (x < limit) {
        const flag = line[x++] as string;
        if (REGEX_FLAGS.includes(flag)) {
            if (!reflags.includes(flag)) {
                reflags += flag;
            } else {
                return null; // Duplicate flag, invalid regex
            }
        } else if (EXPECT_AFTER_CHARS.includes(flag)) {
            break; // Valid end of flags
        } else {
            return null; // Invalid character in flags
        }
    }
    return reflags;
}

let scanRegex = 0;
export function getScanRegex() {
    return scanRegex;
}
export const resetOk = () => {
    scanRegex = 0;
};
