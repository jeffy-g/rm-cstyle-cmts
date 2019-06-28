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
set NODE_PATH=
for /f "usebackq delims=" %a in (`npm root -g`) do set NODE_PATH=%a
echo %NODE_PATH%
*/

// ------------------------------- need imports ------------------------------- //
const fs = require("fs");
const del = require("del");

const gulp = require("gulp");
const tsc = require("gulp-typescript");
const rename = require("gulp-rename");
const greplace = require("gulp-replace");
// source map for codecov.
const sourcemaps = require("gulp-sourcemaps");

const utils = require("./scripts/utils");


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
/**
 * @typedef {import("vinyl")} Vinyl
 */
/**
 * use for gulp.dest(...)
 * @param {Vinyl} vinyl 
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
 * @param {() => void} [done] gulp callback function.
 */
function _clean(globs, done) {
    // del(globs, { force: true }).then(paths => {
    //     console.log(`Deleted files and folders:\n${paths.join("\n")}`);
    //     // notify completion of task.
    //     done && done();
    // });
    const paths = del.sync(globs, { force: true });
    console.log(`Deleted files and folders:\n${paths.join("\n")}`);
    // notify completion of task.
    done && done();
}
/**
 * remove file when size is zero. (d.ts
 * @param {() => void} [done] gulp callback function.
 */
