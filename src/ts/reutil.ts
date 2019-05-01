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
declare global {
    interface ReUtil {
        /**
         * ```js
         * const RE_NEWLINEs = /\r\n|\n|\r/;
         * ```
         */
        readonly RE_NEWLINEs: RegExp;
        /**
         * create regex by newline character of source.
         * @param source parsing source.
         */
        buildWsQsReRegexp(source: string): { re_ws_qs: RegExp, re_first_n_last: RegExp };
        // buildWsQsReRegexp(source: string): RegExp;
    }
}

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

/**
 * global flag for regexp.lastIndex.  
 * rewrite the lastIndex and execute it only once.
 * 
 * `regex summary:`
 * 
 * ```
 * \/                   # regexp literal start@delimiter
 *   (?![?*+\/])        # not meta character "?*+/" @anchor
 *   (?:                # start non-capturing group $1
 *     \\[\s\S]|        # escaped any character, or
 *     \[               # class set start
 *       (?:            # non-capturing group $2
 *         \\[\s\S]|    # escaped any character, or
 *         [^\]\r\n\\]  # without class set end, newline, backslash
 *       )*             # end non-capturing group $2 (q: 0 or more
 *     \]|              # class set end, or
 *     [^\/\r\n\\]      # without slash, newline, backslash
 *   )+                 # end non-capturing group $1 (q: 1 or more
 * \/                   # regexp literal end@delimiter
 * (?:                  # start non-capturing group $3
 *   [gimuy]+\b|        # validate regex flags, but this pattern is imcomplete
 * )                    # end non-capturing group $3
 * (?![?*+\/\[\\])      # not meta character [?*+/[\] @anchor ...
 * ```
 */
// NOTE: regexp document -> ***match regexp literal@mini#nocapture
// const RE_REGEXP_PATTERN = /\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/\[\\])/g;

/** base */
const re_ws_qs_base: RegExp =
    /`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/\[\\])/;

// function buildWsQsReRegexp(source: string): RegExp {
function buildWsQsReRegexp(this: ReUtil, source: string): { re_ws_qs: RegExp, re_first_n_last: string|RegExp } {
    // specify new line character.
    const m = this.RE_NEWLINEs.exec(source);
    const is_single_line_input = m === null;

    let newline: string;
    if (m === null) {
        newline = "";
    } else {
        // escape CR or LF
        newline = (newline = m[0]) === "\r\n"? "\\r\\n": newline === "\n"? "\\n": "\\r";
    }

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
     *  \/(?![?*+/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+/[\\]) # regex
     *
     *```
     */
    const re_ws_qs = is_single_line_input? /^\s+|\s+$/g: new RegExp(`${newline}\\s+(?=${newline})|\\s+(?=${newline})|${re_ws_qs_base.source}`, "g");
    // return new RegExp(`${newline}\\s+(?=${newline})|\\s+(?=${newline})|${re_ws_qs_base.source}`, "g");

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
    const re_first_n_last = is_single_line_input? "": new RegExp(`^${newline}|${newline}$`, "g");
    return {
        re_ws_qs, re_first_n_last
    };
}

/*
    configurable
        true if and only if the type of this property descriptor may be changed and if the property may be deleted from the corresponding object.
        Defaults to false.
    enumerable
        true if and only if this property shows up during enumeration of the properties on the corresponding object.
        Defaults to false.
    writable
        true if and only if the value associated with the property may be changed with an assignment operator.
        Defaults to false.

    get
        A function which serves as a getter for the property, or undefined if there is no getter. The function return will be used as the value of property.
        Defaults to undefined.
    set
        A function which serves as a setter for the property, or undefined if there is no setter. The function will receive as only argument the new value being assigned to the property.
        Defaults to undefined.

    value
        The value associated with the property. Can be any valid JavaScript value (number, object, function, etc).
        Defaults to undefined.
*/
const reutil: ReUtil = Object.defineProperties({}, {
    // create readonly property "version"
    RE_NEWLINEs: {
        enumerable: true,
        configurable: false,
        value: /\r\n|\n|\r/
    },
    buildWsQsReRegexp: {
        enumerable: true,
        configurable: false,
        value: buildWsQsReRegexp
    }
}) as ReUtil;

export = reutil;
