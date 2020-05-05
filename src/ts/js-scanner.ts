/*!
-----------------------------------------------------------------------

  Copyright 2020 jeffy-g hirotom1107@gmail.com

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
/** lookupRegexes, detectNewLine, DetectedNewLines */
import * as reutil from "./reutil";

type TReplacementContext = {
    /** content offset(read, write */
    offset: number;
    /** replecement result */
    result: string;
    /** new line character at source. */
    newline: reutil.DetectedNewLines;
};
/**
 * #### main function.
 * 
 * if returns true then context has been changed.
 * @param source  current replacement source.
 * @param context see TReplacementContext
 */
type TCharScannerFunction = (source: string, context: TReplacementContext) => boolean;

/**
 * whether to report false positives for regex literals
 */
let regexErrorReport: boolean = false;
/**
 * create TReplacementContext
 * 
 * @param source parsing source
 */
const createWhite = (source: string): TReplacementContext => {
    // specify new line character.
    const newline = reutil.detectNewLine(source) || "";
    return {
        offset: 0,
        result: "",
        newline
    };
};


/**
 * correctly evaluate single quote and double quote string,  
 * and concat it to the result string.
 * ```
 * case "'": // single quote
 * case '"': // double quote
 * ```
 */
const quote = (source: string, context: TReplacementContext): boolean => {

    const st = context.offset;
    const char = source[st];
    // limiter
    const limiter = source.length;
    // move next position.
    let next = st + 1;
    // toggle escape flag.
    let in_escape = false;
    // store "next" postion character. 
    let ch: string;

    while (next < limiter) {
        if ((ch = source[next]) === "\\") {
            in_escape = !in_escape;
        } else if (in_escape) { /* need in_escape = false state. */
            in_escape = false;
        } else if (ch === char) { // last state is "in escape" then current ch is ignored.
            context.result += source.substring(st, ++next);
            context.offset = next;
            return true;
        }
        next++;
    }
    // while (next < limiter) {
    //     if ((ch = source[next++]) === "\\") {
    //         in_escape = !in_escape;
    //     } else if (!in_escape && ch === char) { /* need in_escape = false state. */
    //         context.result += source.substring(st, next);
    //         context.offset = next;
    //         return true;
    //     } else { // last state is "in escape" then current ch is ignored.
    //         in_escape && (in_escape = false);
    //     }
    // }

    throw new SyntaxError(`invalid string quotes?, offset=${st}, remaining=--[${source.substring(st)}]--`);
};


/**
 * In back quote string,  
 * can define template string further by enclosing it with "${" and "}",  
 * so special processing is required (at es6
 * ```
 * case "`": // back quote
 * ```
 */
// NOTE: 2017/9/7 23:44:25 
// by improving the algorithm it is now possible to process correctly.

// did not investigate the optimization of node.js,
// rewrite code according to the optimization idiom such as C, performance has improved slightly...
// however, it might be my imagination... :- (at no webpack
const backQuote = (source: string, context: TReplacementContext): boolean => {

    // store "next" postion character. 
    let ch: string;
    // move next position.
    let next = context.offset + 1;
    // toggle escape flag.
    let in_escape = false;
    // limiter
    const limiter = source.length;

    /**
     * nested template depth
     */
    let depth = 0;
    /**
     * #### nested back quote depth.
     * this is always the same as depth or one less.
     * ```
     * (depth - (0 or 1)) === bq_depth
     * ```
     */
    let bq_depth = 0;

    $: while (next < limiter) {
        // fetch "next" char, if its back slash then toggle escape state.
        if ((ch = source[next]) === "\\") {
            in_escape = !in_escape;
        } else if (in_escape) {
            // last state is "in escape" then current ch is ignored.
            in_escape = false;
        } else if (ch === "$") {
            if (source[next + 1] === "{") {
                next += 2, depth++;
                continue $;
            }
        } else if (ch === "}") {
            (depth > 0 && depth - 1 === bq_depth) && depth--;
        } else if (ch === "`") {
            if (depth > 0) {
                depth - 1 === bq_depth ? bq_depth++ : depth === bq_depth && bq_depth--;
            } else /* if (depth === 0) */ {
                context.result += source.substring(context.offset, ++next);
                context.offset = next;
                return true;
            }
        }
        next++;
    }

    throw new SyntaxError(`BackQuoteScanner error: offset=${context.offset}, remaining=--[${source.substring(context.offset)}]--`);
};

