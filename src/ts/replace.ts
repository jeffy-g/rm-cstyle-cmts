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
/** RE_NEWLINEs */
import * as reutil from "./reutil";


export interface IReplaceFrontEnd {
    /**
     * it returns result string content.
     * @return {string} line comment, multiline comment, remaining whitespace character of line are removed
     */
    apply(source: string): string;

    getScanner(ch: string): CharScannerFunction;

    /**
     * 
     * @param enable 
     */
    regexErrorReportEnable(enable: boolean): void;
    /**
     * 
     */
    getDetectedReContext(): DetectedReContext;
    /**
     * 
     */
    reset(): void;
}

interface IReplacementContext {
    /** content offset(read, write */
    offset: number;
    /** replecement result */
    result: string;
    /** new line character at source. */
    newline: string;
}

interface ICharacterScanner {
    /**
     * #### main function.  
     * if returns true then context has been changed.
     * @param char    character of context.offset position.
     * @param source  current replacement source.
     * @param context see IReplacementContext
     */
    scan(char: string, source: string, context: IReplacementContext): boolean;
}

type CharScannerFunction = ICharacterScanner["scan"];
type CharScannerFunctionRegistry = CharScannerFunction[];

/**
 * 
 */
let regexErrorReport: boolean = false;

/**
 * TODO: jsdoc
 */
abstract class CharScannerBase implements ICharacterScanner {

    /**
     * TODO: jsdoc
     * 
     * @param registry 
     */
    static injectKnownScannersTo(registry: CharScannerFunctionRegistry) {
        Reflect.construct(QuoteScanner, [registry]);
        Reflect.construct(BackQuoteScanner, [registry]);
        Reflect.construct(SlashScanner, [registry]);
    }

    /**
     * ⚠️ MUST define as propget method at subclasses.
     *
     * @type {string}
     */
    abstract get characters(): string;
    /**
     * 
     * @param char 
     * @param source 
     * @param context 
     */
    abstract scan(char: string, source: string, context: IReplacementContext): boolean;

    /**
     * TODO: jsdoc
     * @param registry 
     */
    constructor(registry: CharScannerFunctionRegistry) {
        // DEVNOTE: ✅ there is no problem at runtime in node.js v8.4 later
        // @ts-ignore TS2715: Abstract property 'characters' in class 'CharScannerBase' cannot be accessed in the constructor.
        const array = this.characters.split("");
        array.forEach((ch: string) => {
            registry[ch.charCodeAt(0)] = this.scan;
        });
    }
}



/**
 * correctly evaluate single quote and double quote string,  
 * and concat it to the result string.
 * ```
case "'": // single quote
case '"': // double quote
 ```
 */
class QuoteScanner extends CharScannerBase {

    // DEVNOTE: this case will be undefined at super constructor...
    // readonly characters: string = `"'`;

    // DEVNOTE: this will allow you to get the value successfully with the super constructor.
    get characters() {
        return `"'`; // 34, 39
    }

    public scan(char: string, source: string, context: IReplacementContext): boolean {
        // maybe will not need it. because it will apply scan as soon as quote is found.
        // if (source[index - 1] !== "\\") {
        // move next position.
        let next = context.offset + 1;
        // store "next" postion character. 
        let ch: string;
        // limiter
        const limiter = source.length;
        // toggle escape flag.
        let in_escape = false;

        while (next < limiter) {
            if ((ch = source[next++]) === "\\") {
                in_escape = !in_escape;
            } else if (!in_escape && ch === char) { /* need in_escape = false state. */
                // const str = source.substring(context.offset, next);
                // console.log(`--[${str}]--`);
                // context.result += str;
                context.result += source.substring(context.offset, next);
                context.offset = next;
                return true;
            } else { // last state is "in escape" then current ch is ignored.
                in_escape = false;
            }
        }
        // }
        throw new SyntaxError(`invalid string quotes?, offset=${context.offset}, remaining=--[${source.substring(context.offset)}]--`);
    }
}

/**
 * In back quote string,  
 * can define template string further by enclosing it with "${" and "}",  
 * so special processing is required (at es6
 * ```
 case "`": // back quote

 ```
 */
