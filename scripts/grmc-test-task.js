/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2019 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference path="../src/index.d.ts"/>
// @ts-check
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * #### Fire `gulp-rm-cmts` test task
 * 
 * @param {typeof import("gulp")} gulp gulp package
 * @param {typeof import("rimraf")} rimraf rimraf package
 * @param {typeof import("./tiny/utils")} utils tiny/utils module
 * @param {typeof import("../src/gulp")} grmc gulp-rm-cmts package
 * @param {"cjs" | "esm"} mode 
 */
 function task(
    gulp, rimraf, utils, grmc, mode = "cjs"
) {

    /**
     * @typedef {object} ThisTaskArgs
     * @prop {string | string[]} [paths]
     * @prop {true} [progress]
     * @prop {boolean} [showNoops]
     * @prop {boolean} [collectRegex]
     * @prop {boolean} [isWalk] &#64;since 3.1
     * @prop {boolean} [timeMeasure]
     * @prop {boolean} [cleanup] cleanup previous output then exit
     * @prop {boolean} [useExtern] scan external directory?
     */
    // if need optional parametar.
    /** @type {ThisTaskArgs & GulpRmc.TOptions} */
    const settings = utils.getExtraArgs();
    const BASE_PREFIX = settings.useExtern ? "[If you want to scan external node_modules directory etc., set path here]" : ".";
    /**
     * **Scan all node module pakcages and strip comments and blank line from types of javascript source**.
     * 
     * 📝 contents that are not text or types that are not of javascript source are passed through.
     */
    const SCAN_SRC_PREFIX = BASE_PREFIX + "/node_modules/**/";
    //*
    const SCAN_SRC_FILEs = `${SCAN_SRC_PREFIX}{*,\.*,\.*/*}`;
    /*/
    const SCAN_SRC_FILEs = `${SCAN_SRC_PREFIX}*.{js,mjs,cjs}`;
    // const SCAN_SRC_FILEs = `${SCAN_SRC_PREFIX}*.{js,jsx,ts,tsx}`;
    //*/

    // ⚠️ CAVEAT:
    //  In test for all files in node_modules,
    //  if output directory is set immediately below working directory, vscode maybe/will be freezes
    const RESULT_SRC_FILEs_OUT = "../rmc-tmp/output";

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //                         module vars, functions.
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const cleanUpResults = (/** @type {() => unknown} */cb) => {
        rimraf.sync(RESULT_SRC_FILEs_OUT);
        cb();
    };

    //
    // - - - - - jsdoc tag detection [2020/4/14]
    //
    /** @type {Map<string, number>} */
    const tagStatistics = new Map();
    let inlineSourceMap = 0;

    const silent = !!process.env.CI;
    /**
     * @param {boolean} iswalk
     * @returns {IScanEventCallback}
     */
    const emitListener = (iswalk = false) => {

        /**
         * @param {object} context
         * @param {TScannerEventContext["event"]} context.event
         * @param {TScannerEventContext["fragment"]} context.fragment
         */
        function _handler({ event, fragment }) {
            if (event === /*ScannerEvent.MultiLineComment*/1) {
                // DEVNOTE: \b is not contained LF
                if (/^\/\*\*[^*]/.test(fragment)) {
                    const re = /(?<=[\s\*{])@\w+(?=\s)/g; // regex for correct detection
                    /** @type {RegExpExecArray} */
                    let m;
                    while (m = re.exec(fragment)) {
                        const tag = m[0];
                        let count = tagStatistics.get(tag) || 0;
                        tagStatistics.set(tag, count + 1);
                    }
                }
            }
            else if (event === /*ScannerEvent.SingleLineComment*/0) {
                if (/^\/\/# sourceMappingURL=data:application/.test(fragment)) {
                    !silent && console.log(`\ninline source map detected=[${fragment.substring(0, 48)}...]`);
                    inlineSourceMap++;
                }
            }

            return iswalk;
        };

        return _handler;
    };

    /**
     * @typedef {[string, number]} TPriorityEntry
     */
    /**
     * @returns {TPriorityEntry[]}
     */
    function getTagStatistics() {
        /**
         * @type {Iterator<TPriorityEntry, TPriorityEntry>}
         */
        const entries = tagStatistics.entries();
        /** @type {TPriorityEntry[]} */
        const ret = [];
        do {
            const { value, done } = entries.next();
            if (done) break;
            // const [tag, count] = value;
            // `${value[0]}:${value[1]}`
            ret.push(value);
        } while (1);

        return ret.sort((a, b) => {
            const diff = a[1] - b[1];
            return diff === 0 ? a[0].localeCompare(b[0]): diff;
        });
    }

    /**
     * @param {string} content 
     */
    const formatRegexResult = (content)  => {
        return `const reLiterals = [
  ${content}
];
module.exports = {
  reLiterals
};
`;
    };
    /**
     * @param {string} content 
     */
    const formatStatictics = (content) => {
        return `const jsDocTagStatistics = [
  ${content}
];
module.exports = {
  jsDocTagStatistics
};
`;
    };

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
     */
    const grmcBatchTest = () => {

        console.log(settings);

        /** @type {string | string[]} */
        const target = settings.paths? settings.paths: SCAN_SRC_FILEs;
        const rmc = grmc.getRmcInterface();
        // 2020/4/14
        rmc.setListener(emitListener(settings.isWalk));

        console.time(`[batch-rmc-test:${mode}]`);
        gulp.src(target).pipe(
            grmc.getTransformer({
                // preserveBlanks: true,
                collectRegex: settings.collectRegex,
                renderProgress: settings.progress,
                isWalk: settings.isWalk,
                timeMeasure: settings.timeMeasure,
                extraExtensions: settings.extraExtensions,
                disableDefaultExtentions: settings.extraExtensions ? true: void 0,
            })
        ).pipe(gulp.dest(RESULT_SRC_FILEs_OUT)).on("end", () => {

            console.log("\n");
            // notify completion of task.
            console.timeEnd(`[batch-rmc-test:${mode}]`);

            console.log("\ntask grmc-test done, processed: %s, noops:", rmc.processed, rmc.noops);
            settings.showNoops && console.log("noop paths:", grmc.noopPaths);

            console.log(`detected inline source map: ${inlineSourceMap}`);

            const context = rmc.getDetectedReContext();
            console.log("detected regex count:", context.detectedReLiterals.length);
            console.log("unique regex count:", context.uniqReLiterals.length);

            const tagPriorityEntries = getTagStatistics();
            console.log("detected JSDoc tag count:", tagPriorityEntries.length);
            console.log("detected JSDoc tags:", tagPriorityEntries);

            context.uniqReLiterals.length && utils.writeTextUTF8(
                formatRegexResult(context.uniqReLiterals.join(",\n  ")),
                "./tmp/grmc-detected-reLiterals.js"
            );
            tagPriorityEntries.length && utils.writeTextUTF8(
                formatStatictics(
                    tagPriorityEntries.map(entry => `["${entry[0]}", ${entry[1]}]`).join(",\n  ")
                ),
                "./tmp/grmc-detected-jsdocTags.js"
            );
            utils.writeTextUTF8(
                JSON.stringify(grmc.getTimeSpans(), null, 2),
                "./tmp/grmc-time-spans.json"
            );
        });
    };

    const step2 = () => {
        const nextStage = () => {
            // step 2. fire gulp-rm-cmts test process
            console.log("- - - step 2. fire gulp-rm-cmts test process - - -");
            grmcBatchTest();
        };
        // Wait for a while to avoid nodejs specific error "EPERM: operation not permitted, mkdir..."
        new Promise(resolve => {
            setTimeout(resolve, 1000);
        }).then(() => nextStage());
    };

    console.log(process.argv);

    // step 1. cleanup prev output
    console.log("- - - step 1. cleanup prev output - - -");
    console.time("[remove-output]");
    cleanUpResults(() => console.timeEnd("[remove-output]"));

    if (!settings.cleanup) {
        step2();
    }
}

module.exports = {
    task
};
