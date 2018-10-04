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

// extend "webpack.configjs".
const webpackConfig = require("./webpack.configjs");

webpackConfig.entry = {
    index: "./src/ts/index.ts",
    "bench/index": "./src/ts/bench/index.ts"
};
webpackConfig.module = {
    rules: [
        {
            test: /\.tsx?$/,
            // see: https://github.com/s-panferov/awesome-typescript-loader#the-best-typescript-loader-for-webpack
            loader: "awesome-typescript-loader",
            exclude: /node_modules/
        }
    ]
};

module.exports = webpackConfig
