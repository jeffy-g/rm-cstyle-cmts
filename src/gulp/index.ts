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
import * as stream from "stream";
import * as readline from "readline";
import { performance } from "perf_hooks";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// gulp plugin name.
const PLUGIN_NAME = "gulp-rm-cmts";
const perf = performance;


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param {string} path 
 */
/* istanbul ignore next */
const stdProgress = (() => {
    const output = process.stderr;
    return (path: string) => {
        // move cursor to line head
        readline.cursorTo(output, 0);
        // write the message.
        output.write(`[processed: ${rmc.processed}, noops: ${rmc.noops}]: ${path}`);
        // clear line to the right from cursor
        readline.clearLine(output, 1);
    };
})();
/**
 * @type {string[]}
 */
const noopPaths: string[] = [];
const defaultExtensions = [
    ".js", ".jsx", ".ts", ".tsx", ".cjs", ".mjs",
    ".cts", ".mts"
];
/**
 * @type {NsGulpRmc.TTimeSpanEntries}
 */
const timeSpans: NsGulpRmc.TTimeSpanEntries = [];

/**
 * @param {NsGulpRmc.TOptions} options
 * @returns {[TRemoveCStyleCommentsOpt, true | undefined, string[], true | undefined, (path: string) => void, number]}
 */
const createContext = (options: NsGulpRmc.TOptions) => {

    /** @type {TRemoveCStyleCommentsOpt} */
    const opt: TRemoveCStyleCommentsOpt = {
        preserveBlanks: options.preserveBlanks,
        collectRegex: options.collectRegex,
        showErrorMessage: true
    };
    const renderProgress = options.renderProgress;
    const extensions = options.disableDefaultExtensions
        ? options.extraExtensions || [".js"]
        : defaultExtensions.concat(options.extraExtensions || []);
    /**
     * @see {@link NsGulpRmc.TOptions.timeMeasure timeMeasure}
     */
    const timeMeasure = options.timeMeasure;
    /* istanbul ignore next */
    const progress = process.env.CI ? (() => {
        let count = 0;
        const output = process.stderr;
        return (/* path: string */) => {
            (++count % 100) === 0 && output.write("\u2708 ");
            (count % 5000) === 0 && output.write("\n");
        };
    })() : stdProgress;
    const highWaterMark = options.highWaterMark || NsGulpRmc.EConstants.HWM;

    return [
        opt, renderProgress, extensions, timeMeasure, progress, highWaterMark
    ] as [
        typeof opt, typeof renderProgress, typeof extensions, typeof timeMeasure, typeof progress, typeof highWaterMark
    ];
};

/**
 * @type {(options?: NsGulpRmc.TOptions) => NsGulpRmc.StreamTransform}
 */
const getTransformer: NsGulpRmc.TTransformerFactory = (
    /* istanbul ignore next */
    options = {}
): NsGulpRmc.StreamTransform => {

    const [
        opt, renderProgress, extensions, timeMeasure, progress, highWaterMark
    ] = createContext(options);
    let prevNoops = rmc.noops;

    renderProgress && console.log("rm-cstyle-cmts:", {
        version: rmc.version,
    });

    /**
     * @type {NsGulpRmc.FixTransformFunction}
     */
    const transform: NsGulpRmc.FixTransformFunction = function (vinyl, encoding, callback) {

        // plugin main
        if (vinyl.isBuffer() && extensions.includes(vinyl.extname)) {
            const path = vinyl.relative;
            renderProgress && process.nextTick(progress, `[${encoding}]: ${path}`);
            let contents: string;
            /* istanbul ignore else */
            if (timeMeasure) {
                const a = perf.now();
                contents = rmc(vinyl.contents.toString(/* default: utf8 */), opt);
                const span = perf.now() - a;
                timeSpans.push(
                    `${span}:${path}`
                );
            } else {
                contents = rmc(vinyl.contents.toString(), opt);
            }
            // node ^v5.10.0
            vinyl.contents = Buffer.from(contents);
            if (prevNoops ^ rmc.noops) {
                noopPaths.push(path);
                prevNoops = rmc.noops;
            }
            return callback(null, vinyl);
        }

        if (vinyl.isNull()) {
            return callback(null, vinyl);
        }

        /* istanbul ignore next */
        if (vinyl.isStream()) {
            this.emit("error", new TypeError(`[${PLUGIN_NAME}]: Streams not supported!`));
        }

        /* istanbul ignore next */
        this.push(vinyl);
        /* istanbul ignore next */
        callback();
    };
    /**
     * @type {NsGulpRmc.FixTransformFunction}
     */
    const transformWithWalk: NsGulpRmc.FixTransformFunction = function (vinyl, encoding, callback) {
        if (vinyl.isBuffer() && extensions.includes(vinyl.extname)) {
            renderProgress && process.nextTick(progress, `[${encoding}]: ${vinyl.relative}`);
            rmc.walk(vinyl.contents.toString(), opt);
            if (prevNoops < rmc.noops) {
                noopPaths.push(vinyl.relative);
                prevNoops = rmc.noops;
            }
        } else /* istanbul ignore if */ if (vinyl.isStream()) {
            this.emit("error", new TypeError(`[${PLUGIN_NAME}]: Streams not supported!`));
        }
        // DEVNOTE: By not passing file as the second argument of callback, there is no file that has flowed
        callback();
    };

    return new stream.Transform({
        objectMode: true, highWaterMark,
        transform: !options.isWalk? transform: transformWithWalk
    });
};

const getTimeSpans = () => {
    const ret = timeSpans.slice().sort((a, b) => {
        const [atime, apath] = a.split(":");
        const [btime, bpath] = b.split(":");
        const diff = +atime! - +btime!;
        //*
        return diff === 0? apath!.localeCompare(bpath!): diff < 0? -1: 1;
        /*/
        return diff < 0 ? -1: +(diff > 0);
        //*/
    });
    // DEVNOTE: 2022/05/06 - clear `timeSpans`
    timeSpans.length = 0;
    return ret;
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
