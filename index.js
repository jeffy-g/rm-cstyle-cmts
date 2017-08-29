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

// NOTE: use regexp document: "remove C style comments."
// /(\s*\/\*[\s\S]*?(.*)\*\/\s*$)|(\s*\/\/.*\s*$)|(^[\s]$)|(^[\n])|([\n]$)/gm;
const RE_SOURCE = `
(\\s*\\/\\*[\\s\\S]*?(.*)\\*\\/\\s*$)|  (?# /* */ style block comment)
(\\s*\\/\\/.*\\s*$)|                    (?# // style block comment)
(^[\\s]$)|                              (?# empty lines)
([\\n]$)
`;

// NOTE: replace by regexp document: "use util.getRegexpSource test#3 update simple"
const RE_C_STYLE_COMMENT = new RegExp(RE_SOURCE.replace(/\s*\(\?#.*\)\s*$|#\s.*$|\s+/gm, ""), "gm");
function removeCStyleComments(source) {
    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }
    return source.replace(RE_C_STYLE_COMMENT, "");
}

module.exports = removeCStyleComments;

/**
[tests]

rmc = require("./");
fs = require("fs");

tsc = fs.readFileSync("./big.json", 'utf-8');
console.log(rmc(tsc));

*/
