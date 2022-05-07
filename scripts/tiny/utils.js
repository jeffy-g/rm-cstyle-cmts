/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    <one line to give the program's name and a brief idea of what it does.>
    Copyright (C) 2017 jeffy-g hirotom1107@gmail.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
*/
// NOTE: fs-extra are bit slower.
const fs = require("fs");
const lib = require("./common");
const getExtraArgs = require("./get-extra-args");
const CI = !!process.env.CI;
const log = (() => {
    return CI? () => ({}): console.log;
})();

/**
 * use toLocaleString
 *@param {any} ymd use simple year month day formant? default `false`
 *  + should be truthy/falsy value
 */
function dateStringForFile(ymd = false) {
    return new Date().toLocaleString(void 0, {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: ymd? void 0: "2-digit",
        minute: ymd? void 0: "2-digit",
        second: ymd? void 0: "2-digit",
        // DEVNOTE: 191215 - "-" character appeared in node v13.3.0 (maybe
    }).replace(/(-|\/|:| )/g, (match, $1) => {
        switch($1) {
            case "-":
            case "/":
            case ":": return "";
            case " ": return "@";
        }
        return match;
    });
}


/**
 * 
 * @param {string} path
 * @param {(dirent: import("fs").Dirent) => void} handler 
 */
function walkDirSync(path, handler) {
    fs.readdirSync(path, { withFileTypes: true }).forEach(handler);
}

/**
 * write text content to dest path.  
 * when not exists parent directory, creat it.
 * 
 * @param {string|NodeJS.ReadableStream|Buffer} content text? content.
 * @param {string} dest content output path
 * @param {() => void} [callback] the callback function
 */
function writeTextUTF8(content, dest, callback) {
    // need dest parent dir check.
    lib.checkParentDirectory(dest);

    const ws = fs.createWriteStream(dest)
    .on("error", function(err) {
        console.log("WriteStream.error evnet!", arguments);
    })
    .on("close", function(/*no args*/) {
        log("[close] %s, stream closed", dest);
        callback && callback();
    });

    if (content instanceof Buffer) {
        content = content.toString("utf8");
    }

    if (typeof content === "string") {
        // chunk <string> | <Buffer> | <Uint8Array> | <any>
        const success = ws.write(content);

        log("writeTextUTF8: write: %s,", dest, success);
        if (!success) {
            ws.once("drain", function () {
                log("[drain] file written: %s,", dest, ws.bytesWritten);
                ws.end(); // -> call close()
            });
        }
        else {
            // process.nextTick(callback);
            callback && callback();
        }
    }
    // NOTE: see https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_readable_pipe_destination_options
    else if ("readable" in content) {
        content.pipe(ws);
    }
}

/**
 * @typedef {(err: any, data: string) => void} TFsCallback
 */
/**
 * @template {TFsCallback | undefined} C description
 * @template {Conditional<C, string, void>} R description
 * @param {string} from file path.
 * @param {C} [callback]
 * @returns {R} description
 */
function readTextUTF8(from, callback) {
    if (typeof callback === "function") {
        fs.readFile(from, "utf8", callback);
    }
    else {
        return /** @type {R} */(fs.readFileSync(from, "utf8"));
    }
    // return /** @type {R} */(undefined);
}

/**
 * @template T
 * @typedef {Record<string, T>} TypedRecord<T>
 */
/**
 * @template T
 * @typedef {TBD<(err: any, data: TypedRecord<T>) => void>} TReadJsonCallback
 */
/**
 * NOTE: when callback specified, returns undefined
 * 
 * @template T
 * @template {TReadJsonCallback<T>} C description
 * @template {Conditional<C, TypedRecord<T>, void>} R description
 * @param {string} path file path.
 * @param {C} [callback]
 * @returns {R} description
 */
