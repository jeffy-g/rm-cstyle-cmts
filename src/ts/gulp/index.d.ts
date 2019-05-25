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
*/
// @ts-ignore 
///<reference types="rm-cstyle-cmts"/>

import * as through from "through2";

declare type GulpRmcOptions = {
    /**
     * remove blank line and whitespaces, default is `true`.
     */
    remove_ws?: boolean;
    /**
     * log file path(relative) currently being processed.
     * 
     * ```
[processed: 1123, noops: 0]: ${path}
     * ```
     */
    render_progress?: boolean;
    /**
     * want report regex literal evaluation error? default is `undefined`
     */
    report_re_error?: boolean;
};

declare type TransformerFactory = (options: GulpRmcOptions) => ReturnType<typeof through>;

declare const GulpRmc: {
    /**
     * main interface for gulp
     */
    getTransformer: TransformerFactory;
    /**
     * unprocessed file is recorded
     */
    readonly noopPaths: string[];
    /**
     * get IRemoveCStyleComments interface
     */
    getRmcInterface(): IRemoveCStyleComments;
};

export = GulpRmc;
