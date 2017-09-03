"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const replace = require("./replace");
const latest_version = "v1.2.4";
const REPLACER = new replace.ReplaceFrontEnd("");
let _rwq;
let re_blank;
let re_crlf_end;
let re_crlf_start;
function setVersion(v) {
    switch (v) {
        case "v1.2.3":
            _rwq = (all, bq, dq, sq, index) => {
                return (bq || dq || sq) ? all : "";
            };
            re_blank = /^[\s]+$|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
            re_crlf_end = /[\r\n]+$|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
            re_crlf_start = /^[\r\n]|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
            break;
        case "v1.2.4":
            _rwq = (all, bq, index) => {
                return bq ? all : "";
            };
            re_blank = /^[\s]+$|(`(?:\\[\s\S]|[^`])*`)/gm;
            re_crlf_end = /[\r\n]+$|(`(?:\\[\s\S]|[^`])*`)/gm;
            re_crlf_start = /^[\r\n]|(`(?:\\[\s\S]|[^`])*`)/gm;
            break;
    }
    module.exports.version = v;
}
function removeCStyleComments(source, rm_blank_line_n_ws = true, is_multi_t = false) {
    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }
    const replacer = is_multi_t ? new replace.ReplaceFrontEnd(source) : REPLACER.setSubject(source);
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
