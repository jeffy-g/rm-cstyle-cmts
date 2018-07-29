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

// ------------------------------- need imports ------------------------------- //
const fs = require("fs");
// const util = require("util");

const del = require("del");   // global install
const gulp = require("gulp"); // global install
const tsc = require("gulp-typescript");  // global install

const replacer = require("gulp-replace");// global install
const rename = require("gulp-rename");   // global install

// source map for codecov.
const sourcemaps = require("gulp-sourcemaps"); // global install

// for version string replace.
const pkg = require("./package.json");

// ------------------------------- constant variables ------------------------------- //
/** ts compiled out put. */
const JS_DEST_DIR = "./bin";

/** npm publishing. */
const DISTRIBUTION_DIR = "./dist";
/** webpack version. */
const DISTRIBUTION_PACK_DIR = "./dist-pack";

/** ts source files. */
const TS_FILEs_PATTERN = "./src/ts/**/*.ts";

/** copy transpiled code for dist package. */
const COPY_SCRIPT_FILEs = `${JS_DEST_DIR}/**/*{.js,.d.ts,.js.map}`;


// ------------------------------- shared function ------------------------------- //
function getExtraArgs() {
    var extra_index = 3;
    var params = {};
    if (process.argv.length > extra_index) {
        var args = process.argv;
        for (var index = extra_index; index < args.length;) {
            var opt = args[index++];
            if (opt && opt[0] === "-") {
                var value = args[index];
                if (value === void 0 || value[0] === "-") {
                    value = true;
                }
                else {
                    index++;
                }
                params[opt.substring(1)] = value;
            }
        }
    }
    return params;
}
/**
 * use for gulp.dest(...)
 * @param {File?} vinyl 
 * @param {string} dest 
 */
function convertRelativeDir(vinyl, dest) { // NOTE: vinyl is https://github.com/gulpjs/vinyl
    let x = vinyl.cwd.length + 1;
    let relative_dir = vinyl.base.substring(x);
    return `${dest}/${relative_dir}`;
}
/**
 * delete files by "globs" pattern.  
 * done callback(gulp) specified if need.
 * @param {string|string[]} globs file pattern.
 * @param {() => void} done gulp callback function.
 */
function _del_hook(globs, done) {
    del(globs).then(paths => {
        console.log(`Deleted files and folders:\n${paths.join("\n")}`);
        // notify completion of task.
        done && done();
    });
}
/**
 * remove file when size is zero. (d.ts
 * @param {() => void} cb gulp callback function.
 */
function _remove_nullfile(cb) {
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
}

/**
 *  gulp webpack(-js) strip useless webpack code.
 */
// no minify code.
const re_useless_webpack_pattern = /\/[*]+\/\s+__webpack_require__\.d[^]+call\(object, property\).+/;
// minify code.
const re_useless_webpack_minified_pattern = /,\s?\w\.d\s?=\s?function\(\w,\s?\w,\s?\w\)\s?\{[\s\S]+hasOwnProperty\.call\(\w,\s?\w\);\s+\}(?=,)/;

const re_wp_striper = new RegExp(`${re_useless_webpack_pattern.source}|${re_useless_webpack_minified_pattern.source}`);

// for "tsc", "webpack-js"
// bind version string, and replace something...(for webpack
/**
 * strip_code for webpack uglify
 * @param {() => void} done gulp callback function.
 * @param {boolean} strip_code remove unused webpack code.
 */
function _replace_some(done, strip_code) {
    var version_replaced = false;
    var stream = gulp.src(["./bin/index.js", "./bin/bench/index.js"])
    .pipe( // always replace.
        replacer(/pkg.version/, (all, tag) => {
            version_replaced = true;
            return tag? pkg.version: all;
        })
    );
    var did_strip = 0;
    if (strip_code) {
        stream = stream.pipe( // strip webpack code
            replacer(re_wp_striper, ($0) => {
                did_strip++;
                return "";
            })
        );
    }
    stream.pipe(gulp.dest(function(vinyl) {
        return convertRelativeDir(vinyl, ".");
    })).on("end", () => {
        version_replaced && console.log("bind version string.");
        did_strip && console.log("strip webpack code. did_strip=%d", did_strip);
        // notify completion of task.
        done && done();
    });
}
// for "webpack-js"
/**
 * it is bundled in index.js, other code becomes unnecessary.(at webpack
 * @param {() => void} done gulp callback function.
 */
function _remove_un_js(done) {
    // in general, "del" is completed first.
    _replace_some(done, !0);
    // remove unnecessary files.
    _del_hook([`${JS_DEST_DIR}/{replace,reutil}*`, `${JS_DEST_DIR}/bench/contractor*`]);
}
/**
 * 
 * @param {() => void} done gulp callback function.
 * @param {string} dest output directory path.
 */
function _dist(done, dest) {
    gulp.src([
        "LICENSE", "package.json", "README.md", "samples/*",
        "test/test.js",
        COPY_SCRIPT_FILEs
    ]).pipe(gulp.dest(function(vinyl) {
        return convertRelativeDir(vinyl, dest);
    })).on("end", () => {
        // notify completion of task.
        done();
    });
}

// if need optional parametar.
const settings = getExtraArgs();

