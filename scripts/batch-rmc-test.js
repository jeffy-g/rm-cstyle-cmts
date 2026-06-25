/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
"use strict";
/**
 * @file scripts/batch-rmc-test.js
 * @command yarn grmc-test:cjs
 */
// @ts-check
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Import necessary modules
const grmc = require("../dist/webpack/gulp/");
// const grmc = require("../dist/cjs/gulp/");
const { /* common, */ utils } = require("js-dev-tool");
const { task } = require("./grmc-test-task");
const { printPlatform } = require("../etc/bench/print-platform.mjs");


/**
 * @import { TGrmcTaskArgs } from "./grmc-test-task.d.ts";
 */
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// [batch-rmc-test:cjs]: 17.629s
// Get task arguments and execute the task
/** @type {NsTinArgs.TTinArgsReturnType<TGrmcTaskArgs>} */
const taskArgs = utils.tinArgs();
taskArgs.platfromSummary = printPlatform("grmc-test:cjs");
task(grmc, taskArgs);
// DEVNOTE: Even if you use the following flags, there is no significant difference in processing speed...
// node scripts/batch-rmc-test.js -progress -showNoops => [batch-rmc-test:cjs]: 7.043s
// node scripts/batch-rmc-test.js -progress -showNoops -collectRegex -timeMeasure -collectJSDocTag => [batch-rmc-test:cjs]: 7.216s

// // snippet (2026/06/25)
// function calcTotal(/** @type {`${number}:${string}`[]} */tspanEntries) {
//   // calc total time
//   const total = tspanEntries.reduce((acc, token) => {
//     const x = token.indexOf(":");
//     return acc + +token.slice(0, x);
//   }, 0);
//   console.log(total + "ms");
//   tspanEntries.push(`${total}:totalTime(ms)`);
// }
// // 260625@122709
// // 260625@142026
// /** @type {`${number}:${string}`[]} */
// const json = utils.readJson("tmp/grmc-batch-logs/260625@142026/grmc-time-spans_node25.json");
// calcTotal(json);
// json.at(-1);
// // '720.2332999999967:totalTime(ms)'
