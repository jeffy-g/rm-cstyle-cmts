/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2017 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file src/index.d.ts
 * @todo Eliminating const enums (v4?)
 */
/// <reference path="./extras.d.ts"/>

declare global {

    /**
     * @since 3.0
     */
    type TRemoveCStyleCommentsOpt = {
        /**
         * Whether collect detected regex
         * @default undefined
         */
        collectRegex?: boolean;
        /**
         * Whether to display an error message
         * 
         * By default, a concise message will be logged when an exception occurs,
         * but setting this option to true will also log an error message.
         * @default undefined
         */
        showErrorMessage?: boolean;

        // - - - - - - - - - - - - - - -
        // replace mode
        // - - - - - - - - - - - - - - -
        /**
         * Whether preserve whitespace and blank lines
         *  + this option is ignored in walk through mode
         * @default undefined
         */
        preserveBlanks?: boolean;

        // - - - - - - - - - - - - - - - - -
        // file path for regex detection
        // - - - - - - - - - - - - - - - - -
        /**
         * If the `collectRegex` option is `true`, the path string and the position in the regex code will be embedded.
         * 
         * + Until now, regex detection was supported, but since there was no information about the detected source code,  
         *   it was not possible to know details such as how regex was used.
         * 
         * + `path`, `position`, `regex` will be the following array type:
         * ```
         * type TDetectedRegexDetails = [path: string, position: `line:${number},column:${number}`, regex: string];
         * ```
         * 
         * NOTE: If no path string is provided, it will be a regex array (previous data)
         * 
         */
        path?: string;
    };

    /**
     * use with `walk` function
     */
    type TWalkThroughOpt = Omit<TRemoveCStyleCommentsOpt, "preserveBlanks">;

    interface IRemoveCStyleCommentsMain {
        /**
         * #### remove c style comments from "source" content.  
         * 
         * step 1:  
         *  - remove line comments, multi line comments.  
         *  - and search the regexp literal. if found then concat it to results. (`collectRegex` option). 
         * 
         * step 2:  
         *  - remove blank line and trailing whitespaces.
         *    if preserve it, set `TRemoveCStyleCommentsOpt.preserveBlanks` to `true`
         * 
         * @param source c style commented text source.
         * @param options see TRemoveCStyleCommentsOpt.
         * @returns if `options.isWalk === true`, returns original string, otherwise returns comment removed string
         * @since 3.0
         */
        (source: string, options?: TRemoveCStyleCommentsOpt): string;
    }
    interface IRemoveCStyleCommentsTypeSig extends IRemoveCStyleCommentsMain {
        /**
         * #### Walk through the `(Java|Type)Script` source content.
         * 
         * @param source c style commented text source.
         * @param options see {@link TWalkThroughOpt}
         * @see {@link EScannerEvent}
         * @since 3.2
         */
        walk(source: string, options?: TWalkThroughOpt): void;
    }
    interface IRemoveCStyleCommentsProperties {
        /** package version */
        readonly version: string;
        /**
         * The number of times the process has been canceled due to an error etc.
         */
        readonly noops: number;
        /**
         * number of times successfully processed
         */
        readonly processed: number;
        /**
         * Whether to keep only jsdoc comments
         *  + this option is ignored in walk through mode
         * @default undefined
         */
        keepJsDoc?: boolean;
    }

    interface IRemoveCStyleComments extends IRemoveCStyleCommentsTypeSig, IRemoveCStyleCommentsProperties {
        /**
         * reset "noops" and "processed".
         */
        reset(): void;
        /**
         * Can refer to the regex literal detected after processing by setting `TRemoveCStyleCommentsOpt.collectRegex` to `true`
         * 
         * ```ts
         * import * as rmc from "rm-cstyle-cmts";
         * const ret = rmc(source, { collectRegex: true });
         * ```
         */
        getDetectedReContext(): TDetectedReContext;
        /**
         * The number of times regex validation was performed
         * @since 3.3.16
         */
        getScannedRegexCount(): number;
        /**
         * listen to the Scan event
         * 
         *  + When single line comment detected {@link EScannerEvent.SingleLineComment}
         *
         *  + When multi line comment detected {@link EScannerEvent.MultiLineComment}
         * 
         * ### how to remove listener
         * ```ts
         * import * as rmc from "rm-cstyle-cmts";
         * 
         * // this indicate revert to default empty listener
         * rmc.setListener();
         * ```
         * 
         * @see {@link EScannerEvent}
         * @since 3.0
         */
        setListener(listener?: IScanEventCallback): void;
    }

    // 2026/1/7 2:49:16
    // type TValidRegExpFlag = "" | "d" | "g" | "s" | "i" | "m" | "u" | "v" | "y";
    type TRegExpString = `/${string}/${string}`; // loose type
    type TLineColumnString = `line:${number},column:${number}`;
    type TDetectedRegexDetails = [path: string, position: TLineColumnString, regex: TRegExpString];

    /**
	 * Context for detected regex literals
     * 
     * sample code:
     * 
     * ```js
     * const { detectedReLiterals } = rmc.getDetectedReContext();
     * detectedReLiterals.forEach(item => {
     *   // Check for string type using type guard
     *   if (typeof item === "string") {
     *     // In this block, item can be treated as a string type.
     *     // (Old format when the path option is not specified)
     *     console.log("Regex string:", item);
     *   } else {
     *     // In this block, item can be treated as a TDetectedRegexDetails type (tuple).
     *     const [path, position, regex] = item;
     *     console.log(`Regex found in ${path} at ${position}:`, regex);
     *   }
     * });
	 */
    type TDetectedReContext = {
        uniqReLiterals: string[];
        detectedReLiterals: Array<string | TDetectedRegexDetails>;
    };

    /**
     * 
     */
    const enum EScannerEvent {
        SingleLineComment,
        MultiLineComment
    }
    /**
     * @since 3.1
     */
    type TScannerEventContext = {
        /**
         *  currently supported `ScannerEvent.SingleLineComment` and `ScannerEvent.MultiLineComment`
         */
        event: EScannerEvent;
        /**
         * Is the detected string from original source
         */
        fragment: string;
        /**
         * fragment start offset from original source
         */
        offset: number;
    };

    /**
     *  + replace mode - If it returns `true`, it is concatenated to the resulting source, otherwise it is deleted
     *
     *  + walk through mode - If returns `true`, proceed walk through, otherwise stop that
     * 
     * @since 3.1
     * @see {@link TScannerEventContext}
     */
    interface IScanEventCallback {
        (context: TScannerEventContext): boolean;
    }

    /**
     * umd module
     */
    const Rmc: IRemoveCStyleComments;
}

export = Rmc;
