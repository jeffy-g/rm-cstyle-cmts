"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var replace = require("./replace");
var latest_version = "v1.3.3";
var REPLACER = new replace.ReplaceFrontEnd("");
var _rwq;
var re_blank;
var re_crlf_end;
var re_crlf_start;
var is_keep = false;
function keepMoreBlankLine(is) {
    if (is) {
        _rwq = function (all, index) {
            var q = all[0];
            return (q === "`" || q === "\"" || q === "'") ? all : "";
        };
        re_blank = /^[\s]+$|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'/gm;
        re_crlf_end = /[\r\n]+$|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'/gm;
        re_crlf_start = /^[\r\n]|`(?:\\[\s\S]|[^`])*`|"(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'/gm;
    }
    else {
        _rwq = function (all, index) {
            return all[0] === "`" ? all : "";
        };
        re_blank = /^[\s]+$|`(?:\\[\s\S]|[^`])*`/gm;
        re_crlf_end = /[\r\n]+$|`(?:\\[\s\S]|[^`])*`/gm;
        re_crlf_start = /^[\r\n]|`(?:\\[\s\S]|[^`])*`/gm;
    }
    is_keep = is;
}
module.exports = Object.defineProperties(function (source, rm_blank_line_n_ws, is_multi_t) {
    if (rm_blank_line_n_ws === void 0) { rm_blank_line_n_ws = true; }
    if (is_multi_t === void 0) { is_multi_t = false; }
    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }
    var replacer = is_multi_t ? new replace.ReplaceFrontEnd(source) : REPLACER.setSubject(source);
    source = replacer.apply();
    return rm_blank_line_n_ws ? source
        .replace(re_blank, _rwq)
        .replace(re_crlf_end, _rwq)
        .replace(re_crlf_start, _rwq) : source;
}, {
    isKeep: {
        get: function () { return is_keep; },
        enumerable: true,
        configurable: false,
    },
    version: {
        get: function () { return latest_version; },
        enumerable: true,
        configurable: false,
    },
    "keepMoreBlankLine": {
        enumerable: true,
        configurable: false,
        writable: false,
        value: keepMoreBlankLine
    }
});
keepMoreBlankLine(false);
