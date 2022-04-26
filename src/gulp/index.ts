/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2019 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference path="./index.d.ts"/>
// original name: gulp-rm-cmts.ts
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import * as rmc from "../";
// import * as rmc from "rm-cstyle-cmts";

import * as through2 from "through2";
import * as readline from "readline";
import { performance } from "perf_hooks";

// gulp plugin name.
const PLUGIN_NAME = "gulp-rm-cmts";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const perf = performance;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param {string} path 
 */
const stdProgress = (path: string) => {
    const output = process.stderr;
    // TIP: readline.clearLine(stream, dir[, callback])
    // dir <number>
    // -1 - to the left from cursor
    //  1 - to the right from cursor
    //  0 - the entire line
    //
    // move cursor to line head
    readline.cursorTo(output, 0);
    // write the message.
    output.write(`[processed: ${rmc.processed}, noops: ${rmc.noops}]: ${path}`);
    // clear line to the right from cursor
    readline.clearLine(output, 1);
};

/**
 * @param path 
 */
const progress = process.env.CI? (() => {
    let count = 0;
    const output = process.stderr;
    return (/* path: string */) => {
        count++;
        (count % 100) === 0 && output.write(".");
        // write the message.
        (count % 10000) === 0 && output.write("\n");
    };
})(): stdProgress;

/**
 * @type {string[]}
 */
const noopPaths: string[] = [];
const defaultExtensions = [
    ".js", ".jsx", ".ts", ".tsx", ".cjs", ".mjs"
];
/**
 * @type {GulpRmc.TTimeSpanEntry}
 */
const timeSpans: GulpRmc.TTimeSpanEntry = [];


/**
 * @type {(options: GulpRmc.TOptions) => ReturnType<typeof through2.obj>}
 */
const getTransformer: GulpRmc.TTransformerFactory = (options): ReturnType<typeof through2.obj> => {

    options = options || {};
    /** @type {TRemoveCStyleCommentsOpt} */
    const opt: TRemoveCStyleCommentsOpt = {
        preserveBlanks: options.preserveBlanks,
        collectRegex: options.collectRegex,
        showErrorMessage: true
    };
    const renderProgress = options.renderProgress;
    // DEVNOTE: 2022/04/07
    const extensions = (() => {
        if (options.disableDefaultExtentions) {
            return options.extraExtensions || [".js"];
        } else {
            return defaultExtensions.concat(
                options.extraExtensions || []
            );
        }
    })();
    /**
     * @see {@link GulpRmc.TOptions.timeMeasure timeMeasure}
     */
    const timeMeasure = options.timeMeasure;
    let prevNoops = rmc.noops;

    renderProgress && console.log("rm-cstyle-cmts:", {
        version: rmc.version,
    });

    /**
     * @type {GulpRmc.FixTransformFunction}
     */
    // @ts-ignore unused parameter "encoding"
    const transform: GulpRmc.FixTransformFunction = function (vinyl, encoding, callback) {

        // plugin main
        if (vinyl.isBuffer()) {

            if (extensions.includes(vinyl.extname)) {
                renderProgress && process.nextTick(progress, vinyl.relative);
                // renderProgress && progress(vinyl.relative);
                let contents: string;
                if (timeMeasure) {
                    const a = perf.now();
                    contents = rmc(vinyl.contents!.toString(), opt);
                    const span = perf.now() - a;
                    timeSpans.push(
                        `${span}:${vinyl.relative}`
                    );
                } else {
                    contents = rmc(vinyl.contents!.toString(), opt);
                }
                // node ^v5.10.0
                vinyl.contents = Buffer.from(contents);
                if (prevNoops ^ rmc.noops) {
                    noopPaths.push(vinyl.relative);
                    prevNoops = rmc.noops;
                }
            }

            return callback(null, vinyl);
        }

        if (vinyl.isNull()) {
            return callback(null, vinyl);
        }

        if (vinyl.isStream()) {
            this.emit("error", new TypeError(`[${PLUGIN_NAME}]: Streams not supported!`));
        }

        this.push(vinyl);
        callback();
    };
    /**
     * @type {GulpRmc.FixTransformFunction}
     */
    // @ts-ignore unused parameter "encoding"
    const transformWithWalk: GulpRmc.FixTransformFunction = function (vinyl, encoding, callback) {

        // plugin main
        if (vinyl.isBuffer()) {

            if (extensions.includes(vinyl.extname)) {
                renderProgress && process.nextTick(progress, vinyl.relative);
                // renderProgress && progress(vinyl.relative);
                rmc.walk(vinyl.contents!.toString(), opt);
                if (prevNoops < rmc.noops) {
                    noopPaths.push(vinyl.relative);
                    prevNoops = rmc.noops;
                }
            }
            // DEVNOTE: By not passing file as the second argument of callback, there is no file that has flowed
            return callback(null);
        }

        if (vinyl.isNull()) {
            return callback(null, vinyl);
        }

        if (vinyl.isStream()) {
            this.emit("error", new TypeError(`[${PLUGIN_NAME}]: Streams not supported!`));
        }

        this.push(vinyl);
        callback();
    };

    return through2.obj(!options.isWalk? transform: transformWithWalk);
};

const getTimeSpans = () => {
    return timeSpans.sort((a, b) => {
        const [atime, apath] = a.split(":");
        const [btime, bpath] = b.split(":");
        const diff = +atime - + btime;
        //*
        return diff === 0? apath.localeCompare(bpath): diff < 0? -1: 1;
        /*/
        return diff < 0 ? -1: +(diff > 0);
        //*/
    });
};
/**
 * get IRemoveCStyleComments interface
 */
const getRmcInterface = () => rmc;

export {
    getTransformer,
    getRmcInterface,
    /**
     * unprocessed file is recorded
     */
    noopPaths,
    getTimeSpans
};
