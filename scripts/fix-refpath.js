/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const Transform = require("stream").Transform;

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
const re = /(?<=<reference\spath=")\..?\/(?=index\.d\.ts)/;
/**
 * @typedef {typeof Transform.prototype._transform} TTransformFunction Transform.prototype._transform
 */

/**
 * 
 */
class TsReferencePathFixer extends Transform {
    /**
     * 
     * @param {Parameters<TTransformFunction>[0]} data 
     * @param {Parameters<TTransformFunction>[1]} _encoding 
     * @param {Parameters<TTransformFunction>[2]} callback 
     */
    _transform(data, _encoding, callback) {
        const source = data.toString();
        const replacement = /namespace NsGulpRmc/.test(source)? "../../": "../";
        callback(null, source.replace(re, replacement));
    }
}

/**
 * Creates a transform stream to convert data to upper cases.
 * @returns {TsReferencePathFixer} A transform stream to convert data to upper cases.
 */
function fixTsReferencePath() {
    return new TsReferencePathFixer();
}

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------
if (require.main === module) {
    process.stdin.pipe(fixTsReferencePath()).pipe(process.stdout);
} else {
    module.exports = fixTsReferencePath;
}
