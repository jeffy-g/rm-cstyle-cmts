/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference path="./index.d.ts"/>

import * as util from "./reutil";

const {
    detectNewLine,
    detectRegex,
    lookupRegexes
} = util;


type TScannerContext = {
    /** The source offset currently being scanned is recorded. (read, write */
    offset: number;
    /** new line character at source. (read */
    readonly newline: util.TDetectedNewLines;

    /**
     * The scan event listener will no longer run twice
     * @date 2022/4/6
     */
    eventDone?: true;

    /**
     * Whether to record the detected regex. (read, write
     * 
     * @date 2020/5/8
     */
    collectRegex: boolean;

    // - - - - - - - - - - - - - - -
    // replace mode
    // - - - - - - - - - - - - - - -
    /** replecement result (read, write */
    result: string;

    // - - - - - - - - - - - - - - -
    // walk through mode
    // - - - - - - - - - - - - - - -
    /**
     * always true if running at walk through mode
     * @since 3.1
     * @date 2020/5/14
     */
    isWalk?: boolean;
    /**
     * whether to continue walk through
     * @since 3.1
     * @date 2020/5/14
     */
    proceed?: boolean;
};

/**
 * @date 2022/4/22
 * @since 3.3.1
 */
 const enum EMetaChars {
    /**
     * ```js
     * '"'.charCodeAt(0)
     * ```
     */
    DOUBLE_QUOTE = 34,
    /**
     * ```js
     * "'".charCodeAt(0)
     * ```
     */
    SINGLE_QUOTE = 39,
    /**
     * ```js
     * "/".charCodeAt(0)
     * ```
     */
    SLASH = 47,
    /**
     * ```js
     * "`".charCodeAt(0)
     * ```
     */
    BACK_QUOTE = 96,
    /**
     * ```js
     * "}".charCodeAt(0)
     * ```
     */
    RIGHT_CURLY = 125,
}

/**
 * #### main function.
 * 
 * if returns true then context has been changed.
 */
type TCharScannerFunction =
    /**
     * #### main function.
     * 
     * if returns true then context has been changed.
     * @param src  current replacement source.
     * @param ctx see {@link TScannerContext}
     */
    (src: string, ctx: TScannerContext) => boolean | never;


/**
 * @typedef {object} TScannerContext
 * @prop {number} offset The source offset currently being scanned is recorded.(read, write
 * @prop {util.TDetectedNewLines} newline new line character at source. (read
 * @prop {boolean} [collectRegex] Whether to record the detected regex. (read, write
 * @prop {string} result replecement result (read, write
 * @prop {boolean} [isWalk] always true if running at walk through mode
 * @prop {boolean} [proceed] whether to continue walk through
 * @prop {true} [eventDone] suppress secondary scan event
 */
/**
 * @typedef {(
 *   source: string, context: TScannerContext
 * ) => boolean | never} TCharScannerFunction if returns true then context has been changed.
 */


/**
 * create TScannerContext
 * 
 * @param {string} src parsing source
 * @param {true} [collectRegex]
 * @returns {TScannerContext}
 */
const createWhite = (src: string, collectRegex?: true, isWalk: boolean = false): TScannerContext => {
    // specify new line character.
    /** @type {util.TDetectedNewLines} */
    const newline: util.TDetectedNewLines = detectNewLine(src);
    /** @type {TScannerContext} */
    const ctx: TScannerContext = {
        offset: 0,
        // result: "",
        collectRegex,
        newline
    } as TScannerContext;

    if (isWalk) {
        ctx.proceed = ctx.isWalk = true;
    } else {
        ctx.result = "";
    }

    return ctx;
};


/**
 * correctly evaluate single quote and double quote string,  
 * and concat it to the result string.
 * ```
 * case "'": // single quote
 * case '"': // double quote
 * ```
 * @param {string} src 
 * @param {TScannerContext} ctx
 * @returns {boolean}
 * @throws {SyntaxError}
 */
