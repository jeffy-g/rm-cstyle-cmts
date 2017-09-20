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
// webpack config for js file.

const webpack = require("webpack");
const WEBPACK_OUTPUT = "./bin/";

// UglifyJSPlugin option
// NOTE: unlike the configuration file for ts file,
//   here, sourcemap is created without specifying both uglifyjs_options.sourceMap and devtool option,
//   it seems that it becomes an incomplete sourcemap.
const uglifyjs_options = {
    sourceMap: true,
    output: {
        // NOTE: uglifyes allow LF?
        beautify: true, //settings["uglifyes-beautify"],
        indent_level: 1,
        // ecma: 7,
        max_line_len: 800
    }
};

// sample: https://github.com/s-panferov/awesome-typescript-loader/issues/146#issuecomment-220815050
module.exports = {
    target: "node",
    // entry point
    entry: {
        index: "./bin/index.js",
        "bench/index": "./bin/bench/index.js"
    },
    // output config.
    output: {
        path: `${__dirname}/${WEBPACK_OUTPUT}`,
        // overwrite index.js
        filename: "[name].js",
        // https://webpack.js.org/configuration/output/#output-librarytarget
        libraryTarget: "commonjs2"
    },
    // https://webpack.github.io/docs/configuration.html#externals
    externals: [
        // {
        //     a: false, // a is not external
        //     b: true, // b is external (require("b"))
        //     "./c": "c", // "./c" is external (require("c"))
        //     "./d": "var d" // "./d" is external (d)
        // },
        // this is external.
        // see: src/bench/index.ts, import * as rmc from "../";
        //   -> require("../");
        "../" /* reference to ./bin/index.js */
    ],
    resolve: {
        extensions: [".js"]
    },
    devtool: "source-map", // need this for complete sourcemap.
    plugins: [
        // UglifyJsPlugin is included in webpack.
        new webpack.optimize.UglifyJsPlugin(uglifyjs_options),
    ],
};