/**
 * Simple regex verifier
 * 
 * + perform verification of regex literal.
 * 
 * NOTE:
 *  + here is only validate the placement of "(" and ")" briefly.  
 *  **this will be avoid the costly "eval" quite a number of times**.
 * 
 * @param inputs regex literal string.
 */
const validateRegex = (inputs: string) => {

    let groupIndex = 0,
        in_escape = false,
        in_class = 0;

    const end = inputs.lastIndexOf("/");

    for (let i = 1; i < end;) {
        const ch = inputs[i++];
        if (ch === "\\") {
            in_escape = !in_escape;
        } else if (!in_escape) {
            if (ch === "(") {
                !in_class && groupIndex++;
            } else if (ch === ")") {
                !in_class && groupIndex--;
            } else if (ch === "[") {
                in_class = 1;
            } else if (ch === "]") {
                in_class = 0;
            }

            if (groupIndex < 0) {
                return false;
            }
        } else {
            in_escape = false;
        }
    }

    return groupIndex === 0;
};

const detectedReLiterals: string[] = [];
let evaluatedLiterals = 0;
/**
 * test for "<reference .../>" and "///@ts-(ignore|check|...)..."
 * 
 * regex cache
 */
// https://regex101.com/r/U79xmb/4
const re_tsref_or_pramga = /^(?:\/\/\/?\s+@ts-\w+|\/\/\/\s*<reference)/;

// const jsdoctags: string[] = [];
// const listener = (fragment: string) => {
//     // DEVNOTE: \b is not contained LF
//     if (/\/\*\*[^*]/.test(fragment)) {
//         const re = /@\w+\b/g;
//         let m: RegExpExecArray | null;
//         while (m = re.exec(fragment)) {
//             jsdoctags.push(m[0]);
//         }
//     }
// };

//
//  DEVNOTE: 2019-5-12
// 
// 1. The detection of regex in this program is because it is necessary to skip ['"`]
//   which may be included in regex in order to detect quoted string correctly.
//
// 2. It is possible to misdetect a string not described as regex literal in the calculation statment,
//    but even if it is a misdetected regex literal, the result is that the cost processed up to this point is not wasted.
//    Concatenate to a string.
//
/**
 * when this character appears,  
 * its necessary to verify the line comment, multiline comment, regex.  
 * will need to set the priority as (line comment || multiline comment) > regex.
 * ```
 * case "/": // slash
 * ```
 */
