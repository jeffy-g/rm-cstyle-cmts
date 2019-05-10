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
    remove_ws?: boolean;
    report_re_error?: boolean;
    render_progress?: boolean;
};
declare type TransfomerFactory = (options: GulpRmcOptions) => ReturnType<typeof through>;
declare const GulpRmc: {
    getTransformer: TransfomerFactory;
    readonly noopPaths: string[];
    getRmcInterface(): IRemoveCStyleComments;
};
export = GulpRmc;
