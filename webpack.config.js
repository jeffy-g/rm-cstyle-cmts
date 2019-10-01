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
// webpack config for ts file.

// DEVNOTE: 2019-4-30
// "awesome-typescript-loader" is no longer maintenance.
// so now, use "ts-loader"

// extend "webpack.configjs".
const webpackConfig = require("./webpack.configjs");

// web
webpackConfig[0].entry = {
    index: "./src/ts/index.ts"
};
// node
webpackConfig[1].entry = {
    index: "./src/ts/index.ts",
    "bench/index": "./src/ts/bench/index.ts"
};
// web, node
webpackConfig[0].module = webpackConfig[1].module = {
    rules: [
        {
            test: /\.ts$/,
            loader: "ts-loader",
            exclude: /node_modules/
        }
    ]
};

module.exports = webpackConfig
