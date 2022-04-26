/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
// @ts-check

// NOTE: fs-extra are bit slower.
const fs = require("fs");
// const util = require('util');
const path = require("path");
// for clearLine...
const readline = require("readline");

/**
 * @param {string} dest 
 */
function checkParentDirectory(dest) {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
        // DEVNOTE: fix Error: ENOENT: no such file or directory, mkdir ./path/to/dir
        fs.mkdirSync(parent, {recursive: true});
    }
}
/**
 * @param {string} logPath 
 */
function createLogStreamAndResolvePath(logPath) {
    checkParentDirectory(logPath);
    return fs.createWriteStream(logPath);
}

/**
 * use process.stderr stream
 * 
 * @param {string} [msg] if empty string or undefined then only clear line and move cursor to head.
 */
// CHANGES: 2020/2/18 18:28:17 - fix ちらつき
// dir <number>
//   -1: to the left from cursor
//    1: to the right from cursor
//    0: the entire line
// 
function renderLine(msg) {
    const output = process.stderr;
    // move cursor to line head
    readline.cursorTo(output, 0);
    // write the message.
    msg && output.write(msg);
    // clear line to the right from cursor
    readline.clearLine(output, 1);
}
/**
 * 
 * @param {boolean} enabled 
 * @param {NodeJS.WriteStream} [output] 
 */
const cursor = (enabled, output = process.stderr) => {
    if (enabled) {
        output.write('\x1B[?25h');
    } else {
        output.write('\x1B[?25l');
    }
};

module.exports = {
    checkParentDirectory,
    createLogStreamAndResolvePath,
    renderLine,
    cursor
};
