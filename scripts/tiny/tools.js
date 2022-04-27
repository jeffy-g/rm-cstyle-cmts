#!/usr/bin/env node
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
// @ts-check

/**
 * @typedef {(matchs: string, ...args: any[]) => string} TStringReplacer
 */

const fs = require("fs");
/* utilities module by own. */
const utils = require("./utils");

/**
 * @typedef TToolArgs
 * @prop {string | string[]} basePath
 * @prop {string[]} targets
 * @prop {string} suffix
 * @prop {string} major
 * @prop {string} minor
 * @prop {string} patch
 * @prop {string[]} extras
 * @prop {string} dest
 * @prop {string} projectName
 * @prop {string} cmd
 * @prop {string} ext for `cjbm` replace extension. default is `js`
 * @prop {RegExp} test
 * @prop {RegExp} regex
 * @prop {boolean} beautify
 * @prop {boolean} rmc4ts
 * 
 * @prop {string} webpack - actual webpack source path
 * @prop {string} umd - actual umd source path
 * 
 * @prop {string} comment - zip comment
 * 
 * @prop {string[]} pkgJsons - version command
 * 
 * @prop {string} help want help? form - "-help <cmd name>"
 */

/**
 * @type {TToolArgs & ReturnType<typeof utils.getExtraArgs>}
 */
const params = utils.getExtraArgs();
console.log(params);



/**
 * @typedef TProcessSourcesOpt
 * @prop {string} [base]
 * @prop {string[]} [bases] Array of search directory paths, overriding "base"
 * @prop {RegExp} [test]
 * @prop {string[]} [targets]
 * @prop {string} [suffix]
 */
/**
 * 
 * @param {string} taskName 
 * @param {(source: string) => string} process 
 * @param {TProcessSourcesOpt} [opt] 
 */
function processSources(
    taskName,
    process, {
        base = "./build", bases,
        test = /\.js$/,
        suffix = "",
        targets,
    } = {}
) {

    /** @type {string[]} */
    let sourceFiles;
    if (!targets && (bases || base)) {
        sourceFiles = [];
        const re = params.test || test;
        const visitDirectry = (/** @type {string} */ dir) => {
            utils.walkDirSync(dir, dirent => {
                if (dirent.isFile() && re.test(dirent.name)) {
                    sourceFiles.push(`${dir}/${dirent.name}`);
                }
            });
        };
        if (Array.isArray(bases)) {
            bases.forEach(base => visitDirectry(base));
        } else {
            visitDirectry(base);
        }
    } else {
        sourceFiles = params.targets || targets;
        if (sourceFiles.length && params.basePath) {
            const basePath = Array.isArray(params.basePath)? params.basePath[0]: params.basePath;
            utils.prependStringTo(sourceFiles, basePath, "/");
        }
    }

    console.time(taskName);
    for (const sourceFile of sourceFiles) {
        if (fs.existsSync(sourceFile)) {
            // (err: any, data: string) => void
            utils.readTextUTF8(sourceFile, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
                const ret = process(data);
                const outputName = sourceFile.replace(/(?=\.js$)/, suffix);
                if (/** @type {any} */(ret) instanceof Promise) {
                    ret.then((/** @type {string} */data) => {
                        utils.writeTextUTF8(data, outputName);
                    });
                } else {
                    utils.writeTextUTF8(ret, outputName);
                }
            });
        } else {
            console.warn(`file: "${sourceFile}" is not exists`);
        }
    }
    console.timeEnd(taskName);
}

/**
 * @typedef {{
 *    fn: () => void;
 *    help: string;
 * }} TJSToolEntry
 */
/**
 * @typedef TRecordWebpackSizeArgs
 * @prop {string} dest - record path
 * @prop {string} webpack - webpacked source path. default `./dist/webpack/index.js`
 * @prop {string} umd - webpacked umd source path. default `./dist/umd/index.js`
 * 
 * @typedef TCJBMArgs currentlly support `js` only
 * @prop {string | string[]} basePath - source scan path
 */

 
/**
 * @type {Record<string, TJSToolEntry>}
 */
