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

// for version string replace.
const pkg = require("./package.json");
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
gulp.task("tsc", ["clean"], function(done) {
    // const project = tsc.createProject("tsconfig.json");
    // gulp.src(TS_FILEs_PATTERN)
    // .pipe(project())
    // .pipe(
    //     gulp.dest(JS_DEST_DIR)
    // ).on("end", function() {
    //     done();
    // });

    // copy ...
    gulp.src("./src/ts/globals.d.ts").pipe(gulp.dest(JS_DEST_DIR));

    const project = tsc.createProject("tsconfig.json");
    // cannot took dependent source.
    // however, it seems ok if you explicitly list the file with tsconfig.json ("include" etc.
    // const result = project.src() // Compiler option 'compileOnSave' requires a value of type boolean. <- "compileOnSave" option...?
    const result = gulp.src(TS_FILEs_PATTERN)
        .pipe(sourcemaps.init()) // This means sourcemaps will be generated
        .pipe(project());

    // return result.js.pipe(gulp.dest(JS_DEST_DIR));
    result // .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
    .pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: JS_DEST_DIR })) // create map file per .js
    .pipe(gulp.dest(JS_DEST_DIR))
    .on("end", function () {
        console.log("tsc done.");
        _replace_some(done);
    });
});

// for "tsc", "webpack-js"
// bind version string, and replace something...(for webpack
function _replace_some(done, strip_code) {
    var stream = gulp.src('./bin/index.js')
    .pipe( // always replace.
        replacer(/pkg.version/, (all, tag) => {
            return tag? pkg.version: all;
        })
    );
    var is_strip = false;
    if (strip_code) {
        stream = stream.pipe( // strip webpack code
            replacer(/^module.exports[\S\s]+(?=\(\[\s?function\(e,\s?t,\s?n)/, (all) => {
                is_strip = true;
                return strip_statement;
            })
        );
    }
    stream.pipe(gulp.dest('./bin/')).on("end", () => {
        console.log("bind version string.");
        is_strip && console.log("strip webpack code.");
        // notify completion of task.
        done && done();
    });
}

// for "webpack-js"
function _remove_un_js(done) {
    // remove unnecessary files.
    del([`${JS_DEST_DIR}/{replace,reutil}*`]).then(paths => {
        console.log(`Deleted files and folders:\n${paths.join('\n')}`);
        _replace_some(done, !0);
    });
}
/** ------------------------------------------------------->
 * 2017-9-20 13:32:19 gulp webpack-js -> index.js replace following.
 * /^module.exports.+(?=\([function(e,t,n)/g
 */
const strip_statement = `module.exports = function(e) {
 function t(r) {
  if (n[r]) return n[r].exports;
  var s = n[r] = {
   i: r,
   l: !1,
   exports: {}
  };
  return e[r].call(s.exports, s, s.exports, t), s.l = !0, s.exports;
 }
 var n = {};
 return t.m = e, t.c = n, t.p = "", t(t.s = 1);
}`;

// tsc -> webpack
gulp.task("webpack-js", ["tsc"], (done) => {

    const webpackStream = require("webpack-stream");
    const webpack = require("webpack");
    const webpackConfig = require("./webpack.configjs");

    // webpack instance pass to param 2
    webpackStream(webpackConfig, webpack)
    .pipe(gulp.dest(JS_DEST_DIR))
    .on("end", function () {
        console.log("webpack-js done.");
        _remove_un_js(done);
    });
});

// transpile tsc with webpack (incomplete...
// gulp.task("webpack", ["clean"], (done) => {

//     const webpackStream = require("webpack-stream");
//     const webpack = require("webpack");
//     const webpackConfig = require("./webpack.config");

//     // NOTE: awesome-typescript-loader use default "tsconfig.json"
//     // webpack instance pass to param 2
//     return webpackStream(webpackConfig, webpack)
//     .pipe(gulp.dest(JS_DEST_DIR))
//     .on("end", function() {
//         // copy ...
//         gulp.src("./src/ts/globals.d.ts").pipe(gulp.dest(JS_DEST_DIR));
//         console.log("webpack done.");

//         gulp.src(TS_FILEs_PATTERN)
//         .pipe(tsc()).pipe(gulp.dest(JS_DEST_DIR)).on("end", function() {
//             ;
//         });
//     });
// });
    

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

// shared function
function _dist(done) {
    gulp.src([
        "LICENSE", "package.json", "README.md", "samples/*",
        "test/test.js",
        COPY_SCRIPT_FILEs
    ]).pipe(gulp.dest(function(vinyl) {
        return convertRelativeDir(vinyl, DISTRIBUTION_DIR);
    })).on("end", () => {
        // notify completion of task.
        done();
    });
}
/**
 * task "dist"
 */
gulp.task("dist", ["rm:nullfile"], function(done) {
    _dist(done);
});
/**
 * experimental task.
 */
gulp.task("dist:pack", ["webpack-js"], function(done) {
    _dist(done);
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
    let NODE_LATEST_LOG = fs.readFileSync("./logs/node-latest.log", 'utf-8');
    let NODE_OLD_LOG = fs.readFileSync("./logs/node-old.log", 'utf-8');

    const SIZE = fs.statSync("./samples/es6.js").size;
    // prepare for readme.
    NODE_LATEST_LOG = NODE_LATEST_LOG.replace(/(rm-cstyle-cmts@(?:[\d.]+)\s(?:[\w-]+))\s.+/, "$1").replace(/^\s+|\s+$/g, "");
    NODE_OLD_LOG = NODE_OLD_LOG.replace(/(rm-cstyle-cmts@(?:[\d.]+)\s(?:[\w-]+))\s.+/, "$1").replace(/^\s+|\s+$/g, "");

    const NODE_LATEST_V = /^v\d+\.\d+\.\d+$/m.exec(NODE_LATEST_LOG)[0];
    const NODE_OLD_V =  /^v\d+\.\d+\.\d+$/m.exec(NODE_OLD_LOG)[0];
    // create readme.md form template.
    gulp.src('./readme-template.md')
    .pipe(
        replacer(/@(SIZE|BEFORE|AFTER|NODE_LATEST_V|NODE_LATEST_LOG|NODE_OLD_V|NODE_OLD_LOG)/g, (all, tag) => {
            switch(tag) {
                case "SIZE": return SIZE.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                case "BEFORE": return BEFORE;
                case "AFTER": return AFTER;
                case "NODE_LATEST_V": return NODE_LATEST_V;
                case "NODE_OLD_V": return NODE_OLD_V;
                case "NODE_LATEST_LOG": return NODE_LATEST_LOG;
                case "NODE_OLD_LOG": return NODE_OLD_LOG;
            }
            return all;
        })
    )
    .pipe(rename("README.md"))
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
