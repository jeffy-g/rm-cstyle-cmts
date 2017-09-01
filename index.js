"use strict";
var replace = require("./replace");
var _rwq = function (all, bq, dq, sq, index) {
    return (bq || dq || sq) ? all : "";
};
var re_blank = /^[\s]+$|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
var re_crlf_end = /[\r\n]+$|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
var re_crlf_start = /^[\r\n]|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm;
var REPLACER = new replace.ReplaceFrontEnd("");
/**
 * #### remove c style comments form "source" content.  
 * 
 * step 1:  
 *  - remove line comments, multi line comments.  
 *  - and search the regexp literal. if found then concat it to results.  
 * 
 * step 2:  
 *  - remove whitespaces.(if need, see @param rm_blank_line_n_ws
 * 
 * @param {string} source c style commented text source.
 * @param {boolean} rm_blank_line_n_ws remove black line and whitespaces, default is "true".
 * @param {boolean} is_multi_t use multi process?, default is "false".
 */
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
module.exports = removeCStyleComments;
