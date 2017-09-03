"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var replace = require("./replace");
var latest_version = "v1.2.4";
var REPLACER = new replace.ReplaceFrontEnd("");
var _rwq;
var re_blank;
var re_crlf_end;
var re_crlf_start;
function setVersion(v) {
    switch (v) {
        case "v1.2.3":
            _rwq = function (all, bq, dq, sq, index) {
                return (bq || dq || sq) ? all : "";
            };
            re_blank = /^[\s]+$|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
            re_crlf_end = /[\r\n]+$|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
            re_crlf_start = /^[\r\n]|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
            break;
        case "v1.2.4":
            _rwq = function (all, bq, index) {
                return bq ? all : "";
            };
            re_blank = /^[\s]+$|(`(?:\\[\s\S]|[^`])*`)/gm;
            re_crlf_end = /[\r\n]+$|(`(?:\\[\s\S]|[^`])*`)/gm;
            re_crlf_start = /^[\r\n]|(`(?:\\[\s\S]|[^`])*`)/gm;
            break;
    }
    module.exports.version = v;
}
function removeCStyleComments(source, rm_blank_line_n_ws, is_multi_t) {
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
}
;
setVersion(latest_version);
module.exports = removeCStyleComments;
module.exports.setVersion = setVersion;
module.exports.version = latest_version;
