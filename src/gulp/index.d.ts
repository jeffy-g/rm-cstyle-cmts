/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2019 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
// <reference types="rm-cstyle-cmts"/>
/// <reference path="../index.d.ts"/>

import * as through2 from "through2";
type StreamTransform = typeof import("stream")["Transform"]["prototype"];
type File = typeof import("vinyl")["prototype"];


declare global {
    /**
     * 
     */
    namespace GulpRmc {
        /**
         * 
         */
         type FixTransformFunction = (this: StreamTransform, chunk: File, enc: BufferEncoding, callback: through2.TransformCallback) => void;
        /**
         * gulp-rm-cmts option type
         */
        type TOptions = {
            /**
             * keep blank line and whitespaces, default is `undefined`.
             */
            preserveBlanks?: true;
            /**
             * log scan source path(relative) currently being processed.
             * 
             * ```
             * [processed: 1123, noops: 0]: ${path}
             * ```
             */
            renderProgress?: true;
            /**
             * want collect regex?
             */
            collectRegex?: true;

            /**
             * Whether to run in walkthrough mode
             * @since 3.1
             */
            isWalk?: true;

            /**
             * Add additional extensions
             * @date 2020/6/7
             */
            extraExtensions?: string[];

            /**
             * #### disable Default Extentions
             * 
             * + use `extraExtensions` only, instaed of `defaultExtensions`
             * 
             * ```js
             * const defaultExtensions = [
             *     ".js", ".jsx", ".ts", ".tsx", ".cjs", ".mjs", ".cts", ".mts"
             * ];
             * ```
             * see {@link TOptions.extraExtensions extraExtensions}
             * 
             * @date 2022/4/7
             */
            disableDefaultExtentions?: true;

            /**
             * Whether to record the processing time for each file (replace mode only)
             * @date 2022/4/24
             */
            timeMeasure?: true;
        };

        /**
         * factory of 
         */
        type TTransformerFactory = (options: GulpRmc.TOptions) => ReturnType<typeof through2>;

        type TTimeSpanEntry = Array<(`${number}:${string}`)>;
    }
}

declare const GulpRmc: {
    /**
     * main interface for gulp
     */
    getTransformer: GulpRmc.TTransformerFactory;
    /**
     * unprocessed file is recorded
     */
    readonly noopPaths: string[];
    /**
     * get IRemoveCStyleComments interface
     */
    getRmcInterface(): IRemoveCStyleComments;

    getTimeSpans(): GulpRmc.TTimeSpanEntry;
};

export = GulpRmc;