const quote: TCharScannerFunction = (src: string, ctx: TScannerContext): boolean => {

    const startOffset = ctx.offset;
    const q = src[startOffset];
    // limiter
    const limiter = src.length;
    // move next position.
    let next = startOffset + 1;
    // toggle escape flag.
    let inEscape = false;
    // store "next" postion character. 
    let ch: string;

    while (next < limiter) {
        if ((ch = src[next++]) === "\\") {
            inEscape = !inEscape;
        } else if (inEscape) { /* need inEscape = false state. */
            inEscape = false;
        } else if (ch === q) { // last state is "in escape" then current ch is ignored.
            ctx.offset = next;
            if (!ctx.isWalk) {
                // DEVNOTE: 2022/02/02 when working on "walk" mode, context.result is ignored
                ctx.result += src.substring(startOffset, next);
            }
            return true;
        }
    }

    throw new SyntaxError(`invalid quote string, offset=${startOffset}, remaining=<[${src.substring(startOffset, startOffset + 200)}]>`);
};


/**
 * In back quote string,  
 * can define template string further by enclosing it with "${" and "}",  
 * so special processing is required (at es6
 * ```
 * case "`": // back quote
 * ```
 * @param {string} src 
 * @param {TScannerContext} ctx
 * @returns {boolean}
 * @throws {SyntaxError}
 */
const backQuote: TCharScannerFunction = (src: string, ctx: TScannerContext): boolean | never => {

    // store "next" postion character. 
    let ch: string;
    // cache start offset
    let startOffset = ctx.offset;
    // move next position.
    let next = startOffset + 1;
    // toggle escape flag.
    let inEscape = false;
    // limiter
    const limiter = src.length;
    /* https://coderwall
    const when = (start: number) => {
        if (!ctx.isWalk) {
            ctx.result += src.substring(start, next);
        }
    };
    //*/

    $: while (next < limiter) {
        // fetch "next" char, if its back slash then toggle escape state.
        if ((ch = src[next++]) === "\\") {
            inEscape = !inEscape;
        } else if (inEscape) {
            // last state is "in escape" then current ch is ignored.
            inEscape = false;
        } else if (ch === "$") {
            if (src[next] === "{") {
                next++;
                // DEVNOTE: 2022/4/22 with `CharScannerFunction`
                const scans = scanners;
                let prevOffset = next;
                /* https://coderwall
                when(startOffset);
                /*/
                if (!ctx.isWalk) {
                    ctx.result += src.substring(startOffset, next);
                }
                //*/
                while (next < limiter) {
                    const code = src[next].charCodeAt(0);
                    // "}".charCodeAt(0) === 125
                    if (code === EMetaChars.RIGHT_CURLY) {
                        startOffset = ++next;
                        /* https://coderwall
                        when(prevOffset);
                        /*/
                        if (!ctx.isWalk) {
                            ctx.result += src.substring(prevOffset, next);
                        }
                        //*/
                        continue $;
                    }
                    const inspectable = scans[code];
                    if (!inspectable) {
                        next++;
                        continue;
                    }
                    /* https://coderwall
                    when(prevOffset);
                    /*/
                    if (!ctx.isWalk) {
                        ctx.result += src.substring(prevOffset, next);
                    }
                    //*/
                    ctx.offset = next;
                    prevOffset = inspectable(src, ctx)? ctx.offset: ctx.offset++;
                    next = ctx.offset;
                }
            }
        } else if (ch === "`") {
            ctx.offset = next;
            /* https://coderwall
            when(startOffset);
            /*/
            if (!ctx.isWalk) {
                ctx.result += src.substring(startOffset, next);
            }
            //*/
            return true;
        }
    }

    throw new SyntaxError(`invalid backquote, offset=${startOffset}, remaining=<[${src.substring(startOffset, startOffset + 200)}]>`);
};

/** @type {string[]} */
const detectedReLiterals: string[] = [];
let drlIndex = 0;
/**
 * test for "<reference .../>" and "///@ts-(ignore|check|...)..."
 * 
 * regex cache
 */
const reTsrefOrPramga = /^(?:\/\/\/?\s*@ts-[-\w]+|\/\/\/\s*<reference)/;

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
 * @param {string} src 
 * @param {TScannerContext} ctx
 * @returns {boolean}
 * @throws {SyntaxError}
 */
