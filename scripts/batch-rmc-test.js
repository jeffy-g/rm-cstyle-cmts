/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
"use strict";
// @ts-check
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const gulp = require("gulp"); // should global install
const rimraf = require("rimraf");
const grmc = require("../dist/cjs/gulp/");
const getArgs = require("./tiny/get-extra-args");
const task = require("./grmc-test-task").task;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// [batch-rmc-test:cjs]: 17.629s
/** @type {import("./grmc-test-task").TGrmcTaskArgs & GulpRmc.TOptions} */
const taskArgs = getArgs();
task(gulp, rimraf, grmc, taskArgs);