// CHANGES: 2019-5-25 - stopped add newline character at kinds of line comment.
//  -> these things were required for code + regex replacement
// CHANGES: 2020/4/8 - reduce regex backtracking
// CHANGES: 2020/4/8 - [re_re] Optimize assuming target text is single line
const slash = (source: string, context: TReplacementContext): boolean => {

    // fetch current offset.
    const i = context.offset;
    // fetch next char.
    let ch = source[i + 1];
    // remove c style comment It's a phenomenon which cannot happen with the specification of this program...
    if (ch === void 0) {
        throw new SyntaxError("invalid input source");
    }

    //
    // - - - check multiline comment. - - -
    //
    if (ch === "*") {
        const close = source.indexOf("*/", i + 2);
        // // update offset.(implicit bug at here
        // context.offset = (close === -1? index : close) + 2;
        if (close !== -1) {
            /* istanbul ignore next */
            if (scanListener) {
                const comment = source.substring(i, close + 2);
                // console.log(comment);
                if (scanListener(ScannerEvent.MultiLineComment, comment)) {
                    context.result += comment;
                }
            }
            // update offset.
            context.offset = close + 2;
            return true;
        }
        throw new SyntaxError("multi line comment close mark not found");
    }
    // avoid jsx, tsx tag
    if (source[i - 1] === "<") {
        return false;
    }

    // limitation.
    let nls_or_eos = context.newline && source.indexOf(context.newline, i + 1) || -1;
    nls_or_eos === -1 && (nls_or_eos = source.length);
    // NOTE: It was necessary to extract the character strings of the remaining lines...
    const remaining = source.substring(i, nls_or_eos);

    //
    // - - - check ts reference tag or line comment - - -
    //
    if (ch === "/") {
        // update offset. when new line character not found(eof) then...
        context.offset = nls_or_eos;// + context.newline.length;
        if (
            re_tsref_or_pramga.test(remaining) // avoid ts reference tag
            ||
            (scanListener && scanListener(ScannerEvent.SingleLineComment, remaining))
        ) {
            /* istanbul ignore next */
            context.result += remaining;
        }

        // if (re_tsref.test(remaining)) { // avoid ts reference tag
        //     context.result += source.substring(i, nls_or_eos);
        // }
        // /* istanbul ignore next */
        // else if (scanListener) {
        //     const lineComment = source.substring(i, nls_or_eos);
        //     if (scanListener(ScannerEvent.SingleLineComment, lineComment)) {
        //         context.result += lineComment;
        //     }
        // }
        return true;
    }

    //
    // - - - check regexp literal - - -
    //
    // NOTE: need lastIndex property, must add "g" flag.
    // new regex for regex v2 (2020
    const re_re = /\/(?![?*+\/])(?:\[(?:[^\]\\]|\\.)*\]|[^\/\\]|\\.)+\/(?:[gimsuy]{1,6}\b|)(?![?*+\/\[\\])/g;

    // only execute once, this is important!
    const m = re_re.exec(remaining);
    if (m === null) {
        return false;
    }

    // means line comment.
    if (remaining[m.index - 1] === "/") {
        context.result += source.substring(i, i + m.index - 1);
        // update offset. when new line character not found(eof) then...
        context.offset = nls_or_eos;
    } else {
        // DEVNOTE: the eval function can almost certainly detect regexp literal.
        const re_literal = m[0];
        try {
            // DEVNOTE: performance will be worse than "evel", and regex can not be detected accurately
            // tslint:disable-next-line
            // const lx = m[0].lastIndexOf("/");
            // new RegExp(m[0].substring(1, lx));
            // eval(m[0]);
            if (!validateRegex(re_literal)) {
                eval(re_literal);
                /* istanbul ignore next */
                evaluatedLiterals++;
            }
        } catch (e) {
            regexErrorReport && console.log("Missdetection of Regex: [%s]", re_literal);
            return false;
        }

        detectedReLiterals.push(re_literal);
        // update offset.
        context.offset = i + re_re.lastIndex; // "g" flag.
        context.result += source.substring(i, context.offset);
    }

    return true;
};

/**
 * CharScannerFunction registry.
 */
const scanners: TCharScannerFunction[] = [];
scanners['"'.charCodeAt(0)] = quote;      // 34
scanners["'".charCodeAt(0)] = quote;      // 39
scanners["`".charCodeAt(0)] = backQuote;  // 96
scanners["/".charCodeAt(0)] = slash;      // 47

/**
 * NOTE:  
 * This function is implemented to correctly judge quoted string,  
 * line comment, multiline commnet, regexp literal,  
 * and delete line comment, multiline commnet. (maybe...
 * 
 * ---
 * CHANGES: 2019-5-23
 *   + In v2.x and later, it is optimized to node v10 and later.  
 *     This works even on node v9 and earlier, but with poor performance.
 *     - &gt; The performance differs depending on whether the structure of `scanners` is a builtin hash map (e.g - { "/": <scanner function> }) or an array
 */
