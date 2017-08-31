"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QuoteVistor {
    injectTo(registries) {
        registries["'"] = this;
        registries['"'] = this;
        registries["`"] = this;
    }
    visit(char, source, context) {
        let index = context.offset;
        if (source[index - 1] !== "\\") {
            let next = index + 1;
            let ch;
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
const RE_CRLF = /[\r\n]+/g;
const RE_REGEXP_PATTERN = /\/.*[^\\\r\n](?=\/)\/[gimuysx]*/g;
class SlashVistor {
    injectTo(registries) {
        registries["/"] = this;
    }
    visit(char, source, context) {
        let index = context.offset;
        let ch = source[index + 1];
        const length = source.length;
        if (ch === "/") {
            RE_CRLF.lastIndex = index + 2;
            let m = RE_CRLF.exec(source);
            context.offset = RE_CRLF.lastIndex - m[0].length;
            return true;
        }
        if (ch === "*") {
            index += 2;
            while (index < length) {
                if (source[index] === "*" && source[index + 1] === "/") {
                    break;
                }
                index++;
            }
            context.offset = index + 2;
            return true;
        }
        RE_REGEXP_PATTERN.lastIndex = index;
        const m = RE_REGEXP_PATTERN.exec(source);
        if (m === null) {
            throw new SyntaxError("invalid regexp literal?");
        }
        context.offset = index + m[0].length;
        context.content += source.substring(index, context.offset);
        return true;
    }
}
class ReplaceFrontEnd {
    constructor(subject) {
        this.subject = subject;
        this.visitors = {};
        new QuoteVistor().injectTo(this.visitors);
        new SlashVistor().injectTo(this.visitors);
    }
    apply() {
        const context = {
            offset: 0,
            content: ""
        };
        let source = this.subject;
        let limit = source.length;
        while (context.offset < limit) {
            let ch = source[context.offset];
            let visitor = this.visitors[ch];
            if (visitor && visitor.visit(ch, source, context)) {
                ;
            }
            else {
                context.content += ch;
                context.offset++;
            }
        }
        return context.content;
    }
}
exports.ReplaceFrontEnd = ReplaceFrontEnd;
