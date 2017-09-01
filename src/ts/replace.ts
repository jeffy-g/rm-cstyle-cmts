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
interface IReplacementContext {
    /** content offset(read, write */
    offset: number;
    /** replecement result */
    content: string;
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
interface IStringMap<T> {
    [key: string]: T;
}



/**
 * global flag for regexp.lastIndex.
 */
const RE_CRLF = /[\r\n]+/g;

/** rewrite the lastIndex and execute it only once.
 * 
 * * capture verstion:
 * ```
 *  /\/(.*[^\\\r\n](?=\/))\/([gimuysx]*)/g
 * ```
 */
// NOTE: regexp document -> match regexp literal@mini-ext-mode#nocapture
const RE_REGEXP_PATTERN = /\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/])/g
// const RE_REGEXP_PATTERN = /\/.*[^\\\r\n](?=\/)\/[gimuysx]*(?!\/)/g;

const ESCAPE = "\\";
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
        registry["`"] = this;
    }
    visit(char: string, source: string, context: IReplacementContext): boolean {
        let index = context.offset;
         // maybe will not need it. because it will apply visit as soon as quote is found.
        if (source[index - 1] !== ESCAPE) {
            // move next position.
            let next = index + 1;
            // toggle escape flag.
            let in_escape = false;
            // store "next" postion character. 
            let ch: string;
            // limiter
            const limiter = source.length;

            while (next < limiter) {
                if ((ch = source[next]) === ESCAPE) {
                    in_escape = !in_escape;
                }
                else if (!in_escape && ch === char) {
                    context.content += source.substring(index, ++next);
                    context.offset = next;
                    return true;
                } else {
                    in_escape = false;
                }
                next++;
            }
        }
        throw new TypeError("invalid string quotes??");
    }
}

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
        // fetch next char.
        let ch = source[index + 1];
        // limiter.
        const length = source.length;

        let m: RegExpExecArray;
        // check line comment.
        if (ch === "/") {
            RE_CRLF.lastIndex = index + 2;
            m = RE_CRLF.exec(source);
            // update offset.
            context.offset = RE_CRLF.lastIndex - m[0].length;
            // context.content += m[0];
            return true;
        }

        /*
        NOTE: 20 loop of 1000times.
        
          js file 13,912byte with remove blank line and whitespaces (at node v8.4.0
          see: test.js#function benchmark(rm_ws)

            [indexOf]
            --------------- start benchmark ---------------
            inner: 394.818ms
            inner: 381.545ms
            inner: 376.714ms
            inner: 378.061ms
            inner: 375.673ms
            inner: 375.337ms
            inner: 376.861ms
            inner: 376.345ms
            inner: 376.964ms
            inner: 376.485ms
            inner: 376.277ms
            inner: 375.161ms
            inner: 378.346ms
            inner: 375.391ms
            inner: 376.776ms
            inner: 376.737ms
            inner: 374.692ms
            inner: 377.200ms
            inner: 383.704ms
            inner: 385.004ms
            ---------------- end benchmark ----------------

            [while]
            --------------- start benchmark ---------------
            inner: 402.874ms
            inner: 391.760ms
            inner: 389.673ms
            inner: 387.628ms
            inner: 388.392ms
            inner: 387.901ms
            inner: 390.548ms
            inner: 388.978ms
            inner: 386.949ms
            inner: 386.864ms
            inner: 386.983ms
            inner: 388.051ms
            inner: 387.297ms
            inner: 388.448ms
            inner: 388.665ms
            inner: 386.803ms
            inner: 386.904ms
            inner: 387.058ms
            inner: 385.242ms
            inner: 386.875ms
            ---------------- end benchmark ----------------
        */
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
            index = source.indexOf("*/", index + 2);
            // update offset.
            context.offset = index + 2;
            return true;
        }

        // check regexp literal
        // NOTE:
        //  o LF does not have to worry.
        RE_REGEXP_PATTERN.lastIndex = index;
        // only execute once, this is important!
        m = RE_REGEXP_PATTERN.exec(source);
        if (m === null || source[m.index - 1] === "/") {
            return false;
            // throw new SyntaxError("invalid regexp literal?");
        }
        // update offset.
        context.offset = RE_REGEXP_PATTERN.lastIndex;
        context.content += source.substring(index, context.offset);

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
        new SlashVistor().injectTo(this.visitors);
    }
    /**
     * it returns result string content.
     */
    apply(): string {
        const context: IReplacementContext = {
            offset: 0,
            content: ""
        };
        let source = this.subject;
        let limit = source.length;
        while (context.offset < limit) {
            let ch = source[context.offset];
            let visitor = this.visitors[ch];
            if (visitor && visitor.visit(ch, source, context)) {
                ; // do nothing
                // quote part.
                // case "'": case '"': case "`":
                // // single or multi line start, or regexp literal start?
                // case "/":
            } else {
                context.content += ch;
                context.offset++;
            }
        }

        return context.content;
    }
}
