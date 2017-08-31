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
    injectTo(registries: IStringMap<ICharVisitor>): void;

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
 * ```
 *   case "'":
 *   case '"':
 *   case "`":
 *```
 */
class QuoteVistor implements ICharVisitor {
    /**
     * 
     * @param registries 
     */
    injectTo(registries: IStringMap<ICharVisitor>): void {
        registries["'"] = this;
        registries['"'] = this;
        registries["`"] = this;
    }
    /**
     * 
     * @param char 
     * @param source 
     * @param context 
     */
    visit(char: string, source: string, context: IReplacementContext): boolean {
        let index = context.offset;
         // quote が見つかり次第 visit をかけるので必要ないだろうが一応検証
        if (source[index - 1] !== "\\") {
            let next = index + 1;
            let ch: string;
            const length = source.length;
            while (next < length) {
                if (source[next] === char && source[next - 1] !== "\\") {
                    context.content += source.substring(index, ++next);
                    context.offset = next;
                    return true;
                }
                next++;
            }
        }
        throw new TypeError("invalid string quotes??");
    }
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
const RE_REGEXP_PATTERN = /\/.*[^\\\r\n](?=\/)\/[gimuysx]*/g;


/**
 * ```
 *   case "/":
 *```
 */
class SlashVistor implements ICharVisitor {

    /**
     * 
     * @param registries 
     */
    injectTo(registries: IStringMap<ICharVisitor>): void {
        registries["/"] = this;
    }

    /**
     * 
     * @param char 
     * @param source 
     * @param context 
     */
    visit(char: string, source: string, context: IReplacementContext): boolean {

        // fetch current offset.
        let index = context.offset;
        // fetch next char.
        let ch = source[index + 1];
        // limiter.
        const length = source.length;

        // check line comment.
        if (ch === "/") {
            // index += 2;
            // while (index < length && source[index++] !== "\n");
            // // update offset, not include "\n".
            // context.offset = index - 2;
            // return true;
            RE_CRLF.lastIndex = index + 2;
            let m = RE_CRLF.exec(source);
            context.offset = RE_CRLF.lastIndex - m[0].length;
            // context.content += m[0];
            return true;
        }

        // check multi line comment.
        if (ch === "*") {
            index += 2;
            while (index < length) {
                if (source[index] === "*" && source[index + 1] === "/") {
                    // console.log(source.substring(context.offset, index + 2));
                    break;
                }
                index++;
            }
            // update offset.
            context.offset = index  + 2;
            return true;
        }

        // check regexp literal
        // NOTE:
        //  o LF does not have to worry.
        RE_REGEXP_PATTERN.lastIndex = index;
        // only execute once, this is important!
        const m = RE_REGEXP_PATTERN.exec(source);
        if (m === null) {
            throw new SyntaxError("invalid regexp literal?");
        }
        // update offset.
        context.offset = index  + m[0].length;
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
