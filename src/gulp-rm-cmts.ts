/*!
-----------------------------------------------------------------------

Copyright 2019 jeffy-g hirotom1107@gmail.com

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
const rmc = require("rm-cstyle-cmts");
*/
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import * as rmc from "../bin/";
// use "rm-cstyle-cmts"
// import * as rmc from "rm-cstyle-cmts";

import * as through from "through2";
import * as readline from "readline";

// gulp plugin name.
const PLUGIN_NAME = "gulp-rm-cmts";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
type stream = typeof import("stream");
type Vinyl = typeof import("vinyl");

/**
 * 
 */
type FixTransformFunction = (this: stream["Transform"]["prototype"], chunk: Vinyl["prototype"], enc: string, callback: through.TransformCallback) => void;

/**
 * gulp-rm-cmts option type
 */
type GulpRmcOptions = {
    remove_ws?: boolean;
    report_re_error?: boolean;
    render_progress?: boolean;

    // want extras?
    // extra_extensions: string[];
};
/**
 * factory of 
 */
type TransformerFactory = (options: GulpRmcOptions) => ReturnType<typeof through>;


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * 
 * @param path 
 */
const progress = (path: string) => {
    const output = process.stderr;
    // clear the current line
    readline.clearLine(output, 0);
    readline.cursorTo(output, 0/* , void 0 */);
    // write the message.
    output.write(`[processed: ${rmc.processed}, noops: ${rmc.noops}]: ${path}`);
};
// const progress = (path: string) => {
//     setTimeout((path: string) => {
//         const output = process.stderr;
//         // clear the current line
//         readline.clearLine(output, 0);
//         readline.cursorTo(output, 0/* , void 0 */);
//         // write the message.
//         output.write(`[processed: ${rmc.processed}, noops: ${rmc.noops}]: ${path}`);
//     }, 10, path);
// };
/**
 * 
 */
const noopPaths: string[] = [];

const defaultExtensions = [
    ".js", ".jsx", ".ts", ".tsx",
];
/**
 * 
 */
const getTransformer: TransformerFactory = (options) => {

    options = options || {};
    // default is true;
    const rm_ws = typeof options.remove_ws === "boolean"? options.remove_ws: true;
    const render_progress = !!options.render_progress;

    render_progress && console.log("rm-cstyle-cmts:", {
        version: rmc.version,
        avoidMinified: rmc.avoidMinified
    });

    let prev_noops = rmc.noops;
    /**
     * 
     */
    // @ts-ignore unused parameter "encoding"
    const transform: FixTransformFunction = function (vinyl, encoding, callback) {

        // plugin main
        if (vinyl.isBuffer()) {

            if (defaultExtensions.includes(vinyl.extname)) {

                // const shortPath = vinyl.relative;
                render_progress && progress(vinyl.relative);

                const contents = rmc(vinyl.contents.toString(), rm_ws, options.report_re_error);
                // let contents: string | undefined;
                // try {
                //     contents = rmc(vinyl.contents.toString(), rm_ws, options.report_re_error);
                // } catch (e) {
                //     console.warn("[Exception occured] The input source will be returned without any processing.");
                //     return callback(null, vinyl);
                // }

                let noops = rmc.noops;
                if (prev_noops !== noops) {
                    noopPaths.push(vinyl.relative);
                    prev_noops = noops;
                }

                // Deprecated
                // file.contents = new Buffer(contents);

                // // node ^v5.10.0
                // const buf = Buffer.alloc(contents.length);
                // /* const len = */ buf.write(contents, 0);
                // file.contents = buf;

                // node ^v5.10.0
                vinyl.contents = Buffer.from(contents);
            }

            return callback(null, vinyl);
        }

        if (vinyl.isNull()) {
            return callback(null, vinyl);
        }

        if (vinyl.isStream()) {
            this.emit("error", new TypeError(`[${PLUGIN_NAME}]: Streams not supported!`));
        }

        this.push(vinyl);
        callback();
    };

    return through.obj(transform);
};

export = {

    getTransformer,
    /**
     * get a list of paths whose processing has been bypassed
     */
    get noopPaths() {
        return noopPaths;
    },
    /**
     * get IRemoveCStyleComments interface
     */
    getRmcInterface() {
        return rmc;
    },
};
