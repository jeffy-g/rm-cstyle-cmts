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

declare global {
    interface IStringMap<T> {
        [key: string]: T;
    }
}

interface IReplacementContext {
    /** content offset(read, write */
    offset: number;
    /** replecement result */
    result: string;
}
interface ICharVisitor {
    /** register by self. */
    injectTo(registry: IStringMap<ICharVisitor>): void;

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
 * ```
 *   case "'":
 *   case '"':
 *   case "`":
 *```
 */
class QuoteVistor implements ICharVisitor {
    injectTo(registry: IStringMap<ICharVisitor>): void {
        registry["'"] = this;
        registry['"'] = this;
    }
    visit(char: string, source: string, context: IReplacementContext): boolean {
        const index = context.offset;
         // maybe will not need it. because it will apply visit as soon as quote is found.
        // if (source[index - 1] !== "\\") {
            // move next position.
            let next = index + 1;
            // toggle escape flag.
            let in_escape = false;
            // store "next" postion character. 
            let ch: string;
            // limiter
            const limiter = source.length;

            while (next < limiter) {
                if ((ch = source[next]) === "\\") {
                    in_escape = !in_escape;
                }
                else if (!in_escape && ch === char) {
                    // const str = source.substring(index, ++next);
                    // console.log(`--[${str}]--`);
                    // context.result += str;
                    context.result += source.substring(index, ++next);
                    context.offset = next;
                    return true;
                } else {
                    in_escape = false;
                }
                next++;
            }
        // }
        throw new TypeError(`invalid string quotes??, offset=${index}, remaining=` + source.substring(index));
    }
}
/**
 * ```
 *   case "`":
 *```
 */
class BackQuoteVistor implements ICharVisitor {
    injectTo(registry: IStringMap<ICharVisitor>): void {
        registry["`"] = this;
    }
    visit(char: string, source: string, context: IReplacementContext): boolean {
        const index = context.offset;
        // move next position.
        let next = index + 1;
        // toggle escape flag.
        let in_escape = false;
        // store "next" postion character. 
        let ch: string;
        // limiter
        const limiter = source.length;
        // nested depth
        let depth = 0;
        // nested back quote flag.
        let nested_bq = false;

        LOOP: while (next < limiter) {
            if ((ch = source[next]) === "\\") {
                in_escape = !in_escape;
            }
            else if (!in_escape) {
                switch (ch) {
                    case "`":
                        if (depth > 0) {
                            nested_bq = !nested_bq;
                            break;
                        }
                        if (!nested_bq) {
                            // const str = source.substring(index, ++next);
                            // console.log(`<[${str}]>`);
                            // context.result += str;
                            context.result += source.substring(index, ++next);
                            context.offset = next;
                            return true;
                        }
                        break;
                    case "$":
                        if (source[next + 1] === "{") {
                            next += 2, depth++;
                            continue LOOP;
                        }
                    case "}":
                        // NOTE: can be decremented only when it is nested?
                        (depth > 0 && !nested_bq) && depth--;
                        break;
                }
            } else {
                in_escape = false;
            }
            next++;
        }
        throw new TypeError(`BackQuoteVistor error: offset=${index}, remaining=--[${source.substring(index)}]--`);
    }
}


/**
 * global flag for regexp.lastIndex.
 */
const RE_CRLF = /[\r\n]+/g;

/**
 *  rewrite the lastIndex and execute it only once.
 */
// NOTE: regexp document -> match regexp literal@mini#nocapture
const RE_REGEXP_PATTERN = /\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/])/g;

/**
 * ```
 *   case "/":
 *```
 */
class SlashVistor implements ICharVisitor {
    injectTo(registry: IStringMap<ICharVisitor>): void {
        registry["/"] = this;
    }
    visit(char: string, source: string, context: IReplacementContext): boolean {

        // fetch current offset.
        let index = context.offset;
        // limiter.
        const length = source.length;
        // remove c style comment It's a phenomenon which cannot happen with the specification of this program...
        if (index + 1 >= length) {
            // throw new SyntaxError("invalid input source :-D");
            return false;
        }

        // fetch next char.
        let ch = source[index + 1];
        let m: RegExpExecArray;
        // check line comment.
        if (ch === "/") {
            RE_CRLF.lastIndex = index + 2;
            m = RE_CRLF.exec(source);
            // update offset. when new line character not found(eof) then...
            context.offset = m? RE_CRLF.lastIndex: length;
            // NOTE: avoid extra loops in ReplaceFrontEnd.apply()
            m && (context.result += m[0]);
            return true;
        }
        // check multi line comment.
        if (ch === "*") {
            // index += 2;
            // while (index < length) {
            //     if (source[index] === "*" && source[index + 1] === "/") {
            //         // console.log(source.substring(context.offset, index + 2));
            //         break;
            //     }
            //     index++;
            // }
            // context.offset = index;
            const close = source.indexOf("*/", index + 2);
            // update offset.
            context.offset = (close === -1? index : close) + 2;
            return true;
        }

        // ------------------- check regexp literal -------------------
        RE_CRLF.lastIndex = index + 1;
        m = RE_CRLF.exec(source);
        // NOTE: It was necessary to extract the character strings of the remaining lines...
        // const x = m? m.index: length;
        const remaining = source.substring(index, m? m.index: length);

        // NOTE:
        //  o LF does not have to worry.
        RE_REGEXP_PATTERN.lastIndex = 0;
        // only execute once, this is important!
        m = RE_REGEXP_PATTERN.exec(remaining);
        if (m === null || remaining[m.index - 1] === "/") {
            return false;
        }
        // update offset.
        context.offset = index + RE_REGEXP_PATTERN.lastIndex;
        context.result += source.substring(index, context.offset);

        return true;
    }
}

/**
 * NOTE:  
 * This class is implemented to correctly judge quoted string,  
 * line comment, multi line commnet, regexp literal,  
 * and delete line comment, multi line commnet. (maybe...
 */
export class ReplaceFrontEnd {
    private visitors: IStringMap<ICharVisitor> = {};
    /**  */
    constructor(private subject: string) {
        new QuoteVistor().injectTo(this.visitors);
        new BackQuoteVistor().injectTo(this.visitors);
        new SlashVistor().injectTo(this.visitors);
    }
    setSubject(s: string): this {
        this.subject = s;
        return this;
    }
    /**
     * it returns result string content.
     */
    apply(): string {
        const context: IReplacementContext = {
            offset: 0,
            result: ""
        };
        let source = this.subject;
        let limit = source.length;
        const registry = this.visitors;
        while (context.offset < limit) {
            let ch = source[context.offset];
            let visitor = registry[ch];
            if (visitor && visitor.visit(ch, source, context)) {
                ; // do nothing
                // quote part.
                // case "'": case '"': case "`":
                // // single or multi line start, or regexp literal start?
                // case "/":
            } else {
                context.result += ch;
                context.offset++;
            }
        }

        return context.result;
    }
}
