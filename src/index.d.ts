/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2017 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/

declare global {

    /**
     * @since 3.0
     */
    type TRemoveCStyleCommentsOpt = {
        /**
         * Whether collect detected regex
         * @default undefined
         */
        collectRegex?: true;
        /**
         * Whether to display an error message
         * 
         * By default, a concise message will be logged when an exception occurs,
         * but setting this option to true will also log an error message.
         * @default undefined
         */
        showErrorMessage?: true;

        // - - - - - - - - - - - - - - -
        // replace mode
        // - - - - - - - - - - - - - - -
        /**
         * Whether preserve whitespace and blank lines
         *  + this option is ignore on walk through mode
         * @default undefined
         */
        preserveBlanks?: true;
    };

    /**
     * use with `walk` function
     */
    type TWalkThroughOpt = Omit<TRemoveCStyleCommentsOpt, "preserveBlanks">;

    interface IRemoveCStyleCommentsMain {
        /**
         * #### remove c style comments form "source" content.  
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
         * listen the Scan event
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
         * @see EScannerEvent
         * @since 3.0
         */
        setListener(listener?: IScanEventCallback): void;
    }

    /**
	 *
	 */
    type TDetectedReContext = {
        detectedReLiterals: string[];
        uniqReLiterals: string[];
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