function readJson(path, callback) {
    if (typeof callback === "function") {
        readTextUTF8(path, (err, data) => {
            callback(err, JSON.parse(data));
        });
    }
    else {
        const data = readTextUTF8(path);
        return JSON.parse(data);
    }
    // return /** @type {R} */(undefined);
}


/** @type {(options: any) => void} */
let nodeReplace;
/**
 * @param {RegExp} regex 
 * @param {string | Function} replacement 
 * @param {string[]} paths Paths that do not exist are ignored
 * @param {boolean} [async] 
 * 
 * @date 2019-4-26
 */
// DEVNOTE: 2020/9/20 - Added exception handling code
function fireReplace(regex, replacement, paths, async = false) {
    // @ts-ignore
    nodeReplace === void 0 && (nodeReplace = require("replace"));
    if (Array.isArray(paths)) {
        // DEVNOTE: 2020/5/11 22:41:06 - exclude non exists files
        paths = paths.filter(fs.existsSync);
        nodeReplace({
            regex,//: /init\.tsx/g,
            replacement,//: "init.js",
            paths,//: ["./lib/index.html"],
            recursive: false,
            silent: false,
            // for test?
            preview: false,
            // replace function.
            // funcFile: "js source path",
            // 
            async,
            // regexp flags, if "regex" are plain string then needed.
            ignoreCase: false,
            multiline: false,
        });
    } else {
        throw new Error(`invalid paths parameter: paths=[${paths}]`);
    }
}

/**
 * it is bundled in webpack.js, other code becomes unnecessary.(at webpack
 * 
 *   + 📝 using "exec" internally
 *     * 🆗️ can use pipe command
 * 
 * @param {string} command
 * @param {(result: string) => void} doneCallbackWithArgs gulp callback function.
 */
function execWithOutputResult(command, doneCallbackWithArgs) {
    console.log();
    const { exec } = require("child_process");
    return exec(command, (err, stdout/* , stderr */) => {
            if (err) {
                console.error(err);
            } else {
                doneCallbackWithArgs(stdout);
            }
        }
    );
}

/**
 * use for gulp.dest(...)
 * 
 * **useful when glob pattern can not be used (when path must be explicitly specified).**
 * 
 * ```js
 *  gulp.src([
 *      "./src/app-config.ts",
 *      "./src/auth/{eve-sso,eve-sso-v2e}.php"
 *  ]).pipe(
 *      ...
 *  ).pipe(gulp.dest((vinyl) => {
 *      return convertRelativeDir(vinyl);
 *  })).on("end", () => {
 *      console.log("done");
 *  });
 * ```
 * @param {import("vinyl")} vinyl 
 * @param {string} dest default is "." -> node launched directory. (cwd?)
 */
function convertRelativeDir(vinyl, dest = ".") { // NOTE: vinyl is https://github.com/gulpjs/vinyl
    // if (false) {
    //     console.log("convertRelativeDir::debug log");
    //     console.log(vinyl.cwd);
    //     console.log(vinyl.base);
    // }
    let x = vinyl.cwd.length + 1;
    let relative_dir = vinyl.base.substring(x);
    return `${dest}/${relative_dir}`;
}

/**
 * prepend `content` to the beginning of each element of `str_array`
 * 
 * form:
 * ```js
 * `${content}${suffix}${<str_array element>}`
 * ```
 *
 * @param {string[]} str_array the string array
 * @param {string} content prepend content
 * @param {string} [suffix]
 * @date 2020/2/16
 * @version 2.0 rename `appendStringTo` -> `prependStringTo`
 */
function prependStringTo(str_array, content, suffix = "") {
    /** @type {string} */
    let target;
    for (let i = 0; target = str_array[i];) {
        str_array[i++] = `${content}${suffix}${target}`
    }
}

module.exports = {
    prependStringTo,

    dateStringForFile,
    getExtraArgs,
    writeTextUTF8,
    readTextUTF8,
    readJson,
    walkDirSync,

    execWithOutputResult,
    convertRelativeDir,

    fireReplace,
    CI,
    log
};
