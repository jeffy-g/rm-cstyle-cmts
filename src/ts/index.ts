/*
-----------------------------------------------------------------------

Copyright 2017 motrohi

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
import * as replace from "./replace";

/**
 * #### remove c style comments form "source" content.  
 * 
 * step 1:  
 *  - remove line comments, multi line comments.  
 *  - and search the regexp literal. if found then concat it to results.  
 * 
 * step 2:  
 *  - remove whitespaces.(if need, see @param rm_blank_line_n_ws
 * 
 * @param {string} source c style commented text source.
 * @param {boolean} rm_blank_line_n_ws remove black line and whitespaces, default is "true".
 */
function removeCStyleComments(source: string, rm_blank_line_n_ws: boolean = true): string {

    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }
    /**
     * 
     */
    const replacer = new replace.ReplaceFrontEnd(source);
    source = replacer.apply();
    /* remove whitespaces. /^[\s]+$|[\r\n]+$|^[\r\n](?=\S)/gm */
    // NOTE: this combination does not do the intended work...
    // return remove_whitespaces? source.replace(/^[\s]+$|[\r\n]+$|^[\r\n]/gm, ""): source;
    // NOTE: these are good.
    return rm_blank_line_n_ws? source.replace(/^[\s]+$/gm, "").replace(/[\r\n]+$/gm, "").replace(/^[\r\n]/gm, ""): source;
}

export = removeCStyleComments;
