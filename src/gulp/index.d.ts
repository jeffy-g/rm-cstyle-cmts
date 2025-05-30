/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2019 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
// <reference types="rm-cstyle-cmts"/>
/// <reference path="../index.d.ts"/>

declare global {
    namespace NsGulpRmc {

        type StreamTransform = import("stream").Transform;
        type File = import("vinyl");
        type TransformCallback = (err?: any, data?: any) => void;
        type FixTransformFunction = (this: StreamTransform, chunk: File, enc: BufferEncoding, callback: TransformCallback) => void;

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
            disableDefaultExtensions?: true;

            /**
             * Whether to record the processing time for each file (replace mode only)
             * @date 2022/4/24
             */
            timeMeasure?: true;

            /**
             * default: {@link EConstants.HWM}
             * @date 2022/5/7
             */
            highWaterMark?: number;
        };

        /**
         * factory of 
         */
        type TTransformerFactory = (options?: NsGulpRmc.TOptions) => StreamTransform;

        type TTimeSpanEntries = Array<(`${number}:${string}`)>;

        const enum EConstants {
            /** highWaterMark */
            HWM = 512, // DEVNOTE: 2022/05/07 - In my PC environment, `4096` seemed to be the best
        }
    }
}

declare const GulpRmc: {
    /**
     * main interface for gulp
     */
    getTransformer: NsGulpRmc.TTransformerFactory;
    /**
     * unprocessed file is recorded
     */
    readonly noopPaths: string[];
    /**
     * get IRemoveCStyleComments interface
     */
    getRmcInterface(): IRemoveCStyleComments;

    getTimeSpans(): NsGulpRmc.TTimeSpanEntries;
};

export = GulpRmc;
