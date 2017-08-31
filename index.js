"use strict";
const replace = require("./replace");
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
function removeCStyleComments(source, rm_blank_line_n_ws = true) {
    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }
    const replacer = new replace.ReplaceFrontEnd(source);
    source = replacer.apply();
    return rm_blank_line_n_ws ? source.replace(/^[\s]+$/gm, "").replace(/[\r\n]+$/gm, "").replace(/^[\r\n]/gm, "") : source;
}
module.exports = removeCStyleComments;
