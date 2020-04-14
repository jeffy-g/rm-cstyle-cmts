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
declare global {
    interface IRemoveCStyleCommentsTypeSig {
        /**
         * #### remove c style comments form "source" content.  
         * 
         * step 1:  
         *  - remove line comments, multi line comments.  
         *  - and search the regexp literal. if found then concat it to results.  
         * 
         * step 2:  
         *  - remove blank line and trailing whitespaces.(if need, see @param rm_blank_line_n_ws
         * 
         * @param {string} source c style commented text source.
         * @param {boolean} [rm_blank_line_n_ws] remove blank line and trailing whitespaces, default is `true`.
         * @param {boolean} [report_regex_evaluate_error] want report regex literal evaluation error? default is `undefined`
         */
        (
            source: string,
            rm_blank_line_n_ws?: boolean,
            /**
             * NOTE:
             *  + Once you change this setting, it will be taken over from the next time.
             *    So, if you want to make a temporary change, be aware that you need to switch each time.
             * ---
             */
            report_regex_evaluate_error?: boolean
        ): string;
    }
    interface IRemoveCStyleCommentsProperties {
        /** package version */
        readonly version: string;

        /**
         * **If a minified source is detected, the default configuration does nothing**.
         * 
         * number of times the process was bypassed because the line was too long
         */
        readonly noops: number;
        /**
         * number of times successfully processed
         */
        readonly processed: number;

        /**
         * **set whether to avoid minified source**.
         * 
         *  + threshold to avoid processing such as minified source (line length.  
         *    this also applies to embedded sourcemaps and so on.
         * 
         * NOTE: If a minified source is detected, the source is returned without any processing.
         * 
         * ⚠️This flag was set because it was found that the processing of this program would be very slow at the source to which minify was applied.
         * 
         * If you know in advance that you do not to handle minified sources,  
         * setting this value to "0" will be disable this feature.
         * 
         * default is `8000`
         */
        avoidMinified: number;
    }

    interface IRemoveCStyleComments extends IRemoveCStyleCommentsTypeSig, IRemoveCStyleCommentsProperties {
        /**
        * reset "noops" and "processed".
        */
       reset(): void;
       /**
        * 
        */
       getDetectedReContext(): DetectedReContext;
    }

	/**
	 *
	 */
    interface DetectedReContext {
        detectedReLiterals: string[];
        uniqReLiterals: string[];
        evaluatedLiterals: number;
    }

    enum ScannerEvent {
        SingleLineComment,
        MultiLineComment,
    }
    interface IScannerLister {
        on(event: ScannerEvent, fragment: string): void;
    }
}

declare const removeCStyleComments: IRemoveCStyleComments;
export = removeCStyleComments;
