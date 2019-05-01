/*!
-----------------------------------------------------------------------

Copyright 2017 jeffy-g hirotom1107@gmail.com

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

// NOTE: fs-extra are bit slower.
const fs = require("fs");
// const util = require('util');
const path = require("path");
// for clearLine...
const readline = require("readline");
// DEVNOTE: Performance Timing API since v8.5.0
const { performance } = require("perf_hooks");

/**
 * get node version at runtime.
 * 
 * format must be `v\d+.\d+.\d+`
 * 
 * ex:
 * ```
const utils = require("./utils");
const nv = utils.extractVersion();
console.log(nv); // => {major: 10, minor: 9, patch: 0}
```
 *
 * @param {string} versionString default is process.version
 */
function extractVersion(versionString = process.version) {
    const RE_VERSION = /v(\d+).(\d+).(\d+)/;
    // NOTE: pv is Array.isArray(pv), extend Array
    let pv = RE_VERSION.exec(versionString);
    const [_, major = 0, minor = 0, patch = 0] = pv? pv.map((value, i) => {
        return (i > 0 && parseInt(value)) || void 0;
    }): [""];
    console.log("result:", _, major, minor, patch);
    return { major, minor, patch }
}


/** getExtraArgs default config.  */
const ArgsConfig = {
    startIndex: 3,
    prefix: "-",
    varIndex: 1
}
/**
 * get arguments helper.  
 * extra params must be start with "-".  
 * ```bash
ex:
  node <script path> -minify -target es6 -setA -font serif
```
 * if param value not specified -tag after then set value is "true".
 * 
 * @param {typeof ArgsConfig} args_config
 */
function getExtraArgs(args_config, debug = false) {
    // debug log, if need.
    debug && console.log("process.argv: ", process.argv);

    args_config === void 0 && (args_config = ArgsConfig);
    const extra_index = args_config.startIndex;
    const params = {};

    if (process.argv.length > extra_index) {
        const args = process.argv;
        for (let index = extra_index; index < args.length;) {
            const opt = args[index++];
            if (opt && opt[0] === args_config.prefix) {
                let value = args[index];
                if (value === void 0 || value[0] === args_config.prefix) {
                    value = true;
                } else {
                    index++;
                }
                params[opt.substring(args_config.varIndex)] = value;
            }
        }
    }

    return params;
}

/**
 * use toLocaleString
 */
function dateStringForFile() {
    // return new Date().toLocaleString().replace(/\//g, "-").replace(/:/g, "_").replace(/ /g, "@");
    return new Date().toLocaleString().replace(/(\/|:| )/g, (match, $1) => {
        switch($1) {
            case "/": return "-";
            case ":": return "_";
            case " ": return "@";
        }
        return match;
    });
}

function checkParentDirectory(dest) {
    // UPDATE: 2017/8/29 21:51:28 need dest parent dir check!
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
        fs.mkdirSync(parent);
    }
}

/**
 * write text content to dest path.  
 * when not exists parent directory, creat it.
 * 
 * @param {string|NodeJS.ReadableStream|Buffer} content text? content.
 * @param {string} dest content output path
 */
function writeTextUTF8(content, dest) {
    // UPDATE: 2017/8/29 21:51:28 need dest parent dir check.
    checkParentDirectory(dest);

    let ws = fs.createWriteStream(dest);
    ws.on("error", function(err) {
        console.log("WriteStream.error evnet!", arguments);
    })/* .on("end", function(err) { // 2017/8/19 3:38:24 cannot work this section.
        console.log(`written ${dest}`);
    }) */
    .on("close", function(/*no args*/) {
        console.log("%s, stream closed.", dest);
    });

    if (content instanceof Buffer) {
        content = content.toString();
    }

    if (typeof content === "string") {
        const ok = ws.write(content, function (/*no args*/) {
            // console.log(arguments);
            console.log("callback of WriteStream.write");
        });
        if (ok) {
            console.log("file written: %s, size=%s", dest, ws.bytesWritten);
            ws.end(); // -> call close()
        }
    }
    // NOTE: see https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_readable_pipe_destination_options
    else if ("readable" in content) { // Readable stream?
        content.pipe(ws);
    }
}

/**
 * use process.stderr stream
 * 
 * @param {string} msg if empty string or undefined then only clear line and move cursor to head.
 */
function renderLine(msg) {
    const output = process.stderr;
    // clear the current line
    readline.clearLine(output, 0);
    readline.cursorTo(output, 0, null);
    // write the message.
    msg && output.write(msg);
}

/**
 * 
 * @param {number} timeSpanMS controll rotator cycle speed (ms). (maybe about...
 * @param {string[]} frames progress frame.
 */
const createProgress = (timeSpanMS, frames) => {
    // let index = 0;
    // return /**@type {(text: string) => void}*/ text => {
    //     const line = text === void 0? "" : `[${frames[index++ % frames.length]}]: ${text}`;
    //     !line && (progress(), 1) || process.nextTick(progress, line);
    // }
    let index = 0;
    let x = performance.now();
    return /**@type {(text: string) => void}*/ text => {
        const x2 = performance.now();
        const line = text === void 0? "" : `[${frames[index % frames.length]}]: ${text}`;
        if ((x2 - x) > timeSpanMS) {
            index++;
        }
        x = x2;
        !line && (renderLine(), 1) || process.nextTick(renderLine, line);
    }
};

/**
 * see https://webpack.js.org/plugins/progress-plugin/
 * 
 * @param {string} logFilePath 
 * @param {boolean} enableRenderLine 
 */
function createWebpackProgressPluginHandler(logFilePath, disableRenderLine = false) {
    checkParentDirectory(logFilePath);
    const log = fs.createWriteStream(logFilePath);
    /** @type {(percentage: number, message: string, ...args: string[]) => void} */
    const wpp_handler = (percentage, message, ...args) => {
        const progressMessage = `processing ${(percentage * 100).toFixed(4)}%`;
        log.write(`${progressMessage}, ${message}: ${args}\n`, () => {
            !disableRenderLine && renderLine(progressMessage);
        });
        percentage === 1 && log.end();
    };
    return wpp_handler;
}
/**
 * logger for browserify
 * 
 * @param {string} logFilePath log output path name.
 */
function createBrowserifyFileEventLogger(logFilePath) {
    checkParentDirectory(logFilePath);
    const log = fs.createWriteStream(logFilePath);
    /**
     * write browserify file event data.
     * 
     * @type {(counter: number, message: string, ...args: string[]) => void} */
    const logger = (counter, message, ...args) => {
        if (counter === void 0) {
            log.end();
            return;
        }
        const progressMessage = `resolve - ${counter}`;
        log.write(`${progressMessage}, ${message}: ${args}\n`, () => {
            renderLine(progressMessage);
        });
    };
    return logger;
}

module.exports = {
    extractVersion,
    dateStringForFile,
    getExtraArgs,
    writeTextUTF8,
    renderLine,
    createProgress,
    createWebpackProgressPluginHandler,
    createBrowserifyFileEventLogger
}

