"use strict";
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
const rmc = require("../bin/");
const through = require("through2");
const readline = require("readline");
const PLUGIN_NAME = "gulp-rm-cmts";
const progress = (path) => {
    const output = process.stderr;
    readline.clearLine(output, 0);
    readline.cursorTo(output, 0);
    output.write(`[processed: ${rmc.processed}, noops: ${rmc.noops}]: ${path}`);
};
const noopPaths = [];
const defaultExtensions = [
    ".js", ".jsx", ".ts", ".tsx",
];
const getTransformer = (options) => {
    options = options || {};
    const rm_ws = typeof options.remove_ws === "boolean" ? options.remove_ws : true;
    const render_progress = !!options.render_progress;
    render_progress && console.log("rm-cstyle-cmts::", {
        version: rmc.version,
        avoidMinified: rmc.avoidMinified
    });
    let prev_noops = rmc.noops;
    const transform = function (vinyl, encoding, callback) {
        if (vinyl.isNull()) {
            return callback(null, vinyl);
        }
        if (vinyl.isBuffer()) {
            if (defaultExtensions.includes(vinyl.extname)) {
                const shortPath = vinyl.relative;
                render_progress && progress(shortPath);
                const contents = rmc(vinyl.contents.toString(), rm_ws, options.report_re_error);
                let noops = rmc.noops;
                if (prev_noops !== noops) {
                    noopPaths.push(shortPath);
                    prev_noops = noops;
                }
                vinyl.contents = Buffer.from(contents);
            }
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
module.exports = {
    getTransformer,
    get noopPaths() {
        return noopPaths;
    },
    getRmcInterface() {
        return rmc;
    },
};