const apply = (source: string, rm_blank_line_n_ws: boolean) => {

    //
    // step 1. remove {line, block} comments
    //
    const size     = source.length;
    const registry = scanners;
    const context  = createWhite(source);
    let offset      = 0;
    let prev_offset = 0;

    while (offset < size) {
        // const ch = source[offset];
        const inspectable = registry[source.charCodeAt(offset)];
        if (!inspectable) {
            offset++;
        } else {
            context.result += source.substring(prev_offset, offset);
            context.offset = offset;
            prev_offset = inspectable(source, context)? context.offset: context.offset++;
            offset = context.offset;
        }
    }

    // adjust remaining
    if (size - prev_offset > 0) {
        context.result += source.substring(prev_offset, offset);
    }

    if (!rm_blank_line_n_ws) {
        return context.result;
    }

    //
    // step 2. remove blank line and trailing whitespaces
    //
    // - - - -
    // DEVNOTE: 2019-5-25
    // Since string.replace method by regex only is difficult to control, 
    // so we implemented code + regex replacement.
    //
    // ✅ This makes it possible to hold the contents of nested es6 templete string.
    // - - - -
    /* replace removed comments result */
    source = context.result;
    /* reset context */
    context.result = "";//, context.offset = 0;
    const regexes = reutil.lookupRegexes(context.newline);
    const re_wsqs = regexes.re_wsqs;

    let m: RegExpExecArray | null;
    prev_offset = 0;
    // NOTE: need skip quoted string, regexp literal.
    // TODO: 2020/5/2 19:30:22 - The current implementation calls the scan event listener twice
    while (m = re_wsqs.exec(source)) {

        const head = m[0][0];

        if (head === "/" || head === "`") {
            context.result += source.substring(prev_offset, m.index);
            context.offset = m.index;
            prev_offset = registry[head.charCodeAt(0)](source, context)? context.offset: context.offset++;
            re_wsqs.lastIndex = context.offset;
            continue;
        }

        const sublast = (head === "'" || head === '"')? re_wsqs.lastIndex: m.index;
        context.result += source.substring(prev_offset, sublast);
        prev_offset = re_wsqs.lastIndex;
    }

    // adjust remaining
    if (source.length - prev_offset > 0) {
        context.result += source.substring(prev_offset, source.length);
    }

    return context.result.replace(regexes.re_first_n_last, "");
};

/**
 * whether to report false positives for regex literals
 * 
 * @param enable 
 */
const regexErrorReportEnable = (enable: boolean): void => {
    regexErrorReport = enable;
};

/**
 * @param {string[]} ra regex literal array
 */
const uniq = (ra: string[]) => {
    // known elements
    /** @type {Map<string, boolean>} */
    const ke: Map<string, boolean> = new Map<string, boolean>();
    // uniqued Array
    /** @type {typeof ra} */
    const ua: typeof ra = [];
    for (const e of ra) {
        if (ke.has(e)) continue;
        ua.push(e);
        ke.set(e, true);
    }
    return ua;
};
/**
 * acquire the regex detection related context
 */
const getDetectedReContext = () => {
    return {
        detectedReLiterals,
        evaluatedLiterals,
        uniqReLiterals: uniq(detectedReLiterals).sort()
    };
};
/**
* reset the regex detection related context
*/
const reset = () => {
    detectedReLiterals.length = 0;
    evaluatedLiterals = 0;
};

// const getDetectedJSDocTags = () => uniq(jsdoctags).sort();
let scanListener: IScannerListener | undefined;
const setListener = (listener: IScannerListener) => {
    /* istanbul ignore if */
    if (typeof listener === "function") scanListener = listener;
};

export {
    apply,
    regexErrorReportEnable,
    getDetectedReContext,
    reset,
    // single listener only
    setListener,
    // getDetectedJSDocTags
};
