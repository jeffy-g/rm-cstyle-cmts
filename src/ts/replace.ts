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
/** buildWsQsReRegexp, RE_NEWLINEs */
import * as reutil from "./reutil";

declare global {
    interface IReplaceFrontEnd {
        /**
         * it returns result string content.
         * @return {string} line comment, multiline comment, remaining whitespace character of line are removed
         */
        apply(source: string): string;
        regexErrorReportEnable(enable: boolean): void;
    }
}


interface IReplacementContext {
    /** content offset(read, write */
    offset: number;
    /** replecement result */
    result: string;
    /** new line character at source. */
    newline: string;
}

interface ICharVisitor {
    /**
     * #### main function.  
     * if returns true then context has been changed.
     * @param char    character of context.offset position.
     * @param source  current replacement source.
     * @param context see IReplacementContext
     */
    visit(char: string, source: string, context: IReplacementContext): boolean;
    /** optional use. */
    // setContext(context: IReplacementContext): void;
}


/**
 * 
 */
let isRegexErrorReportEnable: boolean = false;

/**
 * TODO: jsdoc
 */
abstract class CharVisitorBase implements ICharVisitor {
    /**
     * TODO: jsdoc
     * @param registry 
     */
    constructor(characters: string, registry: ICharVisitor[] | IStringMap<ICharVisitor>) {
        const array = characters.split("");
        const callback = Array.isArray(registry)? (ch: string) => {
            registry[ch.charCodeAt(0)] = this;
        }: (ch: string) => {
            registry[ch] = this;
        };
        array.forEach(callback);
    }

    /**
     * 
     * @param char 
     * @param source 
     * @param context 
     */
    abstract visit(char: string, source: string, context: IReplacementContext): boolean;