const slash: TCharScannerFunction = (src: string, ctx: TScannerContext): boolean => {

    // cache start offset
    const startOffset = ctx.offset;
    // fetch next char.
    const ch = src[startOffset + 1];
    /**
     * (single|multi) line comment
     */
    let fragment: string;

    //
    // - - - check multiline comment. - - -
    //
    if (ch === "*") {
        const close = src.indexOf("*/", startOffset + 2);
        if (close !== -1) {
            fragment = src.substring(startOffset, close + 2);
            if (ctx.eventDone) {
                ctx.result += fragment;
            } else {
                const eventContext: TScannerEventContext = {
                    event: EScannerEvent.MultiLineComment,
                    fragment,
                    offset: startOffset
                };
                if (!ctx.isWalk) {
                    if (scanListener!(eventContext)) {
                        ctx.result += fragment;
                    }
                } else {
                    ctx.proceed = scanListener!(eventContext);
                }
            }
            // update offset.
            ctx.offset = close + 2;
            return true;
        }
        throw new SyntaxError("multi line comment close mark not found");
    }
    // avoid jsx, tsx tag
    if (src[startOffset - 1] === "<") {
        return false;
    }

    // limitation.
    // DEVNOTE: 2022/04/08 - nlsOrEos is not allow zero -> eliminate blanks process is will be fail
    let nlsOrEos = ctx.newline && src.indexOf(ctx.newline, startOffset + 1) || -1;
    nlsOrEos === -1 && (nlsOrEos = src.length);
    // NOTE: It was necessary to extract the character strings of the remaining lines...
    fragment = src.substring(startOffset, nlsOrEos);

    //
    // - - - check ts reference tag or line comment - - -
    //
    if (ch === "/") { // means single line comment
        // update offset. when new line character not found(eof) then
        ctx.offset = nlsOrEos;
        if (ctx.eventDone) {
            ctx.result += fragment;
        } else {
            const eventContext: TScannerEventContext = {
                event: EScannerEvent.SingleLineComment,
                fragment,
                offset: startOffset
            };
            if (!ctx.isWalk) { // replace mode
                if (
                    // avoid ts reference tag
                    reTsrefOrPramga.test(fragment) || scanListener!(eventContext)
                ) {
                    ctx.result += fragment;
                }
            } else { // walk through mode
                ctx.proceed = scanListener!(eventContext);
            }
        }

        return true;
    }

    //
    // - - - check regexp literal - - -
    //
    const m = detectRegex(fragment);
    if (!m) {
        return false;
    }

    if (ctx.collectRegex) {
        // detectedReLiterals.push(m.body);
        detectedReLiterals[drlIndex++] = m.body;
    }
    // update offset.
    ctx.offset = startOffset + m.lastIndex;
    if (!ctx.isWalk) {
        ctx.result += src.substring(startOffset, ctx.offset);
    }

    return true;
};

/**
 * CharScannerFunction registry.
 * 
 * + JSBench.Me test [array index access or object key access](https://jsbench.me/chl08elhyd/1)
 * 
 * @type {Array<TCharScannerFunction | undefined>}
 */
const scanners: Array<TBD<TCharScannerFunction>> = [];
scanners[EMetaChars.BACK_QUOTE]   = backQuote;  // 96
scanners[EMetaChars.DOUBLE_QUOTE] = quote;      // 34
scanners[EMetaChars.SINGLE_QUOTE] = quote;      // 39
scanners[EMetaChars.SLASH]        = slash;      // 47

/** @type {IScanEventCallback | undefined} */
let scanListener: TBD<IScanEventCallback>;

/**
 * ### replace mode
 * 
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
 *
 * @param {string} src 
 * @param {TRemoveCStyleCommentsOpt} opt
 * @returns {string}
 * @throws {SyntaxError}
 */
