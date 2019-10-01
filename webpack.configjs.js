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
// @ts-check
const path = require("path");

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
const terserOptions = {
    sourceMap: true,
    mangle: true,
    output: {
        comments: false,
        beautify: true,
        indent_level: 1,
        // ecma: 9,
        max_line_len: 800,
        /**
        @example
        export enum OutputQuoteStyle {
            PreferDouble = 0,
            AlwaysSingle = 1,
            AlwaysDouble = 2,
            AlwaysOriginal = 3
        }
         */
        quote_style: 3
    }
};

/** @typedef {import("webpack").Configuration} WebpackConfigration */

/**
 * 
 * @param {WebpackConfigration["target"]} target 
 * @param {WebpackConfigration["entry"]} entry 
 * @param {WebpackConfigration["output"]} output 
 * @return {WebpackConfigration}
 */
const createWebpackConfig = (
    target, entry, output,
) =>  {
    return {
        // "production", "development", "none"
        mode: "production",
        // "web", "node"
        target,
        // entry point
        entry,
        // output config.
        output,
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
        devtool: "cheap-source-map", // "source-map" -> need this for complete sourcemap.
    
        plugins: [
            // UglifyJsPlugin is included in webpack. (v3.x
            // new webpack.optimize.UglifyJsPlugin(uglifyOptions), 
            new webpack.ProgressPlugin(
                utils.createWebpackProgressPluginHandler(/*`./logs/${utils.dateStringForFile()}-webpack.log`*/)
            ),
        ],
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
                    // @ts-ignore ignore type definition mistake(max_line_len)
                    terserOptions
                })
            ]
        },
        profile: true,
        cache: true,
        // CHANGES: 2019/9/22 - Setting recordsPath will essentially set recordsInputPath and recordsOutputPath to the same location.
        //   This is usually all that's necessary unless you decide to change the name of the file containing the records.
        //   - see https://webpack.js.org/configuration/other-options/#recordspath
        recordsPath: path.join(__dirname, "./logs/webpack-module-ids.json"),
        // recordsInputPath: path.join(__dirname, `./logs/${utils.dateStringForFile()}-records.json`),
        // recordsOutputPath: path.join(__dirname, `./logs/${utils.dateStringForFile()}-newRecords.json`)
    };
};

// sample: https://github.com/s-panferov/awesome-typescript-loader/issues/146#issuecomment-220815050
module.exports = [
    createWebpackConfig(
        /* target */ "web",
        /* entry */ {
            index: "./bin/index.js"
        },
        // output config.
        /* output */ {
            path: `${__dirname}/${WEBPACK_OUTPUT}/web/`,
            // overwrite index.js
            filename: "[name].js",
            library: "Rmc",
            // https://webpack.js.org/configuration/output/#outputlibrarytarget
            // https://github.com/webpack/docs/wiki/configuration#outputlibrarytarget
            libraryTarget: "var"
        }
    ),
    createWebpackConfig(
        /* target */ "node",
        /* entry */ {
            index: "./bin/index.js",
            "bench/index": "./bin/bench/index.js"
        },
        // output config.
        /* output */ {
            path: `${__dirname}/${WEBPACK_OUTPUT}`,
            // overwrite index.js
            filename: "[name].js",
            libraryTarget: "commonjs2"
        }
    ),
];
