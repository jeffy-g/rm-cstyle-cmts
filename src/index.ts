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

/**
 * Throws a TypeError with a specific message.
 */
const throwTypeError = () => {
    throw new TypeError("invalid text content!");
};

/**
 * Handles errors by logging a warning message and incrementing the failure count.
 * @param {TRemoveCStyleCommentsOpt} [opt] - Options for removing comments.
 * @param {unknown} [e] - The error that occurred.
 */
const handleError = (opt?: TRemoveCStyleCommentsOpt, e?: unknown) => {
    if (opt) {
        console.warn(
            "\n[Exception occurred] source will be returned without processing",
            opt.showErrorMessage ? (e instanceof Error && `\nmessage: ${e.message}`) : ""
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

/**
 * #### Integrate similar codes
 * 
 * @template {typeof apply | typeof walk} T
 * @template {ReturnType<T>} R
 * @param {T} fn - The function to apply or walk.
 * @returns {(...args: Parameters<T>) => R} - The integrated function.
 * @date 2022/5/12
 */
const emitMainFunction = <
    T extends typeof apply | typeof walk,
    R extends ReturnType<T>
>(fn: T): (...args: Parameters<T>) => R => {

    /**
     * Processes the source string and removes comments if applicable.
     * @param {string} source - The source string to process.
     * @param {TRemoveCStyleCommentsOpt} [opt] - Options for removing comments.
     * @returns {R} - The processed result.
     */
    return (source: string, opt?: TRemoveCStyleCommentsOpt): R => {

        if (typeof source !== "string") {
            throwTypeError();
        }
        if (!source.length) {
            // DEVNOTE: 2022/04/24 - check empty contents
            handleError();
            // DEVNOTE: whether return same reference or return new empty string
            return /** @type {R} */(fn === apply ? source : void 0) as R;
        }

        opt = opt || {};
        /** @type {TBD<R>} */
        let result: TBD<R>;
        try {
            result = /** @type {R} */(fn(source, opt)) as R;
            okay++;
        } catch (e) {
            handleError(opt, e);
            fn === apply && (result = /** @type {R} */(source) as R);
        }

        return /** @type {R} */(result) as R;
    };
};

/** @type {TBC<true>} */
let keepJsDoc: TBD<true>;
/**
 * @type {TBivariant< Required<Parameters<IRemoveCStyleComments["setListener"]>>[0] >}
 */
const preserveJSDoc: TBivariant<Required<Parameters<IRemoveCStyleComments["setListener"]>>[0]> = ({ event, fragment }) => {
    if (event === /*EScannerEvent.MultiLineComment*/1) {
        return /^\/\*(\*|!)\s|^\/\*(?!-).+\*\/$/.test(fragment);
    }
    return false;
};
const rmc = /** @type {IRemoveCStyleComments} */( emitMainFunction(apply) ) as IRemoveCStyleComments;
Object.defineProperties(rmc, {
    version: {
        // `npm run patch:tag` replaces version string
        value: "v3.3.22",
        enumerable: true
    },
    walk: {
        value: emitMainFunction(walk)
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
    getScannedRegexCount: {
        value: JsScanner.getScanRegex
    },
    getDetectedReContext: {
        value: JsScanner.getDetectedReContext
    },
    setListener: {
        value: JsScanner.setListener
    },
    keepJsDoc: {
        get: () => keepJsDoc,
        set: (is?: true) => {
            JsScanner.setListener(
                is? preserveJSDoc: void 0
            );
            keepJsDoc = is;
        }
    }
});

export = rmc;