    /**
     * TODO: jsdoc
     * 
     * @param registry 
     */
    static injectKnownVisitorsTo(registry: ICharVisitor[] | IStringMap<ICharVisitor>) {
        Reflect.construct(QuoteVistor, [registry]);
        Reflect.construct(BackQuoteVistor, [registry]);
        Reflect.construct(SlashVistor, [registry]);
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
class QuoteVistor extends CharVisitorBase {

    constructor(registry: ICharVisitor[] | IStringMap<ICharVisitor>) {
        super(`"'`, registry);
    }

    public visit(char: string, source: string, context: IReplacementContext): boolean {
        // maybe will not need it. because it will apply visit as soon as quote is found.
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
class BackQuoteVistor extends CharVisitorBase {

    constructor(registry: ICharVisitor[] | IStringMap<ICharVisitor>) {
        super("`", registry);
    }

    // did not investigate the optimization of node.js,
    // rewrite code according to the optimization idiom such as C, performance has improved slightly...
    // however, it might be my imagination... :- (at no webpack
    public visit(ch: string, source: string, context: IReplacementContext): boolean {

        // store "next" postion character. 
        // let ch: string;
        // move next position.
        let next = context.offset + 1;
        // toggle escape flag.
        let in_escape = false;
        // limiter
        const limiter = source.length;

        // nested template depth
        let depth = 0;
        /**
         * #### nested back quote depth.
         * this is always the same as depth or one less.
         * ```
         * (depth + (0 or -1)) === bq_depth
         * ```
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

        throw new SyntaxError(`BackQuoteVistor error: offset=${context.offset}, remaining=--[${source.substring(context.offset)}]--`);
    }
}

/**
 * when this character appears,  
 * its necessary to verify the line comment, multiline comment, regex.  
 * will need to set the priority as (line comment || multiline comment) > regex.
 * ```
 case "/": // slash

 ```
 */
class SlashVistor extends CharVisitorBase {

    constructor(registry: ICharVisitor[] | IStringMap<ICharVisitor>) {
        super("/", registry);
    }

    public visit(ch: string, source: string, context: IReplacementContext): boolean {

        // fetch current offset.
        const index = context.offset;
        // limiter.
        const length = source.length;
        // remove c style comment It's a phenomenon which cannot happen with the specification of this program...
        if (index + 1 >= length) {
            // throw new SyntaxError("invalid input source :-D");
            return false;
        }

        // fetch next char.
        ch = source[index + 1];

        // check multiline comment.
        if (ch === "*") {
            const close = source.indexOf("*/", index + 2);
            // update offset.(implicit bug at here
            context.offset = (close === -1? index : close) + 2;
            return true;
        }

        // index + 1 ...
        const x = context.newline && source.indexOf(context.newline, index + 1) || -1;
        L: do {
            // check line comment.
            if (ch === "/") {
                // update offset. when new line character not found(eof) then...
                context.offset = x === -1? length: x + context.newline.length;
                // NOTE: avoid extra loops in ReplaceFrontEnd.apply()
                x === -1 || (context.result += context.newline);
                return true;
            }

            // ------------------- check regexp literal -------------------
            // NOTE: It was necessary to extract the character strings of the remaining lines...
            // const x = m? m.index: length;
            const remaining = source.substring(index, x === -1? length: x);
            // NOTE: LF does not have to worry.
            // NOTE: need lastIndex property, must add "g" flag.
            const re_re = /\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/\[\\])/g;
            // only execute once, this is important!
            const m = re_re.exec(remaining);
            if (m === null) {
                return false;
            }

            // means line comment.
            if (remaining[m.index - 1] === "/") {
                ch = "/";
                context.result += source.substring(index, index + m.index - 1);
                // jump to "L", and apply remaining process. (ch === "/"
                continue L;
            } else {
                // DEVNOTE: the eval function can almost certainly detect regexp literal.
                try {
                    // DEVNOTE: performance will be worse than "evel", and regex can not be detected accurately
                    // tslint:disable-next-line
                    // const lx = m[0].lastIndexOf("/");
                    // new RegExp(m[0].substring(1, lx));
                    eval(m[0]);
                } catch (e) {
                    isRegexErrorReportEnable && console.log("Regex SyntaxError: [%s]", m[0]);
                    return false;
                }
                // update offset.
                context.offset = index + re_re.lastIndex; // "g" flag.
                context.result += source.substring(index, context.offset);
                return true;
            }

        } while (true);
        // unreachable...
        // return false;
    }
}

/**
 * create IReplacementContext.
 * @param source parsing source.
 */
const createWhite = (source: string): IReplacementContext => {
    // specify new line character.
    const m = reutil.RE_NEWLINEs.exec(source);
    return {
        offset: 0,
        result: "",
        newline: m? m[0]: ""
    };
};

const emitCode = (part: string = "") => {
    // DEVNOTE: must js code
    return `(source) => {

        const limit = source.length;
        const registry = visitors;
        const context = createWhite(source);
        let prev_offset = 0;

        while (context.offset < limit) {
            const ch = source[context.offset];
            const visitor = registry[ch${part}];
            if (visitor) {
                context.result += source.substring(prev_offset, context.offset);
                prev_offset = !visitor.visit(ch, source, context)? context.offset++: context.offset;
            } else {
                context.offset++;
            }
        }
        if (limit - prev_offset > 0) {
            context.result += source.substring(prev_offset, context.offset);
        }
        return context.result;
    }`;
};

type Replacementable = (source: string) => string;
/**
 * for node.js version 9 earlier
 */
namespace LegendReplacer {

    /**
     * ICharVisitor registory.
     */
    const visitors: IStringMap<ICharVisitor> = {};
    CharVisitorBase.injectKnownVisitorsTo(visitors);

    export const apply = eval(emitCode()) as Replacementable;
    // export const apply = (source: string): string => {

    //     const limit = source.length;
    //     const registry = visitors;
    //     const context: IReplacementContext = createWhite(source);
    //     let prev_offset = 0;

    //     while (context.offset < limit) {
    //         const ch = source[context.offset];
    //         const visitor = registry[ch];
    //         if (visitor) {
    //             context.result += source.substring(prev_offset, context.offset);
    //             // if visit(...) returns true, context.offset has been updated.
    //             prev_offset = !visitor.visit(ch, source, context)? context.offset++: context.offset;
    //         } else {
    //             // increment scan position.
    //             context.offset++;
    //         }
    //     }
    //     // when has remaining
    //     if (limit - prev_offset > 0) {
    //         context.result += source.substring(prev_offset, context.offset);
    //     }

    //     return context.result;
    // };
}

/**
 * for node.js version 10 later
 */
namespace NeoReplacer {

    /**
     * ICharVisitor registory.
     */
    const visitors: ICharVisitor[] = [];
    CharVisitorBase.injectKnownVisitorsTo(visitors);

    export const apply = eval(emitCode(".charCodeAt(0)")) as Replacementable;
    // export const apply = (source: string): string => {

    //     const limit = source.length;
    //     const registry = visitors;
    //     const context: IReplacementContext = createWhite(source);
    //     let prev_offset = 0;

    //     while (context.offset < limit) {
    //         const ch = source[context.offset];
    //         // DEVNOTE: 2019-4-30
    //         // It seems that the call cost of string.charCodeAt method is
    //         //  lower than lookup of object registed as key and value by key.
    //         const visitor = registry[ch.charCodeAt(0)];
    //         if (visitor) {
    //             context.result += source.substring(prev_offset, context.offset);
    //             prev_offset = !visitor.visit(ch, source, context)? context.offset++: context.offset;
    //         } else {
    //             context.offset++;
    //         }
    //     }

    //     if (limit - prev_offset > 0) {
    //         context.result += source.substring(prev_offset, context.offset);
    //     }

    //     return context.result;
    // };
}

/**
 * get node version at runtime.
 * 
 * format must be `v\d+.\d+.\d+`
 * 
 * ex:
 * ```
const utils = require("./utils");
const nv = utils.extractVersion();
console.log(nv); // => {major: 10, minor: 9, patch: 0}
```
 *
 * @param {string} versionString default is process.version
 */
const extractVersion = (versionString: string = process.version) => {
    const RE_VERSION = /v(\d+).(\d+).(\d+)/;
    // NOTE: pv is Array.isArray(pv), extend Array
    let pv = RE_VERSION.exec(versionString);
    const [_, major = 0, minor = 0, patch = 0] = pv.map((value, i) => {
        return (i > 0 && parseInt(value)) || void 0;
    });
    return { major, minor, patch }
};


/**
 * NOTE:  
 * This namespace is implemented to correctly judge quoted string,  
 * line comment, multiline commnet, regexp literal,  
 * and delete line comment, multiline commnet. (maybe...
 */
namespace ReplaceFrontEnd {
    let replacer: typeof LegendReplacer;
    DECIDE_REPLACER: {
        const version = extractVersion();
        // replacer = version.major <= 9? LegendReplacer: LegendReplacer;
        replacer = version.major <= 9? LegendReplacer: NeoReplacer;
    }
    export const apply = replacer.apply;
    export const regexErrorReportEnable = (enable: boolean): void => {
        isRegexErrorReportEnable = enable;
    };
}

/**
 * get IReplaceFrontEnd instance.
 */
export function getFrondEnd(): IReplaceFrontEnd {
    return ReplaceFrontEnd;
}
