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
const fs = require("fs");
const util = require("util");

const del = require("del");   // global install
const gulp = require("gulp"); // global install
const tsc = require('gulp-typescript');  // global install

const replacer = require('gulp-replace');// global install
const rename = require('gulp-rename');   // global install

// source map for codecov.
const sourcemaps = require('gulp-sourcemaps');

// ------------------------------- constant variables ----------------------------------
/** ts compiled out put. */
const JS_DEST_DIR = "./bin";

/** npm publishing. */
const DISTRIBUTION_DIR = "./dist";

/**  */
const TS_FILEs_PATTERN = './src/ts/**/*.ts';

/**  */
const COPY_SCRIPT_FILEs = `${JS_DEST_DIR}/**/*{.js,.d.ts,.js.map}`;

/**
 * 
 * @param {File?} vinyl 
 * @param {string} dest 
 */
function convertRelativeDir(vinyl, dest) { // NOTE: vinyl is https://github.com/gulpjs/vinyl
    let x = vinyl.cwd.length + 1;
    let relative_dir = vinyl.base.substring(x);
    return `${dest}/${relative_dir}`;
}

/**
 * task "clean"
 */
gulp.task("clean", function(cb) {
    del([`${JS_DEST_DIR}/**/*`, DISTRIBUTION_DIR]).then(paths => {
        console.log(
            `Deleted files and folders:
${paths.join('\n')}
`);
        // notify completion of task.
        cb();
    });
});

/**
 * task "tsc"
 */
gulp.task("tsc", ["clean"], function(cb) {
    // const project = tsc.createProject("tsconfig.json");
    // gulp.src(TS_FILEs_PATTERN)
    // .pipe(project())
    // .pipe(
    //     gulp.dest(JS_DEST_DIR)
    // ).on("end", function() {
    //     cb();
    // });

    // copy ...
    gulp.src("./src/ts/globals.d.ts").pipe(gulp.dest(JS_DEST_DIR));

    const project = tsc.createProject("tsconfig.json");
    // cannot took dependent source.
    // const result = project.src().pipe(project());
    const result = gulp.src(TS_FILEs_PATTERN)
        .pipe(sourcemaps.init()) // This means sourcemaps will be generated
        .pipe(project());
    // return result.js.pipe(gulp.dest(JS_DEST_DIR));
    return result
        // .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
        .pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: JS_DEST_DIR })) // create map file per .js
        .pipe(gulp.dest(JS_DEST_DIR));
});


/**
 * remove file when size is zero.
 */
gulp.task("rm:nullfile", ["tsc"], function(cb) {
    function _readdir_callback(err, files) {
        if (err) console.log(err);
        let fileList = [];
        // const _this = this;
        // NOTE: arrow function context bind "this".
        files.forEach(file => {
            if (this.re.test(file)) {
                let relative_path = `${this.base}/${file}`;
                // console.log(relative_path);
                const stats = fs.statSync(relative_path);
                if (stats.isFile() && stats.size === 0) {
                    del.sync(relative_path), fileList.push(relative_path);
                }
            }
        });
        fileList.length && console.log("file removed. because size was zero...", fileList);
        // notify completion of task.
        this.done && this.done();
    }

    const re_dts = /.*\.d.ts$/;
    fs.readdir(JS_DEST_DIR, _readdir_callback.bind({ re: re_dts, base: JS_DEST_DIR }));
    fs.readdir(JS_DEST_DIR + "/bench", _readdir_callback.bind({
        re: re_dts, base: JS_DEST_DIR + "/bench",
        done: cb
    }));
});

/**
 * task "dist"
 */
gulp.task("dist", ["rm:nullfile"], function(cb) {
    gulp.src([
        "LICENSE", "package.json", "README.md", "samples/*",
        "test/test.js",
        COPY_SCRIPT_FILEs
    ]).pipe(gulp.dest(function(vinyl) {
        return convertRelativeDir(vinyl, DISTRIBUTION_DIR);
    })).on("end", () => {
        // notify completion of task.
        cb();
    });
});

/**
 * task "readme"  
 * 
 * when executing by itself, it is necessary to write out the necessary data file.  
 * all processing can be completed by "emit-readme" command.
 */
gulp.task("readme", function(cb) {
    // fetch data files.
    const BEFORE = fs.readFileSync("./samples/es6.js", 'utf-8');
    const AFTER = fs.readFileSync("./samples/es6-rm_ws-true.js", 'utf-8');
    let NODE_V8 = fs.readFileSync("./logs/v8.log", 'utf-8');
    let NODE_V5 = fs.readFileSync("./logs/v5.log", 'utf-8');

    const SIZE = fs.statSync("./samples/es6.js").size;
    // prepare for readme.
    NODE_V8 = NODE_V8.replace(/(test).+/, "$1").replace(/^\s+|\s+$/g, "");
    NODE_V5 = NODE_V5.replace(/(test).+/, "$1").replace(/^\s+|\s+$/g, "");

    // create readme.md form template.
    gulp.src('./readme-template.md')
    .pipe(
        replacer(/@(SIZE|BEFORE|AFTER|NODE_V8|NODE_V5)/g, (all, tag) => {
            switch(tag) {
                case "SIZE": return SIZE.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                case "BEFORE": return BEFORE;
                case "AFTER": return AFTER;
                case "NODE_V8": return NODE_V8;
                case "NODE_V5": return NODE_V5;
            }
            return all;
        })
    )
    .pipe(rename("readme.md"))
    .pipe(gulp.dest('./')).on("end", () => {
        // notify completion of task.
        cb();
        console.log("Please run 'npm run dist'");
    });
});

// --------------------------------------------- [gulp test]
// const grmc = require("./src/gulp-rm-cmts");
// const TEST_SRC_PREFIX = "./tmp/ts/**/*";
// const TEST_SRC_FILEs = `${TEST_SRC_PREFIX}.ts`;
// const TEST_SRC_FILEs_OUT = "./tmp/output";

// gulp.task("rmc-test", ["rmc-test-del"], function(cb) {
//     gulp.src(TEST_SRC_FILEs) // TS_FILEs_PATTERN
//     .pipe(
//         /**
//          * remove_ws : remove whitespace and blank lines.
//          */
//         grmc({ remove_ws: true })
//     )
//     .pipe(rename({ suffix: "-after" }))
//     .pipe(gulp.dest(TEST_SRC_FILEs_OUT)).on("end", () => {
//         // notify completion of task.
//         cb();
//         console.log("task rmc-test done.");
//     });
// });

// gulp.task("rmc-test-del", function(cb) {
//     del.sync(TEST_SRC_FILEs_OUT);
//     cb();
// });