// ---------------------------------- tasks ---------------------------------- //
/**
 * task "clean"
 * @param {() => void} done gulp callback function.
 */
gulp.task("clean", function(done) {
    _del_hook([`${JS_DEST_DIR}/**/*`, DISTRIBUTION_DIR, DISTRIBUTION_PACK_DIR], done);
});

/**
 * task "tsc"
 * @param {() => void} done gulp callback function.
 */
gulp.task("tsc", ["clean"], function(done) {

    // copy ...
    gulp.src("./src/ts/globals.d.ts").pipe(gulp.dest(JS_DEST_DIR));

    const project = tsc.createProject("./tsconfig.json");
    // cannot took dependent source.
    // however, it seems ok if you explicitly list the file with tsconfig.json ("include" etc.
    // const result = project.src() // Compiler option "compileOnSave" requires a value of type boolean. <- "compileOnSave" option...?
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


// tsc -> rm:nullfile -> webpack
gulp.task("webpack-js", ["rm:nullfile"], (done) => {

    const webpackStream = require("webpack-stream"); // global install
    const webpack = require("webpack");              // global install
    const webpackConfig = require("./webpack.configjs");

    // gulp webpack-js -no-minify
    settings["no-minify"] && (webpackConfig.plugins = []);
    // webpack instance pass to param 2
    webpackStream(webpackConfig, webpack)
    .pipe(gulp.dest(JS_DEST_DIR))
    .on("end", function () {
        _remove_un_js(done);
        console.log("webpack-js done.");
    });
});
// transpile tsc with webpack.
gulp.task("webpack", ["clean"], (done) => {

    const webpackStream = require("webpack-stream");
    const webpack = require("webpack");
    const webpackConfig = require("./webpack.config");

    // gulp webpack -no-minify
    settings["no-minify"] && (webpackConfig.plugins = []);
    // copy ...
    gulp.src("./src/ts/globals.d.ts").pipe(gulp.dest(JS_DEST_DIR));

    // NOTE: awesome-typescript-loader use default "tsconfig.json"
    // webpack instance pass to param 2
    webpackStream(webpackConfig, webpack)
    .pipe(
        gulp.dest(JS_DEST_DIR)
        // gulp.dest(function(vinyl) { // only contained ts/index, ts/bench/index...
        //     console.log(vinyl);
        //     return convertRelativeDir(vinyl, ".");
        // })
    )
    .on("end", function() {
        _remove_nullfile();
        _remove_un_js(done); // <- this is a bit slow...
        console.log("webpack done.");
    });
});

/**
 * remove file when size is zero.
 * @param {() => void} done gulp callback function.
 */
gulp.task("rm:nullfile", ["tsc"], function (done) {
    _remove_nullfile(done);
});

/**
 * task "dist"
 */
gulp.task("dist", ["rm:nullfile"], function(done) {
    _dist(done, DISTRIBUTION_DIR);
});
/**
 * experimental task.  
 * optional flag: -no-minify
 */
gulp.task("dist:pack", ["webpack"], function(done) {
    try {
        _dist(done, DISTRIBUTION_PACK_DIR);
    } catch (e) {
        console.log(e.message);
    }
});
/**
 * experimental task.  
 * optional flag: -no-minify
 */
gulp.task("dist:packjs", ["webpack-js"], function(done) {
    _dist(done, DISTRIBUTION_PACK_DIR);
});
/**
 * experimental task.  
 */
gulp.task("とりあえずパック", [], function(done) {
    _dist(done, DISTRIBUTION_PACK_DIR);
});

/**
 * task "readme"  
 * 
 * when executing by itself, it is necessary to write out the necessary data file.  
 * all processing can be completed by "emit-readme" command.
 */
gulp.task("readme", function(cb) {
    // fetch data files.
    const BEFORE = fs.readFileSync("./samples/es6.js", "utf-8");
    const AFTER = fs.readFileSync("./samples/es6-rm_ws-true.js", "utf-8");
    let NODE_LATEST_LOG = fs.readFileSync("./logs/node-latest.log", "utf-8");
    let NODE_OLD_LOG = fs.readFileSync("./logs/node-old.log", "utf-8");

    const SIZE = fs.statSync("./samples/es6.js").size;
    const re_package_desc = /(rm-cstyle-cmts@(?:[\d.]+)\s(?:[\w-]+))\s.+/;
    const re_version = /^v\d+\.\d+\.\d+$/m;
    // prepare for readme.
    NODE_LATEST_LOG = NODE_LATEST_LOG.replace(re_package_desc, "$1").replace(/^\s+|\s+$/g, "");
    NODE_OLD_LOG = NODE_OLD_LOG.replace(re_package_desc, "$1").replace(/^\s+|\s+$/g, "");

    const NODE_LATEST_V = re_version.exec(NODE_LATEST_LOG)[0];
    const NODE_OLD_V =  re_version.exec(NODE_OLD_LOG)[0];
    // create readme.md form template.
    gulp.src("./readme-template.md")
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
    .pipe(gulp.dest("./")).on("end", () => {
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

gulp.task("default", ["dist:pack"], function (done) {
    // console.log("statictics: ...");
    done();
});
