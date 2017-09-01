"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var QuoteVistor = (function () {
    function QuoteVistor() {
    }
    QuoteVistor.prototype.injectTo = function (registry) {
        registry["'"] = this;
        registry['"'] = this;
        registry["`"] = this;
    };
    QuoteVistor.prototype.visit = function (char, source, context) {
        var index = context.offset;
        if (source[index - 1] !== "\\") {
            var next = index + 1;
            var ch = void 0;
            var length_1 = source.length;
            while (next < length_1) {
                if (source[next] === char && source[next - 1] !== "\\") {
                    context.content += source.substring(index, ++next);
                    context.offset = next;
                    return true;
                }
                next++;
            }
        }
        throw new TypeError("invalid string quotes??");
    };
    return QuoteVistor;
}());
var RE_CRLF = /[\r\n]+/g;
var RE_REGEXP_PATTERN = /\/.*[^\\\r\n](?=\/)\/[gimuysx]*/g;
var SlashVistor = (function () {
    function SlashVistor() {
    }
    SlashVistor.prototype.injectTo = function (registry) {
        registry["/"] = this;
    };
    SlashVistor.prototype.visit = function (char, source, context) {
        var index = context.offset;
        var ch = source[index + 1];
        var length = source.length;
        if (ch === "/") {
            RE_CRLF.lastIndex = index + 2;
            var m_1 = RE_CRLF.exec(source);
            context.offset = RE_CRLF.lastIndex - m_1[0].length;
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
        var m = RE_REGEXP_PATTERN.exec(source);
        if (m === null) {
            throw new SyntaxError("invalid regexp literal?");
        }
        context.offset = index + m[0].length;
        context.content += source.substring(index, context.offset);
        return true;
    };
    return SlashVistor;
}());
var ReplaceFrontEnd = (function () {
    function ReplaceFrontEnd(subject) {
        this.subject = subject;
        this.visitors = {};
        new QuoteVistor().injectTo(this.visitors);
        new SlashVistor().injectTo(this.visitors);
    }
    ReplaceFrontEnd.prototype.apply = function () {
        var context = {
            offset: 0,
            content: ""
        };
        var source = this.subject;
        var limit = source.length;
        while (context.offset < limit) {
            var ch = source[context.offset];
            var visitor = this.visitors[ch];
            if (visitor && visitor.visit(ch, source, context)) {
                ;
            }
            else {
                context.content += ch;
                context.offset++;
            }
        }
        return context.content;
    };
    return ReplaceFrontEnd;
}());
exports.ReplaceFrontEnd = ReplaceFrontEnd;
