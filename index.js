"use strict";
var replace = require("./replace");
var _rwq = function (all, bq, dq, sq, index) {
    if (bq || dq || sq) {
        return all;
    }
    return "";
};
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
 */
function removeCStyleComments(source, rm_blank_line_n_ws) {
    if (rm_blank_line_n_ws === void 0) { rm_blank_line_n_ws = true; }
    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }
    var replacer = new replace.ReplaceFrontEnd(source);
    source = replacer.apply();
    return rm_blank_line_n_ws ? source
        .replace(/^[\s]+$|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm, _rwq)
        .replace(/[\r\n]+$|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm, _rwq)
        .replace(/^[\r\n]|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"])*")|('(?:\\[\s\S]|[^'])*')/gm, _rwq) : source;
}
module.exports = removeCStyleComments;
