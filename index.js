/*
-----------------------------------------------------------------------

Copyright 2017 motrohi

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

------------------------------------------------------------------------
*/

// NOTE: regex source for readability.
const RE_SOURCE = `
(\\s*\\/\\*[\\s\\S]*?(.*)\\*\\/(?:\\s*$|\\s*))| (?# /* */ style block comment)
(\\s*\\/\\/.*\\s*$)|                            (?# // style block comment)
(^[\\s]$)|                                      (?# empty lines)
(^[\\n])
`;

// NOTE: remove unnecessaries.
const RE_C_STYLE_COMMENT = new RegExp(RE_SOURCE.replace(/\s*\(\?#.*\)\s*$|#\s.*$|\s+/gm, ""), "gm");

// function removeCStyleComments(source) {
//     if (typeof source !== "string") {
//         throw new TypeError("invalid text content!");
//     }
//     return source.replace(RE_C_STYLE_COMMENT, "");
// }
/**
 * remove c style comments form "source" content.
 * @param {string} source c style commented text source.
 */
function rm_cs_c2(source) {
    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }

    const re = RE_C_STYLE_COMMENT;
    let m; // RegExpExecArray
    while (m = re.exec(source)) {
        let left = source.substring(0, m.index);
        let right = source.substring(m.index + m[0].length);
        source = left + right;
        re.lastIndex = m.index;
    }
    return source;
}

module.exports = rm_cs_c2;
