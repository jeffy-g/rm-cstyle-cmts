/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2017 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference path="./index.d.ts"/>
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** character scanner module */
import * as JsScanner from "./js-scanner";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const {
    apply, walk
} = JsScanner;
const throwTypeError = () => {
    throw new TypeError("invalid text content!");
};
/**
 * @param {TRemoveCStyleCommentsOpt} [opt] 
 * @param {any} [e] 
 */
const handleError = (opt?: TRemoveCStyleCommentsOpt, e?: any) => {
    if (opt) {
        console.warn(
            "\n[Exception occured] Input source will be returned without processing",
            opt.showErrorMessage? (e instanceof Error && e.message): ""
        );
    }
    failure++;
};


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * number of times successfully processed
 */
let okay = 0;
/**
 * number of times the process was bypassed because the line was too long
 */
let failure = 0;

const rmc = /** @type {IRemoveCStyleComments} */(
    /**
     * @param {string} source 
     * @param {TRemoveCStyleCommentsOpt} [opt]
     * @returns {string} if `options.isWalk === true`, returns original string, otherwise returns comment removed string
     */
    (source: string, opt?: TRemoveCStyleCommentsOpt): string => {

        if (typeof source !== "string") {
            throwTypeError();
        }
        if (!source.length) {
            // DEVNOTE: 2022/04/24 - check empty contents
            handleError();
            // DEVNOTE: whether return same reference or return new empty string
            return source;
        }

        opt = opt || {};
        try {
            source = apply(source, opt);
            okay++;
        } catch (e) {
            handleError(opt, e);
        }

        return source;
    }
) as IRemoveCStyleComments;

/**
 * @param {string} source
 * @param {TWalkThroughOpt} opt
 */
// DEVNOTE: 2022/05/08 - avoid ts(2300)
const rmcWalk = (source: string, opt?: TWalkThroughOpt ) => {

    if (typeof source !== "string") {
        throwTypeError();
    }
    if (!source.length) {
        // DEVNOTE: 2022/04/26 - check empty contents
        handleError();
        return;
    }

    opt = opt || {};
    try {
        walk(source, opt);
        okay++;
    } catch (e) {
        handleError(opt, e);
    }
};

Object.defineProperties(rmc, {
    version: {
        // `npm run patch:tag` replaces version string
        value: "v3.3.7",
        enumerable: true
    },
    walk: {
        value: rmcWalk
    },
    noops: {
        get: () => failure,
        enumerable: true
    },
    processed: {
        get: () => okay,
        enumerable: true
    },
    reset: {
        value: () => {
            okay = failure = 0, JsScanner.reset();
        }
    },
    getDetectedReContext: {
        value: JsScanner.getDetectedReContext
    },
    setListener: {
        value: JsScanner.setListener
    }
});

export = rmc;
