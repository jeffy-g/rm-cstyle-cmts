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
/**
 */
// use "rm-cstyle-cmts"
const rmc = require("../bin/");
// const rmc = require("rm-cstyle-cmts");

// gulp plugin name.
const PLUGIN_NAME = "gulp-rm-cmts";

const through = require("through2");
const PluginError = require("plugin-error");

/**
 * remove_ws: default is true;
 * @param { { remove_ws?: boolean, report_re_error?: boolean } } options
 */
module.exports = function (options) {
    options = options || {};
    // default is true;
    const rm_ws = typeof options.remove_ws === "boolean"? options.remove_ws: true;
    /**
     * @this {Transform}
     */
    const transform = function (file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isStream()) {
            this.emit("error", new PluginError(PLUGIN_NAME, 'Streams not supported!'));
        }
        // plugin main
        if (file.isBuffer()) {
            const contents = rmc(file.contents.toString(), rm_ws, options.report_re_error);
            // Deprecated
            // file.contents = new Buffer(contents);
            // node ^v5.10.0
            file.contents = Buffer.from(contents);
            // // node ^v5.10.0
            // const buf = Buffer.alloc(contents.length);
            // /* const len = */ buf.write(contents, 0);
            // file.contents = buf;
            return callback(null, file);
        }
        this.push(file);
        callback();
    };
    return through.obj(transform);
};
