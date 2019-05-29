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
*/
// original name: gulp-rm-cmts.ts
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import * as rmc from "../";
// import * as rmc from "rm-cstyle-cmts";

import * as through from "through2";
import * as readline from "readline";

// gulp plugin name.
const PLUGIN_NAME = "gulp-rm-cmts";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
type stream = typeof import("stream");
type Vinyl = typeof import("vinyl")["prototype"];

/**
 * 
 */
type FixTransformFunction = (this: stream["Transform"]["prototype"], chunk: Vinyl, enc: string, callback: through.TransformCallback) => void;

/**
 * gulp-rm-cmts option type
 */
type GulpRmcOptions = {
    /**
     * remove blank line and whitespaces, default is `true`.
     */
    remove_ws?: boolean;
    /**
     * log file path(relative) currently being processed.
     * 
     * ```
[processed: 1123, noops: 0]: ${path}
     * ```
     */
    render_progress?: boolean;
    /**
     * want report regex literal evaluation error? default is `undefined`
     */
    report_re_error?: boolean;

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
const stdProgress = (path: string) => {
    const output = process.stderr;
    // clear the current line
    readline.clearLine(output, 0);
    readline.cursorTo(output, 0/* , void 0 */);
    // write the message.
    output.write(`[processed: ${rmc.processed}, noops: ${rmc.noops}]: ${path}`);
};

// process.env.CI = "1";
/**
 * 
 * @param path 
 */
const progress = process.env.CI? (() => {
    let count = 0;
    // @ts-ignore 
    return (path: string) => {
        count++;
        (count % 100) === 0 && process.stderr.write(".");
        // write the message.
        (count % 10000) === 0 && process.stderr.write("\n");
    }
})(): stdProgress;

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
    //
    // async/await: node ^v7.6
    //
    // const processBuffer = (vinyl: Vinyl["prototype"], callback: through.TransformCallback) => {
    //     if (defaultExtensions.includes(vinyl.extname)) {
    //         render_progress && progress(vinyl.relative);
    //         const contents = rmc(vinyl.contents!.toString(), rm_ws, options.report_re_error);
    // 
    //         let noops = rmc.noops;
    //         if (prev_noops < noops) {
    //             noopPaths.push(vinyl.relative);
    //             prev_noops = noops;
    //         }
    //    
    //         vinyl.contents = Buffer.from(contents);
    //     }
    //     callback(null, vinyl);
    // };
    /**
     * 
     */
    // @ts-ignore unused parameter "encoding"
    const transform: FixTransformFunction = function (vinyl, encoding, callback) {

        // plugin main
        if (vinyl.isBuffer()) {

            //
            // DEVNOTE: 2019-5-29 - In node v12.3.1, performance of Promise seems like a little good
            //
            //  Promise: node.js ^4.x
            //
            //  + case: new Promise<void>(resolve ...
            //    * [batch-rmc-test]: 53686.879ms (around 54sec
            //
            //  + case: Promise.resolve ...
            //    * [batch-rmc-test]: 54134.899ms (around 54?sec
            //
            //  + case: (async () => { ... })();
            //    * [batch-rmc-test]: 55115.755ms (around 55sec
            //
            //  + case: async processBuffer(...)
            //    * [batch-rmc-test]: 56440.156ms (around 56sec
            //
            //  + case: processBuffer(...)
            //    * [batch-rmc-test]: 55699.446ms (around 56sec
            //
            //  + case: { ... }
            //    * [batch-rmc-test]: 54761.144ms (around 54sec
            //
            // new Promise<void>(resolve => {
            //     if (defaultExtensions.includes(vinyl.extname)) {
            //         // const shortPath = vinyl.relative;
            //         render_progress && progress(vinyl.relative);
            //         const contents = rmc(vinyl.contents.toString(), rm_ws, options.report_re_error);
            // 
            //         let noops = rmc.noops;
            //         if (prev_noops < noops) {
            //             noopPaths.push(vinyl.relative);
            //             prev_noops = noops;
            //         }
            //    
            //         vinyl.contents = Buffer.from(contents);
            //     }
            //     callback(null, vinyl);
            //     resolve();
            // });
            // Promise.resolve(() => {
            //     if (defaultExtensions.includes(vinyl.extname)) {
            //         // const shortPath = vinyl.relative;
            //         render_progress && progress(vinyl.relative);
            //         const contents = rmc(vinyl.contents.toString(), rm_ws, options.report_re_error);
            // 
            //         let noops = rmc.noops;
            //         if (prev_noops < noops) {
            //             noopPaths.push(vinyl.relative);
            //             prev_noops = noops;
            //         }
            //    
            //         vinyl.contents = Buffer.from(contents);
            //     }
            //     callback(null, vinyl);
            // }).then(fn => fn());
            // (async () => {
            //     if (defaultExtensions.includes(vinyl.extname)) {
            //         // const shortPath = vinyl.relative;
            //         render_progress && progress(vinyl.relative);
            //         const contents = rmc(vinyl.contents.toString(), rm_ws, options.report_re_error);
            // 
            //         let noops = rmc.noops;
            //         if (prev_noops < noops) {
            //             noopPaths.push(vinyl.relative);
            //             prev_noops = noops;
            //         }
            //
            //         vinyl.contents = Buffer.from(contents);
            //     }
            //     callback(null, vinyl);
            // })();

            //processBuffer(vinyl, callback);

            if (defaultExtensions.includes(vinyl.extname)) {
                render_progress && progress(vinyl.relative);
                const contents = rmc(vinyl.contents!.toString(), rm_ws, options.report_re_error);
                let noops = rmc.noops;
                if (prev_noops < noops) {
                    noopPaths.push(vinyl.relative);
                    prev_noops = noops;
                }
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
     * unprocessed file is recorded
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
