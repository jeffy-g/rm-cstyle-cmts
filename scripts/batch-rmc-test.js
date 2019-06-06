/*!
-----------------------------------------------------------------------

Copyright 2019 jeffy-g hirotom1107@gmail.com

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
"use strict";
// @ts-check
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const del = require("del");
const gulp = require("gulp");
const utils = require("./utils");

const grmc = require("../bin/gulp/");

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// const TEST_SRC_PREFIX = "./src/ts/**/*";
// const TEST_SRC_PREFIX = "../rmc-tmp/ts/**/*";
// const TEST_SRC_FILEs = `${TEST_SRC_PREFIX}.{ts,tsx}`;
/**
 * **Scan all node module pakcages and strip comments and blank line from types of javascript source**.
 * 
 * 📝 contents that are not text or types that are not of javascript source are passed through.
 * 
 * 
 */
const TEST_SRC_PREFIX = "./node_modules/**/";
const TEST_SRC_FILEs = `${TEST_SRC_PREFIX}{*,\.*,\.*/*}`;
// const TEST_SRC_FILEs = `${TEST_SRC_PREFIX}*.{js,jsx,ts,tsx}`;

// ⚠️ CAVEAT:
//  In test for all files in node_modules,
//  if output directory is set immediately below working directory,
//  vscode maybe/will be freezes
// const TEST_SRC_FILEs_OUT = "x-node_modules";
const TEST_SRC_FILEs_OUT = "../rmc-tmp/output";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @typedef {object} ThisTaskArgs
 * @property {string | string[]} paths
 */
// if need optional parametar.
/** @type {ThisTaskArgs} */
const settings = utils.getExtraArgs({ startIndex: 2 });

const cleanUpResults = (cb) => {
    del.sync(TEST_SRC_FILEs_OUT, { force: true });
    cb();
};

// tree node_modules > nm-tree.txt && tree ..\grmc-tmp\output > output-tree.txt
// --------------------------------------------- [gulp-rm-cmts test]
// sample webpack: avoidMinified = 76944;
// yarn batch-rmc-test -- -paths "['../rmc-tmp/webpack.js', '../rmc-tmp/webpack-cr.js', '../rmc-tmp/webpack-crlf.js']"

// yarn batch-rmc-test -- -paths ../rmc-tmp/rmc-impossible.tsx
// yarn batch-rmc-test -- -paths ../rmc-tmp/rmc-impossible#2.tsx
/**
 * ✅ check at own environment
 * 
 * 1. yarn batch-rmc-test
 * 2.
 *   + search on vscode:
 *      search   - ^\s*$
 *      includes - ../rmc-tmp/output/*
 *
 *   + grep ^\s*$ ../rmc-tmp/output -rl (or -rC 1
 * 
 * 3. Is the blank line found only inside the backquoted string? grep ^\s*$ ../rmc-tmp/output -rC 1
 */
const grmcBatchTest = (/** @type {() => unknown} */cb) => {

    console.log(settings);
    /** @type {string | string[]} */
    const target = settings.paths? settings.paths: TEST_SRC_FILEs;
    const rmc = grmc.getRmcInterface();

    // default is 8000, own environment: time spent about 25sec
    // - - - example result: (default) - - - 
    //
    // [batch-rmc-test]: 24873.684ms
    //
    // task grmc-test done, processed: 4386, noops: 49
    // detected regex literals: [
    // ...
    // ]
    // detected regex count: 2874
    // evaluated literals: 0
    //

    // - - - example result: (rmc.avoidMinified = 15000) - - - 
    //
    // [batch-rmc-test]: 25413.670ms
    //
    // task grmc-test done, processed: 4402, noops: 33
    // detected regex literals: [
    // ...
    // ]
    // detected regex count: 3057
    // evaluated literals: 0
    //
    //rmc.avoidMinified = 15000;

    gulp.src(target).pipe(
        /**
         * remove_ws : remove whitespace and blank lines.
         */
        grmc.getTransformer({
            remove_ws: true,
            render_progress: true,
            // report_re_error: true,
        })
    )
    // .pipe(rename({ suffix: "-after" }))
    .pipe(gulp.dest(TEST_SRC_FILEs_OUT)).on("end", () => {

        console.log("\n");
        // notify completion of task.
        cb();

        console.log();
        console.log("task grmc-test done, processed: %s, noops:", rmc.processed, rmc.noops);
        console.log("noop paths:", grmc.noopPaths);
        const context = rmc.getDetectedReContext();
        // console.log("detected regex literals:", context.detectedReLiterals);
        console.log("detected regex count:", context.detectedReLiterals.length);
        console.log("evaluated regex literals:", context.evaluatedLiterals);

        utils.writeTextUTF8(context.detectedReLiterals.join("\n"), "./tmp/grmc-detected-reLiterals.txt");
    });
};

// DEVNOTE: async/await available at node v7.6
// const step2 = async () => {
//     // DEVNOTE: fix mkdir
//     if (require("fs").existsSync(TEST_SRC_FILEs_OUT)) {
//         console.log(`directory ${TEST_SRC_FILEs_OUT} is still available. let's wait for a while...`);
//         await new Promise(resolve => {
//             setTimeout(resolve, 777);
//         });
//     }
//     // step 2. fire gulp-rm-cmts test process
//     console.log("- - - step 2. fire gulp-rm-cmts test process - - -");
//     console.time("[batch-rmc-test]");
//     grmcBatchTest(() => console.timeEnd("[batch-rmc-test]"));
// };
const step2 = () => {
    const nextStage = () => {
        // step 2. fire gulp-rm-cmts test process
        console.log("- - - step 2. fire gulp-rm-cmts test process - - -");
        console.time("[batch-rmc-test]");
        grmcBatchTest(() => console.timeEnd("[batch-rmc-test]"));
    };
    // DEVNOTE: fix mkdir
    if (require("fs").existsSync(TEST_SRC_FILEs_OUT)) {
        console.log(`directory ${TEST_SRC_FILEs_OUT} is still available. let's wait for a while...`);
        new Promise(resolve => {
            setTimeout(resolve, 777);
        }).then(() => nextStage());
    } else {
        nextStage();
    }
};

console.log(process.argv);

// step 1. cleanup prev output
console.log("- - - step 1. cleanup prev output - - -");
console.time("[remove-output]");
cleanUpResults(() => console.timeEnd("[remove-output]"));

step2();