const ToolFunctions = {

    /** (r)ecord(W)ebpack(S)ize */
    // jstool -cmd rws [-webpack lib/webpack.js -dest "./dev-extras/webpack-size.json"]
    rws: {
        fn: () => {
            const thisPackage = utils.readJson("./package.json");
            const recordPath = params.dest || "./logs/webpack-size.json";
            const sizeRecord = fs.existsSync(recordPath)? utils.readJson(recordPath): {};
            const versionStr = thisPackage.version;
    
            const entry = {};
            let sourcePath = params.webpack || "./dist/webpack/index.js";
            if (fs.existsSync(sourcePath)) {
                entry.webpack = fs.statSync(sourcePath).size;
            }
            sourcePath = params.umd || "./dist/umd/index.js";
            if (fs.existsSync(sourcePath)) {
                entry.umd = fs.statSync(sourcePath).size;
            }
    
            if (Object.keys(entry).length) {
                sizeRecord[versionStr] = entry;
                console.log(sizeRecord);
                utils.writeTextUTF8(
                    JSON.stringify(sizeRecord, null, 2), recordPath, () => {
                        console.log("[%s] is updated", recordPath);
                    }
                );
            }
        },
        help: `(r)ecord(W)ebpack(S)ize
  ex - jstool -cmd rws [-webpack lib/webpack.js -dest "./dev-extras/webpack-size.json"]
  note:
    webpack - if not specified then apply "./dist/webpack/index.js"
    dest - if not specified then apply "./dev-extras/webpack-size.json"`
    },

    // jstool -cmd cmtTrick -targets "['core.js', 'object.js']" [-basePath extra-tests/mini-semaphore]
    cmtTrick: {
        fn: () => {
            processSources(
                "[comment trick toggle]", (data) => {
                    return data.replace(/\/+(?=\*\s?(the-comment-toggle-trick|https:\/\/coderwall))/g, $0 => {
                        const slashes = $0.length === 2? "/": "//";
                        console.log("the-comment-toggle-trick: %s", /*enableBefore*/slashes.length === 2 ? "-->enable before<--, mute after": "mute before, -->enable after<--");
                        return slashes;
                    });
                }, {
                    base: "",
                    targets: params.targets
                }
            );
        },
        help: `jstool -cmd cmtTrick -targets "['core.js', 'object.js']" -basePath extra-tests/mini-semaphore
  note:
    targets - must be array type arg, "['<path>', '<path>',...]" or "<path>,<path>,..."`
    },

    // jstool -cmd version -extras "test/web/index.html,"
    version: {
        fn: () => {
            let {
                major, minor/*, patch*/,
                pkgJsons = ["./package.json"]
            } = params;
            /** @type {string} */
            let nextVersion;
            utils.fireReplace(/"version": "(\d+)\.(\d+)\.(\d+)(-\w+)?"/, /** @type {TStringReplacer} */($0, $1, $2, $3, tag) => {
                /** @type {string | number} */
                let _major = $1;
                /** @type {string | number} */
                let _minor = $2;
                /** @type {string | number} */
                let _patch = $3;
                if (major) {
                    _minor = 0;
                    _major = +_major + 1;
                }
                else if (minor) {
                    _minor = +_minor + 1;
                }
                if (major || minor) {
                    _patch = 0;
                } else {
                    _patch = +_patch + 1;
                }
                nextVersion = `${_major}.${_minor}.${_patch}${tag? tag: ""}`;
                return `"version": "${nextVersion}"`;
            }, pkgJsons);
    
            const paths = Array.isArray(params.extras)? params.extras: typeof params.extras === "string"? [params.extras]: [];
            if (paths.length) {
                utils.fireReplace(/v(\d+\.\d+\.\d+)(-\w+)?/g, /** @type {TStringReplacer} */($0, $1, $2) => {
                    if ($1) {
                        return "v" + nextVersion; // + ($2? $2: "");
                    }
                    return $0;
                }, paths);
            }
            // @ts-ignore 
            console.log("version updated: %s", nextVersion);
        },
        help: `jstool -cmd version [-major | -minor] [-pkgJsons "./package.json,../package.json"] [-extras "test/web/index.html"]
  bump top level package.json version(can specify "package.json" paths by \`pkgJsons\` option if need), specify patch version is unnecessary.
  note:
    extras - can be "<path>,<path>,..." (array type arg)`
    },

    // rmc version 3.x
    /**
     * NOTE: keep comment that start with "/&#42;" when "&#42;/" end mark appears in same line.
     * 
     *   + if start with "/&#42;-" remove it
     */
    rmc: {
        fn: () => {

            const rmc = require("./rm-cmts-lkg");
            // DEVNOTE: 2020/5/2 - rm-cstyle-cmts dev (with scan event listener)
            if (rmc.setListener && params.rmc4ts) {
                rmc.setListener(({ event, fragment }) => {
                    if (event === /*ScannerEvent.MultiLineComment*/1) {
                        // DEVNOTE: \b is not contained LF
                        return /^\/\*(\*|!)\s|^\/\*(?!-).+\*\/$/.test(fragment);
                    }
                    // DEVNOTE: this detection is rmc default
                    // else if (event === /*ScannerEvent.SingleLineComment*/0) {
                    //     return /(?:\/\/\/?\s+@ts-\w+|\/\/\/\s*<reference)/.test(fragment);
                    // }
                    // else if (event === /*ScannerEvent.ES6Template*/2) {
                    //     ;
                    // }
                    return false;
                });
            }
            const targets = params.targets;
            const basePaths = Array.isArray(params.basePath)? params.basePath: [params.basePath];
            processSources(
                "rm-cstyle-cmts", data => {
                    const after = rmc(data);
                    // purge typescript v3.9.x extra statement
                    return after.replace(/\s(exports\.\w+\s=\s)+void 0;/m, "");
                }, {
                    bases: basePaths,
                    targets,
                    suffix: params.suffix,
                    test: params.test || /\.js$/
                }
            );
        },
        help: `jstool -cmd rmc -basePath ./dist [-rmc4ts]
  note: basePath - can be "<path>,<path>,..." (array type arg)
        rmc4ts - for typescript source.
          keep comment that start with "/*" when "*/" end mark appears in same line.
          if start with "/*-" remove it`
    },
};

/**
 * @param {TJSToolEntry} entry 
 * @returns {entry is TJSToolEntry}
 */
function isJSToolEntry(entry) {
    if (typeof entry !== "object") return false;
    return typeof entry.fn === "function" && typeof entry.help === "string";
}
/**
 * @param {string} cmd 
 * @returns {void}
 */
function printHelp(cmd) {
    const entry = ToolFunctions[cmd];
    console.log(`"${cmd}" help: ${entry.help}`);
}

if (params.cmd) {
    const entry = ToolFunctions[params.cmd];
    isJSToolEntry(entry) && entry.fn();
} else if (params.help) {
    const cmdName = params.help;
    if (typeof cmdName === "string") {
        printHelp(cmdName);
    } else {
        console.log("invalid arg, help form is '-help <cmd name>'");
    }
} else {
    const commands = Object.keys(ToolFunctions);
    console.log(`
Usage: node jstool -cmd <command name>
 - - - - available commands:`
    );
    for (const cmd of commands) {
        printHelp(cmd);
    }
}
