/*
-----------------------------------------------------------------------

Copyright 2017 motrohi hirotom1107@gmail.com

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
const rmc = require("../bin/");
// use "rm-cstyle-cmts"
// const rmc = require("rm-cstyle-cmts");

const through = require("through2");
const PluginError = require("plugin-error");

const readline = require("readline");

// gulp plugin name.
const PLUGIN_NAME = "gulp-rm-cmts";


/**
 * 
 * @param path 
 */
const progress = (path) => {
    const output = process.stderr;
    // clear the current line
    readline.clearLine(output, 0);
    readline.cursorTo(output, 0/* , void 0 */);
    // write the message.
    output.write(`[processed: ${rmc.processed}, noops: ${rmc.noops}]: ${path}`);
};


/**
 * define need types
 * 
 * @typedef {typeof import("stream")} stream
 * @typedef {typeof import("vinyl")} Vinyl
 * 
 * @typedef {Parameters<typeof through.obj>[0]} TransformFunction
 * @typedef {Parameters<TransformFunction>[2]} TransformCallback
 */
"";

/**
 * @type {string[]}
 */
const noopPaths = [];

/**
 * @typedef  {object} GulpRmcOptions
 * @property {boolean} [remove_ws] remove blank line and whitespaces, default is `true`
 * @property {boolean} [report_re_error] want regex detect error report? default is `undefined`
 * @property {boolean} [render_progress] print current processing file path. default is `undefined`
 */
const getTransformer = /** @type {(options: GulpRmcOptions) => ReturnType<typeof through>} */(options) => {

    options = options || {};
    // default is true;
    const rm_ws = typeof options.remove_ws === "boolean"? options.remove_ws: true;
    const render_progress = !!options.render_progress;

    render_progress && console.log("rm-cstyle-cmts::", {
        version: rmc.version,
        avoidMinified: rmc.avoidMinified
    });

    let prev_noops = rmc.noops;
    /**
     * @type {(this: stream["Transform"]["prototype"], file: Vinyl["prototype"], enc: string, callback: TransformCallback) => void}
     */
    const transform = function (vinyl, encoding, callback) {
        if (vinyl.isNull()) {
            return callback(null, vinyl);
        }
        if (vinyl.isStream()) {
            this.emit("error", new PluginError(PLUGIN_NAME, 'Streams not supported!'));
        }
        // plugin main
        if (vinyl.isBuffer()) {

            const shortPath = vinyl.relative;
            render_progress && progress(shortPath);
            // render_progress && progress(chunk.history[0]);
            const contents = rmc(vinyl.contents.toString(), rm_ws, options.report_re_error);

            let noops = rmc.noops;
            if (prev_noops !== noops) {
                noopPaths.push(shortPath);
                prev_noops = noops;
            }

            // Deprecated
            // file.contents = new Buffer(contents);
            // node ^v5.10.0
            vinyl.contents = Buffer.from(contents);
            // // node ^v5.10.0
            // const buf = Buffer.alloc(contents.length);
            // /* const len = */ buf.write(contents, 0);
            // file.contents = buf;
            return callback(null, vinyl);
        }

        this.push(vinyl);
        callback();
    };

    return through.obj(transform);
};

module.exports = {
    getTransformer,
    /**
     * number of times successfully processed
     */
    get processed() {
        return rmc.processed;
    },
    /**
     * number of times the process was bypassed because the line was too long
     */
    get noops() {
        return rmc.noops;
    },
    /**
     * get a list of paths whose processing has been bypassed
     */
    get noopPaths() {
        return noopPaths;
    },
    /**
     * @param {number} max_line_len
     */
    set avoidMinified(max_line_len) {
        rmc.avoidMinified = max_line_len;
    },
    reset() {
        rmc.reset();
    }
};
