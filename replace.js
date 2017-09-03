"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RE_CRLF = /[\r\n]+/g;
const RE_REGEXP_PATTERN = /\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/])/g;
const ESCAPE = "\\";
class QuoteVistor {
    injectTo(registry) {
        registry["'"] = this;
        registry['"'] = this;
        registry["`"] = this;
    }
    visit(char, source, context) {
        let index = context.offset;
        if (source[index - 1] !== ESCAPE) {
            let next = index + 1;
            let in_escape = false;
            let ch;
            const limiter = source.length;
            while (next < limiter) {
                if ((ch = source[next]) === ESCAPE) {
                    in_escape = !in_escape;
                }
                else if (!in_escape && ch === char) {
                    context.content += source.substring(index, ++next);
                    context.offset = next;
                    return true;
                }
                else {
                    in_escape = false;
                }
                next++;
            }
        }
        throw new TypeError("invalid string quotes??");
    }
}
class SlashVistor {
    injectTo(registry) {
        registry["/"] = this;
    }
    visit(char, source, context) {
        let index = context.offset;
        const length = source.length;
        if (index + 1 >= length) {
            return false;
        }
        let ch = source[index + 1];
        let m;
        if (ch === "/") {
            RE_CRLF.lastIndex = index + 2;
            m = RE_CRLF.exec(source);
            context.offset = m ? RE_CRLF.lastIndex - m[0].length : length;
            return true;
        }
        if (ch === "*") {
            const close = source.indexOf("*/", index + 2);
            context.offset = (close === -1 ? index : close) + 2;
            return true;
        }
        const re = /\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/])/g;
        re.lastIndex = index;
        m = re.exec(source);
        if (m === null || source[m.index - 1] === "/") {
            return false;
        }
        context.offset = re.lastIndex;
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
    setSubject(s) {
        this.subject = s;
        return this;
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
