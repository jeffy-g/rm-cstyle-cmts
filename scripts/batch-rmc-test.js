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
const grmc = require("../dist/cjs/gulp/");
const getArgs = require("tin-args");
// const getArgs = require("./tiny/get-extra-args");
const { task } = require("./grmc-test-task");

/**
 * @import { TGrmcTaskArgs } from "./grmc-test-task.d.ts"
 */
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// [batch-rmc-test:cjs]: 17.629s
// Get task arguments and execute the task
/** @type {ReturnType<typeof getArgs<TGrmcTaskArgs>>} */
const taskArgs = getArgs();
task(grmc, taskArgs);
