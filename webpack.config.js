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
// webpack config for ts file.
// need "awesome-typescript-loader"

const webpack = require("webpack");
const WEBPACK_OUTPUT = "./bin/";

// UglifyJSPlugin option
const uglifyjs_options = {
    sourceMap: true,
    output: {
        // NOTE: uglifyes allow LF?
        beautify: true, //settings["uglifyes-beautify"],
        indent_level: 1,
        // ecma: 7,
        max_line_len: 1200
    }
};

// sample: https://github.com/s-panferov/awesome-typescript-loader/issues/146#issuecomment-220815050
module.exports = {
    target: "node",
    // entry point
    entry: "./src/ts/index.ts",
    // output config.
    output: {
        path: `${__dirname}/${WEBPACK_OUTPUT}`,
        filename: "index2.js",
        // https://webpack.js.org/configuration/output/#output-librarytarget
        libraryTarget: "commonjs2"
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                // see: https://github.com/s-panferov/awesome-typescript-loader#the-best-typescript-loader-for-webpack
                loader: "awesome-typescript-loader?target=es5",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".js", '.ts']
    },
    // devtool: "source-map",
    plugins: [
        // UglifyJsPlugin is included in webpack.
      new webpack.optimize.UglifyJsPlugin(uglifyjs_options),
    ],
};