const apply = (src: string, opt: TRemoveCStyleCommentsOpt): string => {

    //
    // step 1. remove {line, block} comments
    //
    const size  = src.length;
    const ctx   = createWhite(src, opt.collectRegex);
    const scans = scanners;
    let offset     = 0;
    let prevOffset = 0;

    // check listener
    if (!scanListener) {
        // remove comments
        scanListener = () => false;
    }

    while (offset < size) {
        const inspectable = scans[src.charCodeAt(offset)];
        if (!inspectable) {
            offset++;
        } else {
            ctx.result += src.substring(prevOffset, offset);
            ctx.offset = offset;
            prevOffset = inspectable(src, ctx)? ctx.offset: ctx.offset++;
            offset = ctx.offset;
        }
    }

    // adjust remaining
    if (size - prevOffset > 0) {
        ctx.result += src.substring(prevOffset, offset);
    }

    if (opt.preserveBlanks) {
        return ctx.result;
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
    src = ctx.result;
    /* reset context */
    ctx.result = "";//, ctx.offset = 0;
    // fix for "The current implementation calls the scan event listener twice"
    ctx.eventDone = true;

    /* halt collectRegex */
    ctx.collectRegex = false;
    const regexes = lookupRegexes(ctx.newline);
    const reWsqs = regexes.wsqs;

    let m: TBC<RegExpExecArray>;
    prevOffset = 0;
    // NOTE: need skip quoted string, regexp literal.
    while (m = reWsqs.exec(src)) {

        // const [head] = m[0];
        const head = m[0][0];

        if (head === "/" || head === "`") {
            ctx.offset = m.index;
            if (prevOffset !== ctx.offset) {
                ctx.result += src.substring(prevOffset, ctx.offset);
            }
            prevOffset = (head === "/" ? slash : backQuote)(src, ctx)? ctx.offset: ctx.offset++;
            reWsqs.lastIndex = ctx.offset;
            continue;
        }

        // DEVNOTE: check the double quote first
        const sublast = (head === '"' || head === "'")? reWsqs.lastIndex: m.index;
        ctx.result += src.substring(prevOffset, sublast);
        prevOffset = reWsqs.lastIndex;
    }

    // adjust remaining
    if (src.length - prevOffset > 0) {
        ctx.result += src.substring(prevOffset, src.length);
    }

    //
    // DEVNOTE: 2020/5/17 - It turned out that regex `/\n$/g` has a little cost, so I rewritten it by script code.
    //
    src = ctx.result.replace(regexes.first, "");
    // newline length
    const nll = ctx.newline.length;
    const lidx = src.length - nll;
    if (
        (nll === 1 && src[lidx] === ctx.newline) ||
        (nll === 2 && src[lidx] === "\r" && src[lidx + 1] === "\n")
    ) {
        return src.substring(0, lidx);
    }

    // DEVNOTE: which means nothing newline at head and tail in original source
    return src;
};

/**
 * ### walk through mode
 * 
 * @param {string} src 
 * @param {TRemoveCStyleCommentsOpt} opt
 * @returns {void}
 * @throws {SyntaxError}
 */
const walk = (src: string, opt: TRemoveCStyleCommentsOpt): void => {

    //
    // run as walk through mode
    //
    const size  = src.length;
    const scans = scanners;
    const ctx   = createWhite(src, opt.collectRegex, true);
    let offset  = 0;

    // check listener
    if (!scanListener) {
        // proceed walk
        scanListener = () => true;
    }

    while (ctx.proceed && offset < size) {
        const inspectable = scans[src.charCodeAt(offset)];
        if (!inspectable) {
            offset++;
        } else {
            ctx.offset = offset;
            if (!inspectable(src, ctx)) {
                ctx.offset++;
            }
            offset = ctx.offset;
        }
    }
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
        uniqReLiterals: uniq(detectedReLiterals).sort()
    };
};
/**
* reset the regex detection related context
*/
const reset = () => {
    detectedReLiterals.length = 0;
    drlIndex = 0;
};

/**
 * @param {IScanEventCallback} listener 
 */
const setListener = (listener?: IScanEventCallback) => {
    if (typeof listener === "function") {
        scanListener = listener;
    } else {
        scanListener = void 0;
    }
};

export {
    apply,
    walk,
    getDetectedReContext,
    reset,
    setListener,
};
