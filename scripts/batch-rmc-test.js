/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
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
const utils = require("js-dev-tool/utils");
const { task } = require("./grmc-test-task");

/**
 * @import { TGrmcTaskArgs } from "./grmc-test-task.d.ts"
 */
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// [batch-rmc-test:cjs]: 17.629s
// Get task arguments and execute the task
/** @type {ReturnType<typeof utils.tinArgs<TGrmcTaskArgs>>} */
const taskArgs = utils.tinArgs();
task(grmc, taskArgs);
// DEVNOTE: Even if you use the following flags, there is no significant difference in processing speed...
// node scripts/batch-rmc-test.js -progress -showNoops => [batch-rmc-test:cjs]: 7.043s
// node scripts/batch-rmc-test.js -progress -showNoops -collectRegex -timeMeasure -collectJSDocTag => [batch-rmc-test:cjs]: 7.216s