function _remove_nullfile(done) {
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
    // DEVNOTE: when umd build
    const benchDir = JS_DEST_DIR + "/bench";
    if (fs.existsSync(benchDir)) {
        fs.readdir(benchDir, _readdir_callback.bind({
            re: re_dts, base: benchDir,
            done
        }));
    }
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
 * @param {boolean} [strip_code] remove unused webpack code.
 */
function _replace_some(done, strip_code) {
    // DEVNOTE: see - https://gulpjs.com/docs/en/api/src
    let stream = gulp.src(["./bin/index.js", "./bin/bench/index.js"], { allowEmpty: true });
    let did_strip = 0;
    if (strip_code) {
        stream = stream.pipe( // strip webpack code
            greplace(re_wp_striper, (/*$0*/) => {
                did_strip++;
                return "";
            })
        );
    }
    stream.pipe(gulp.dest(vinyl => {
        return convertRelativeDir(vinyl, ".");
    })).on("end", () => {
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
    _clean([`${JS_DEST_DIR}/{replace,reutil}*`, `${JS_DEST_DIR}/bench/contractor*`]);
}
/**
 * 
 * @param {() => void} done gulp callback function.
 * @param {string} dest output directory path.
 */
function _dist(done, dest) {
    gulp.src([
        "LICENSE", "package.json", "README.md", "samples/!(core*|typeid-map*|*rm_ws*)",
        // "test/test.ts",
        COPY_SCRIPT_FILEs
    ]).pipe(gulp.dest(vinyl => {
        return convertRelativeDir(vinyl, dest);
    })).on("end", () => {
        // notify completion of task.
        done();
    });
}

const _copyDefinitions = () => {
    // copy ...
    gulp.src(["./src/ts/**/{index,globals}.d.ts", "./src/ts/**/package.json"])
    .pipe(gulp.dest(JS_DEST_DIR)).on("end", () => {
        // notify completion of task.
        console.log("did copy of definitions(.d.ts)");
    });
};


/**
 * generate gulp plugin
 * 
 * @param {() => void} [done] 
 */
const compileGulpPlugin = (done) => {

    // const through = require("through2");
    // const include = () => {
    //     return through.obj(function (file, enc, callback) {
    //         console.log("grmc:tsc:", file.relative);
    //         if (file.relative.indexOf("gulp") !== -1) {
    //             this.push(file);
    //         }
    //         return callback();
    //     });
    // };

    const project = tsc.createProject("./tsconfig.json");
    // cannot took dependent source.
    // however, it seems ok if you explicitly list the file with tsconfig.json ("include" etc.
    // const result = project.src() // Compiler option "compileOnSave" requires a value of type boolean. <- "compileOnSave" option...?
    const result = gulp.src("./src/ts/gulp/index.ts")
        .pipe(sourcemaps.init()) // This means sourcemaps will be generated
        .pipe(project());
        // .pipe(include());

    // return result.js.pipe(gulp.dest(JS_DEST_DIR));
    result.pipe(sourcemaps.write(".", { // create map file per .js
        // DEVNOTE: 2019-5-14 - for test coverage, fix: remap-istanbul has incomplete detection of source.
        includeContent: false,
        // sourceRoot: ""
    }))
    .pipe(gulp.dest(vinyl => {
        // DEVNOTE: see tsconfig.json@rootDir
        return convertRelativeDir(vinyl, ".");
    }))
    .on("end", function () {
        console.log("compileGulpPlugin done.");
        done && done();
    });
};

/**
 * 
 * @param {string} webpackConfigPath the webpack config file script id
 * @param {() => void} done callback for gulp task chain
 */
function doWebpack(webpackConfigPath, done) {
    // const webpackStream = require("webpack-stream");
    const webpack = require("webpack");
    /** @type {import("webpack").Configuration[]} */
    const webpackConfig = require(webpackConfigPath);

    // gulp webpack -no-minify
    settings["no-minify"] && (webpackConfig[0].optimization = webpackConfig[1].optimization = {});
    // copy ...
    _copyDefinitions();

    // const compiler =
    webpack(webpackConfig, (error, stats) => {
        if (error) {
            console.log(error);
            return;
        }
        _remove_nullfile();
        _remove_un_js(done); // <- this is a bit slow...
        console.log("webpack build done.");
        compileGulpPlugin();
    });
    // // webpack instance pass to param 2
    // // - - - - web build
    // webpackStream(
    //     webpackConfig[0], webpack,
    //     // (err, stats) => {
    //     //     console.log("Error:", err);
    //     //     console.log(stats.toJson("normal"));
    //     // }
    // ).pipe(
    //     // DEVNOTE: ⚠️ gulp.dest forces change output directory. (ignore webpack.config.js@output.path)
    //     gulp.dest(JS_DEST_DIR + "/web")
    // ).on("end", function() {
    //     console.log("webpack 'web' build done.");
    // });

    // // - - - - node build
    // webpackStream(
    //     webpackConfig[1], webpack,
    // ).pipe(
    //     gulp.dest(JS_DEST_DIR)
    // ).on("end", function() {
    //     _remove_nullfile();
    //     _remove_un_js(done); // <- this is a bit slow...
    //     console.log("webpack 'node' build done.");
    //     compileGulpPlugin();
    // });
}
// if need optional parametar.
const settings = utils.getExtraArgs();

// ---------------------------------- tasks ---------------------------------- //
/**
 * task "clean"
 * @param {() => void} done gulp callback function.
 */
gulp.task("clean", function(done) {
    _clean([DISTRIBUTION_DIR, DISTRIBUTION_PACK_DIR, JS_DEST_DIR], done);
});

/**
 * task "tsc"
 * @param {() => void} done gulp callback function.
 */
gulp.task("tsc", gulp.series("clean", function(done) {
    // copy ...
    _copyDefinitions();

    const project = tsc.createProject("./tsconfig.json");
    // cannot took dependent source.
    // however, it seems ok if you explicitly list the file with tsconfig.json ("include" etc.
    // const result = project.src() // Compiler option "compileOnSave" requires a value of type boolean. <- "compileOnSave" option...?
    const result = gulp.src(TS_FILEs_PATTERN)
        .pipe(sourcemaps.init()) // This means sourcemaps will be generated
        .pipe(project());

    // return result.js.pipe(gulp.dest(JS_DEST_DIR));
    result // .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
    // 
    // DEVNOTE: 2019-5-13
    //  [about WriteOption]:
    //    It seems that the "sourceRoot" property is basically unnecessary.
    //    Also, if the value of "sourceRoot" is set to empty string or not specified,
    //    creation of coverage report (html) to typescript source will fail.
    //
    //    *This behavior seems to be the same when setting the "sourceRoot" property in tsconfig.json.
    // 
    .pipe(sourcemaps.write(".", { // create map file per .js
        // DEVNOTE: 2019-5-14 - for test coverage, fix: remap-istanbul has incomplete detection of source.
        // includeContent: true,
        // sourceRoot: ""
    }))
    .pipe(gulp.dest(JS_DEST_DIR))
    .on("end", function () {
        console.log("tsc done.");
        _replace_some(done);
    });
}));

/**
 * remove file when size is zero. (.d.ts etc)
 * @param {() => void} done gulp callback function.
 */
gulp.task("gulp:tsc", gulp.series("tsc", function (done) {
    _remove_nullfile(done);
}));


// tsc -> gulp:tsc -> webpack
gulp.task("webpack-js", gulp.series("gulp:tsc", (done) => {
    doWebpack("./webpack.configjs", done);
}));
// transpile tsc with webpack.
gulp.task("webpack", gulp.series("clean", (done) => {
    doWebpack("./webpack.config", done);
}));

/**
 * task "dist"
 * without webpack
 */
gulp.task("dist", gulp.series("gulp:tsc", function(done) {
    _dist(done, DISTRIBUTION_DIR);
}));
/**
 * distribution build task.  
 * optional flag: -no-minify
 */
gulp.task("dist:pack", gulp.series("webpack", function(done) {
    try {
        _dist(done, DISTRIBUTION_PACK_DIR);
    } catch (e) {
        console.log(e.message);
    }
}));
/**
 * distribution build task.  
 * optional flag: -no-minify
 */
gulp.task("dist:packjs", gulp.series("webpack-js", function(done) {
    _dist(done, DISTRIBUTION_PACK_DIR);
}));

/**
 * task "readme"  
 * 
 * when executing by itself, it is necessary to write out the necessary data file.  
 * all processing can be completed by "emit-readme" command.
 */
gulp.task("readme", function(cb) {

    let NODE_LATEST_LOG = fs.readFileSync("./logs/node-latest.log", "utf-8");
    let NODE_OLD_LOG = fs.readFileSync("./logs/node-old.log", "utf-8");

    const SIZE = fs.statSync("./samples/es6.js").size;
    const re_package_desc = /(rm-cstyle-cmts@(?:[\d.]+)\s(?:[\w-]+))\s.+/;
    const re_version = /^v\d+\.\d+\.\d+$/m;
    // prepare for readme.
    NODE_LATEST_LOG = NODE_LATEST_LOG.replace(re_package_desc, "$1").replace(/^\s+|\s+$|\r/g, "");
    NODE_OLD_LOG = NODE_OLD_LOG.replace(re_package_desc, "$1").replace(/^\s+|\s+$|\r/g, "");

    const NODE_LATEST_V = re_version.exec(NODE_LATEST_LOG)[0];
    const NODE_OLD_V =  re_version.exec(NODE_OLD_LOG)[0];
    // create readme.md form template.
    gulp.src("./readme-template.md")
    .pipe(
        greplace(/@(SIZE|NODE_LATEST_V|NODE_LATEST_LOG|NODE_OLD_V|NODE_OLD_LOG)/g, (matched, tag) => {
            switch(tag) {
                case "SIZE": return SIZE.toLocaleString();
                case "NODE_LATEST_V": return NODE_LATEST_V;
                case "NODE_OLD_V": return NODE_OLD_V;
                case "NODE_LATEST_LOG": return NODE_LATEST_LOG;
                case "NODE_OLD_LOG": return NODE_OLD_LOG;
            }
            return matched;
        })
    )
    .pipe(rename("README.md"))
    .pipe(gulp.dest("./")).on("end", () => {
        // notify completion of task.
        cb();
        console.log("Please run 'npm run dist'");
    });
});



gulp.task("default", gulp.series("dist:pack", function (done) {
    done();
}));
