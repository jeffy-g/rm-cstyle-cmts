/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2019 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference path="../src/index.d.ts"/>
"use strict";

// @ts-check
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const fs = require("fs");
const gulp = require("gulp");
const rimraf = require("rimraf");
const {
    isJest,
    log, timeStart, timeEnd, 
    final,
    emitListener,
    preserveJSDoc,
    cleanUpResults,
    getTagStatistics,
} = require("./grmc-task-functions.js");

/**
 * @import { TGrmcTaskArgs, TJSDocTag, TPriorityEntry } from "./grmc-test-task.d.ts";
 */
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** grmc task output root */
const ROOT_DIR = "x:";
const LOG_ROOT = "./tmp/grmc-batch-logs/";
// ⚠️ CAVEAT:
//  In test for all files in node_modules,
//  if output directory is set immediately below working directory, vscode maybe/will be freezes
/**
 * @throws {Error} description
 */
const RESULT_SRC_FILEs_OUT = `${ROOT_DIR}/rmc-tmp/output`;
if (!fs.existsSync(ROOT_DIR)) {
    throw new Error("Output directory root are not available!");
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                               Module Main
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const gabege = globalThis?.gc;
/**
 * #### `gulp-rm-cmts` test task Main
 * 
 * @param {typeof import("../src/gulp")} grmc gulp-rm-cmts package
 * @param {TGrmcTaskArgs} settings
 * @param {"cjs" | "esm"} mode 
 */
async function task(grmc, settings, mode = "cjs") {

    const BASE_PREFIX = settings.useExtern ? "[If you want to scan external node_modules directory etc., set path here]" : ".";
    /**
     * **Scan all node module pakcages and strip comments and blank line from types of javascript source**.
     * 
     * 📝 contents that are not text or types that are not of javascript source are passed through.
     */
    const SCAN_SRC_PREFIX = `${BASE_PREFIX}/node_modules/**/`;
    /*
    // DEVNOTE: This causes symlink-related errors in gitpod, and the behavior is terrible.
    const SCAN_SRC_FILEs = `${SCAN_SRC_PREFIX}{*,\.*,\.\x2a/*}`;
    /*/
    // only javascript relative sources
    const SCAN_SRC_FILEs = `${SCAN_SRC_PREFIX}*.{c(j|t)s,js,jsx,m(j|t)s,ts,tsx}`;
    // const SCAN_SRC_FILEs = `./src/*\x2a/{*,\.*,\.\x2a/*}`;
    // const SCAN_SRC_FILEs = `${SCAN_SRC_PREFIX}*.{js,jsx,ts,tsx}`;
    //*/

    //
    // - - - - - jsdoc tag detection [2020/4/14]
    //
    /** @type {Map<TJSDocTag, number>} */
    const tagStatistics = new Map();

    /**
     * ✅ check at own environment
     * 
     * 1. yarn grmc-test:cjs
     * 2.
     *   + search on vscode:
     *      search   - ^\s*$
     *      includes - ../rmc-tmp/output/*
     *
     *   + grep ^\s*$ ../rmc-tmp/output -rl (or -rC 1
     * 
     * 3. Is the blank line found only inside the backquoted string? grep ^\s*$ ../rmc-tmp/output -rC 1
     * 
     * @returns {Promise<void>}
     */
    const grmcBatchTest = () => {

        log(settings);

        let [customListener, getInlineSmCount] = emitListener(settings, tagStatistics);
        const rmc = grmc.getRmcInterface();
        // 2020/4/14
        rmc.setListener(
            !settings.preserveJSDoc ? customListener : preserveJSDoc
        );

        return new Promise(resolve => {
            // DEVNOTE: 2026/04/03 12:24:27 - This is the only part that will be measured even during jest testing.
            console.time(`[batch-rmc-test:${mode}]`);
            gulp.src(settings.paths || SCAN_SRC_FILEs, { encoding: false }).pipe(
                grmc.getTransformer({
                    // preserveBlanks: true,
                    collectRegex: settings.collectRegex,
                    renderProgress: settings.progress,
                    isWalk: settings.isWalk,
                    timeMeasure: settings.timeMeasure,
                    extraExtensions: settings.extraExtensions,
                    disableDefaultExtensions: settings.extraExtensions ? true : void 0,
                    // 2022/5/7
                    // @ts-ignore 
                    highWaterMark: +(settings.highWaterMark) || void 0
                })
            ).pipe(gulp.dest(RESULT_SRC_FILEs_OUT)).on("end", () => {

                // notify completion of task.
                !isJest && log();
                console.timeEnd(`[batch-rmc-test:${mode}]`);

                /** @type {true=} */
                let didNotify; // TODO: var name (defere etc)
                if (!isJest) {
                    const context = rmc.getDetectedReContext();
                    const tagPriorityEntries = getTagStatistics(tagStatistics);
                    settings.printDtails && log(
                        `\ntask grmc-test done, processed: ${rmc.processed}, noops: ${rmc.noops}\n` +
                        `detected inline source map: ${getInlineSmCount()}\n` +
                        `scanned regex count: ${rmc.getScannedRegexCount()}\n` +
                        `detected regex count: ${context.detectedReLiterals.length}\nunique regex count: ${context.uniqReLiterals.length}\n` +
                        `detected JSDoc tag count: ${tagPriorityEntries.length}\n` +
                        `detected JSDoc tags: %o\n` +
                        `${settings.showNoops ? `noop paths: %o` : ""}`,
                        tagPriorityEntries, settings.showNoops ? grmc.noopPaths : ""
                    );

                    const timeSpans = grmc.getTimeSpans(true);
                    let pending = +(!!context.uniqReLiterals.length) + +(!!tagPriorityEntries.length) + +(!!timeSpans.length);
                    if (pending) {
                        didNotify = true;
                        final(
                            context, tagPriorityEntries, timeSpans, pending, resolve, { LOG_ROOT, platfromSummary: settings.platfromSummary }
                        );
                    }
                } else grmc.getTimeSpans(true); // dummy call
                !didNotify && resolve();
            });
        });
    };

    const step2 = async () => {
        gabege && gabege();
        // Wait for a while to avoid nodejs specific error "EPERM: operation not permitted, mkdir..."
        await new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
        // step 2. fire gulp-rm-cmts test process
        log("- - - step 2. fire gulp-rm-cmts test process - - -");
        return grmcBatchTest();
    };

    // step 1. cleanup prev output
    log("- - - step 1. cleanup prev output - - -");
    timeStart("[remove-output]");
    cleanUpResults(RESULT_SRC_FILEs_OUT, () => timeEnd("[remove-output]"));

    if (!settings.cleanup) {
        await step2();
    }
}

module.exports = {
    task
};