// NOTE: 2017/9/7 23:44:25 
// by improving the algorithm it is now possible to process correctly.
class BackQuoteScanner extends CharScannerBase {

    get characters() {
        return "`"; // 96
    }
    // did not investigate the optimization of node.js,
    // rewrite code according to the optimization idiom such as C, performance has improved slightly...
    // however, it might be my imagination... :- (at no webpack
    public scan(ch: string, source: string, context: IReplacementContext): boolean {

        // store "next" postion character. 
        // let ch: string;
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
 (depth - (0 or 1)) === bq_depth
 ```
         */
        let bq_depth = 0;

        LOOP: while (next < limiter) {
            // fetch "next" char, if its back slash then toggle escape state.
            if ((ch = source[next]) === "\\") {
                in_escape = !in_escape;
            } else if (in_escape) {
                // last state is "in escape" then current ch is ignored.
                in_escape = false;
            } else {

                // DEVNOTE: 2019-4-30
                //  abolished switch statement and adopted ifelse statement.
                //  this slightly improves performance.
                //
                // state is not escaped then let's check [`], "${", "}".
                // however, "}" is ignore escape state?
                if (ch === "$") {
                    if (source[next + 1] === "{") {
                        next += 2, depth++;
                        continue LOOP;
                    }
                } else if (ch === "`") {
                    if (depth > 0) {
                        // if (depth - 1 === bq_depth) {    // can increment.
                        //     bq_depth++;
                        // } else if (depth === bq_depth) { // can decrement.
                        //     bq_depth--;
                        // }
                        depth - 1 === bq_depth ? bq_depth++ : depth === bq_depth && bq_depth--;
                    } else /* if (depth === 0) */ {
                        context.result += source.substring(context.offset, ++next);
                        context.offset = next;
                        return true;
                    }
                } else if (ch === "}") {
                    // NOTE: can be decremented only when it is nested?
                    // if (depth > 0 && depth - 1 === bq_depth) {
                    //     depth--;
                    // }
                    // again, this one seems better (at no webpack
                    (depth > 0 && depth - 1 === bq_depth) && depth--;
                }

            }

            next++;
        }

        throw new SyntaxError(`BackQuoteScanner error: offset=${context.offset}, remaining=--[${source.substring(context.offset)}]--`);
    }
}

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
const simpleRegexVerify = (inputs: string) => {

    let groupIndex = 0;
    let in_escape = false;
    let in_class = 0;
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
 * regex cache
 */
const re_tsref = /\/\/\/[ \t]*<reference/;

/**
 * when this character appears,  
 * its necessary to verify the line comment, multiline comment, regex.  
 * will need to set the priority as (line comment || multiline comment) > regex.
 * ```
 case "/": // slash

 ```
 */
// CHANGES: 2019-5-25 - stopped add newline character at kinds of line comment.
//  -> these things were required for code + regex replacement
class SlashScanner extends CharScannerBase {

    get characters() {
        return "/"; // 47
    }

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
    public scan(ch: string, source: string, context: IReplacementContext): boolean {

        // fetch current offset.
        const index = context.offset;
        // fetch next char.
        ch = source[index + 1];
        // remove c style comment It's a phenomenon which cannot happen with the specification of this program...
        if (ch === void 0) {
            throw new SyntaxError("invalid input source");
        }

        //
        // - - - check multiline comment. - - -
        //
        if (ch === "*") {
            const close = source.indexOf("*/", index + 2);
            // // update offset.(implicit bug at here
            // context.offset = (close === -1? index : close) + 2;
            if (close !== -1) {
                // update offset.
                context.offset = close + 2;
                return true;
            }
            throw new SyntaxError("multi line comment close mark not found");
        }
        // avoid jsx, tsx tag
        if (source[index - 1] === "<") {
            return false;
        }

        // index + 1 ...
        const nl_start = context.newline && source.indexOf(context.newline, index + 1) || -1;
        // limitation.
        const length = source.length;
        // NOTE: It was necessary to extract the character strings of the remaining lines...
        const remaining = source.substring(index, nl_start === -1? length: nl_start);

        //
        // - - - check ts reference tag or line comment - - -
        //
        if (ch === "/") {
            // update offset. when new line character not found(eof) then...
            context.offset = nl_start === -1? length: nl_start;// + context.newline.length;
            if (re_tsref.test(remaining)) { // avoid ts reference tag
                context.result += source.substring(
                    // DEVNOTE: 2019-5-25 - fix: imcomplete substring
                    index, context.offset// - (context.newline.length === 2? 1: 0)
                );
            }
            return true;
        }

        //
        // - - - check regexp literal - - -
        //
        // NOTE: need lastIndex property, must add "g" flag.
        const re_re = /\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimsuy]+\b|)(?![?*+\/\[\\])/g;
        // only execute once, this is important!
        const m = re_re.exec(remaining);
        if (m === null) {
            return false;
        }

        // means line comment.
        if (remaining[m.index - 1] === "/") {
            context.result += source.substring(index, index + m.index - 1);
            // update offset. when new line character not found(eof) then...
            context.offset = nl_start === -1? length: nl_start;// + context.newline.length;
        } else {
            // DEVNOTE: the eval function can almost certainly detect regexp literal.
            const re_literal = m[0];
            try {
                // DEVNOTE: performance will be worse than "evel", and regex can not be detected accurately
                // tslint:disable-next-line
                // const lx = m[0].lastIndexOf("/");
                // new RegExp(m[0].substring(1, lx));
                // eval(m[0]);
                if (!simpleRegexVerify(re_literal)) {
                    // throw "🚸";
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
            context.offset = index + re_re.lastIndex; // "g" flag.
            context.result += source.substring(index, context.offset);
        }

        return true;
    }
}

/**
 * create IReplacementContext.
 * @param source parsing source.
 */
const createWhite = (source: string): IReplacementContext => {
    // specify new line character.
    const newline = reutil.detectNewLine(source);
    return {
        offset: 0,
        result: "",
        newline: newline || ""
    };
};

/**
 * create IReplacementContext.
 * @param source parsing source.
 */
export const createReplacementContext = createWhite;

/**
 * NOTE:  
 * This namespace is implemented to correctly judge quoted string,  
 * line comment, multiline commnet, regexp literal,  
 * and delete line comment, multiline commnet. (maybe...
 * 
 * ---
 * CHANGES: 2019-5-23
 *   + from this version onwards, its an implementation of only code optimized for node v10 later.  
 *     It works on node v9 and earlier too, but performance is not good.
 */
namespace ReplaceFrontEnd {

    /**
     * CharScannerFunction registory.
     */
    const scanners: CharScannerFunctionRegistry = [];
    CharScannerBase.injectKnownScannersTo(scanners);

    export const apply = (source: string) => {

        const size = source.length;
        const registry = scanners;
        const context = createWhite(source);
        let offset = 0;
        let prev_offset = 0;

        while (offset < size) {
            const ch = source[offset];
            const inspectable = registry[ch.charCodeAt(0)];
            if (!inspectable) {
                offset++;
            } else {
                context.result += source.substring(prev_offset, offset);
                context.offset = offset;
                prev_offset = inspectable(ch, source, context)? context.offset: context.offset++;
                offset = context.offset;
            }
        }
        if (size - prev_offset > 0) {
            context.result += source.substring(prev_offset, offset);
        }

        return context.result;
    };
    /* istanbul ignore next */
    export const getScanner = (ch: string) => {
        return scanners[ch.charCodeAt(0)];
    };

    export const regexErrorReportEnable = (enable: boolean): void => {
        regexErrorReport = enable;
    };

    export const getDetectedReContext = () => {
        return {
            detectedReLiterals,
            evaluatedLiterals
        };
    };
    export const reset = () => {
        detectedReLiterals.length = 0;
        evaluatedLiterals = 0;
    }
}

/**
 * get IReplaceFrontEnd instance.
 */
export function getFrondEnd(): IReplaceFrontEnd {
    return ReplaceFrontEnd;
}
