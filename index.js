"use strict";
var RE_SOURCE = "\n(\\s*\\/\\*[\\s\\S]*?(.*)\\*\\/(?:\\s*$|\\s*))| (?# /* */ style block comment)\n(\\s*\\/\\/.*\\s*$)|                            (?# // style line comment)\n(^[\\s]$)|                                      (?# empty lines)\n(^[\\n])\n";
var RE_C_STYLE_COMMENT = new RegExp(RE_SOURCE.replace(/\s*\(\?#.*\)\s*$|#\s.*$|\s+/gm, ""), "gm");
/**
 * remove c style comments form "source" content.
 * @param {string} source c style commented text source.
 * @param {boolean} is_multi_process_use multi thread like?
 */
function removeCStyleComments(source, is_multi_process_use) {
    if (is_multi_process_use === void 0) { is_multi_process_use = false; }
    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }
    var re = !is_multi_process_use ? RE_C_STYLE_COMMENT : new RegExp(RE_C_STYLE_COMMENT.source, "gm");
    var m;
    while (m = re.exec(source)) {
        var left = source.substring(0, m.index);
        var right = source.substring(m.index + m[0].length);
        source = left + right;
        re.lastIndex = m.index;
    }
    return source;
}
module.exports = removeCStyleComments;
