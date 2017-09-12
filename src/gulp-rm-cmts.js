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
///<reference path="..\bin\index.d.ts"/>
/**
 * @type {IRemoveCStyleCommentsModule}
 */
// use "rm-cstyle-cmts"
var rmc = require("rm-cstyle-cmts");
// gulp plugin name.
var PLUGIN_NAME = "gulp-rm-cmts";

var through = require("through2");
var PluginError = require("gulp-util").PluginError;

module.exports = function (options) {
    options = options || {};
    const rm_ws = !!options.remove_ws;
    const multi_use = !!options.multi_use;
    /**
     * @this {Transform}
     */
    var transform = function (file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isStream()) {
            this.emit("error", new PluginError(PLUGIN_NAME, 'Streams not supported!'));
        }
        // plugin main
        if (file.isBuffer()) {
            var contents = rmc(file.contents.toString(), rm_ws, multi_use);
            file.contents = new Buffer(contents);
            return callback(null, file);
        }
        this.push(file);
        callback();
    };
    return through.obj(transform);
};
