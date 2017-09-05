"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RE_CRLF = /[\r\n]+/g;
var ESCAPE = "\\";
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
        if (source[index - 1] !== ESCAPE) {
            var next = index + 1;
            var in_escape = false;
            var ch = void 0;
            var limiter = source.length;
            while (next < limiter) {
                if ((ch = source[next]) === ESCAPE) {
                    in_escape = !in_escape;
                }
                else if (!in_escape && ch === char) {
                    context.result += source.substring(index, ++next);
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
    };
    return QuoteVistor;
}());
var SlashVistor = (function () {
    function SlashVistor() {
    }
    SlashVistor.prototype.injectTo = function (registry) {
        registry["/"] = this;
    };
    SlashVistor.prototype.visit = function (char, source, context) {
        var index = context.offset;
        var length = source.length;
        if (index + 1 >= length) {
            return false;
        }
        var ch = source[index + 1];
        var m;
        if (ch === "/") {
            RE_CRLF.lastIndex = index + 2;
            m = RE_CRLF.exec(source);
            context.offset = m ? RE_CRLF.lastIndex - m[0].length : length;
            return true;
        }
        if (ch === "*") {
            var close_1 = source.indexOf("*/", index + 2);
            context.offset = (close_1 === -1 ? index : close_1) + 2;
            return true;
        }
        var re = /\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/])/g;
        re.lastIndex = index;
        m = re.exec(source);
        if (m === null || source[m.index - 1] === "/") {
            return false;
        }
        context.offset = re.lastIndex;
        context.result += source.substring(index, context.offset);
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
    ReplaceFrontEnd.prototype.setSubject = function (s) {
        this.subject = s;
        return this;
    };
    ReplaceFrontEnd.prototype.apply = function () {
        var context = {
            offset: 0,
            result: ""
        };
        var source = this.subject;
        var limit = source.length;
        var registry = this.visitors;
        while (context.offset < limit) {
            var ch = source[context.offset];
            var visitor = registry[ch];
            if (visitor && visitor.visit(ch, source, context)) {
                ;
            }
            else {
                context.result += ch;
                context.offset++;
            }
        }
        return context.result;
    };
    return ReplaceFrontEnd;
}());
exports.ReplaceFrontEnd = ReplaceFrontEnd;
