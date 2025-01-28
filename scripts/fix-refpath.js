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
const referencePathRegex = /(?<=<reference\spath=")\..?\/(?=index\.d\.ts)/;
/**
 * @typedef {typeof Transform.prototype._transform} TTransformFunction Transform.prototype._transform
 */

/**
 * A Transform stream that fixes TypeScript reference paths.
 */
class TsReferencePathFixer extends Transform {
    /**
     * Transforms the input data by fixing the TypeScript reference paths.
     * @param {Parameters<TTransformFunction>[0]} data - The chunk of data to be transformed.
     * @param {Parameters<TTransformFunction>[1]} _encoding - The encoding type (not used).
     * @param {Parameters<TTransformFunction>[2]} callback - The callback function to be called after transformation.
     */
    _transform(data, _encoding, callback) {
        const source = data.toString();
        const replacement = /namespace NsGulpRmc/.test(source) ? "../../" : "../";
        callback(null, source.replace(referencePathRegex, replacement));
    }
}

/**
 * Creates a transform stream to fix TypeScript reference paths.
 * @returns {TsReferencePathFixer} A transform stream to fix TypeScript reference paths.
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
