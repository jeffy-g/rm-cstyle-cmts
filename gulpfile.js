/* -----------------------------------------------------------------------

Copyright 2017 motrohi

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

------------------------------------------------------------------------ */
"use strict";

// NOTE: #register the global installation of npm -g to the require destination path of node.js#
// bash: export NODE_PATH=(`npm root -g`)
/* windows:
set CMD=npm root -g
set NODE_PATH=
for /f "usebackq delims=" %a in (`%CMD%`) do set NODE_PATH=%a
echo %NODE_PATH%
*/

// ------------------------------- need imports ----------------------------------
const fs = require('fs');
const util = require('util');

const del = require('del');   // global install
const gulp = require('gulp'); // global install


// ------------------------------- constant variables ----------------------------------
/** ts compiled out put. */
const JS_DEST_DIR = "./bin";

/** npm publishing. */
const DISTRIBUTION_DIR = "./dist";

/**  */
const TS_FILEs_PATTERN = './src/ts/**/*.ts';

/**  */
const JS_FILEs_PATTERN = `${JS_DEST_DIR}/**/*.js`;

/**
 * 
 * @param {File?} vinyl 
 * @param {string} dest 
 */
// 2017/8/13 20:56:56
function convertRelativeDir(vinyl, dest) { // NOTE: vinyl is https://github.com/gulpjs/vinyl
    let x = vinyl.cwd.length + 1;
    let relative_dir = vinyl.base.substring(x);
    return `${dest}/${relative_dir}`;
}

/**
 * task "clean"
 */
gulp.task("clean", function(cb) {
    del([`${JS_DEST_DIR}/**/*.js`, DISTRIBUTION_DIR]).then(paths => {
        console.log(
            `Deleted files and folders:
${paths.join('\n')}
`);
        // notify completion of task.
        cb();
    });
});

/**
 * task "dist"
 */
gulp.task('dist', function(cb) {
    gulp.src([
        "package.json", "sample-cfg.json", "sample-cfg-after.json", "readme.md",
        JS_FILEs_PATTERN
    ]).pipe(gulp.dest(function(vinyl) {
        return convertRelativeDir(vinyl, DISTRIBUTION_DIR);
    })).on("end", () => {
        // notify completion of task.
        cb();
    });
});

