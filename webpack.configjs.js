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

// DEVNOTE: 2019-4-30 using "terser-webpack-plugin"
const TerserPlugin = require("terser-webpack-plugin");

const utils = require("./scripts/utils");


const WEBPACK_OUTPUT = "./bin/";

// UglifyJSPlugin option webpack 3.x
//   -> The following results do not seem to apply in webpack 4.x ...(9/9/2018
// NOTE: for js
//   unlike the configuration file for ts file,
//   here, sourcemap is created without specifying both uglifyOptions.sourceMap and devtool option,
//   it seems that it becomes an incomplete sourcemap.
// NOTE: for ts
//   if do not explicitly specify both uglifyOptions.sourceMap and devtool option, the sourcemap was not created...
const uglifyOptions = {
    sourceMap: true,
    mangle: true,
    output: {
        comments: false,
        beautify: true,
        indent_level: 1,
        // ecma: 7,
        max_line_len: 800
    }
};

// sample: https://github.com/s-panferov/awesome-typescript-loader/issues/146#issuecomment-220815050
module.exports = {
    // "production", "development", "none"
    mode: "production",

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
        // library: "rm-cstyle-cmts",

        // https://webpack.js.org/configuration/output/#output-librarytarget
        // https://github.com/webpack/docs/wiki/configuration#outputlibrarytarget
        // https://webpack.github.io/docs/configuration.html#output-librarytarget
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
        extensions: [".js", ".ts"]
    },
    devtool: "source-map", // need this for complete sourcemap.

    plugins: [
        // UglifyJsPlugin is included in webpack. (v3.x
        // new webpack.optimize.UglifyJsPlugin(uglifyOptions), 
        new webpack.ProgressPlugin(
            utils.createWebpackProgressPluginHandler(`./logs/${utils.dateStringForFile()}-webpack.log`, true)
        ),
    ],
    profile: true,
    optimization: {
        // minimize: true
        minimizer: [
            new TerserPlugin({
                // Enable parallelization. Default number of concurrent runs: os.cpus().length - 1.
                parallel: true,
                cache: true,
                // NOTE: The sourceMap setting of uglify in webpack v4,
                // It must be set with option of UglifyJsPlugin instance.
                sourceMap: true,
                terserOptions: uglifyOptions
            }),
            // new UglifyJsPlugin({ uglifyOptions })
        ]
    }
};
