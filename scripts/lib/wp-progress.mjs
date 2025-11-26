/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file scripts/lib/wp-progress.mjs
 * @caveats To enable progress, you need to install webpack in your package local.
 */

import extras from "js-dev-tool/progress/progress-extras.js";
import lib from "js-dev-tool/common/index.js";
// const extras = require("js-dev-tool/progress/progress-extras");
// const lib = require("js-dev-tool/common/");


/**
 * @typedef {(percentage: number, message: string, ...args: string[]) => void} TWebpackProgressHandler
 * @typedef {(percentage: number, message: string, ...args: string[]) => Promise<void>} TWebpackProgressHandlerPromise
 */

const PROGRESS_ROW_START = 4;
let rowStart = PROGRESS_ROW_START;
/**
 * @param {number} pct
 * @returns {string}
 */
const formatPercentage = pct => `processing ${(pct * 100).toFixed(4)}%`;

/**
 * @param {NodeJS.WriteStream} stream 
 */
const preparProgress = async (stream = process.stdout) => {
  // \x1b[<row>;<col>H
  stream.write(`\x1b[${PROGRESS_ROW_START};1H`); // move to line 2 (1 index base)
  stream.write("\x1b[J");
};

/** @type {Map<string, number>} */
const rowsMap = new Map();

/** @type {(bunner: string) => TWebpackProgressHandler} */
const getWebpackProgressPluginHandler = ((bunner) => {

  const cwd = process.cwd();
  const render = lib.renderLine;
  const cwdLen = cwd.length;

  let dotted = 0;
  const renderDot = () => {
    process.stderr.write(".");
    // dotted++;
    if ((++dotted) % 100 === 0) {
      process.stderr.write("\n");
    }
  };
  const shortenProgress = (/** @type {number} */pct) => {
    render(formatPercentage(pct));
    pct >= 1 && (console.log(), dotted = 0);
  };

  let prepar = 0;
  /**
   * NOTE: 2025/11/17 - This is probably the best solution to ensure multiple webpack processes render.
   * 
   * I tried getting the cursor position, moveCursorTo, etc., but I ran into a wall before I could achieve the desired behavior...
   * 
   * @type {TWebpackProgressHandler}
   */
  const v5Progress = /* async */ (percentage, message, ...args) => {

    if (!prepar) {
      /* await */ preparProgress();
      prepar = 1;
    }

    if (!message) {
      message = "- done -";
    }

    // plugin name or source path
    let pathOrPluginName = args.shift() || "";
    if (pathOrPluginName) {
      const x = pathOrPluginName.lastIndexOf(cwd) + 1;
      if (x > 0) {
        pathOrPluginName = pathOrPluginName.slice(x + cwdLen);
      }
    }

    let row = rowsMap.get(bunner);
    if (typeof row !== "number") {
      rowsMap.set(bunner, (row = rowStart++));
    }
    render(
      `[${bunner}]: ${(percentage * 100).toFixed(4)}%, process: [${message}]${pathOrPluginName ? `, info: [${pathOrPluginName}]` : ""}${args.length ? " - " : ""}${args.join(", ")}`, row
    );

    percentage >= 1 && console.log();
  };

  const processType = extras.checkENV();
  if (processType === "ci") {
    return renderDot;
  } else {
    if (processType === "gitpod") {
      return shortenProgress;
    }
    return v5Progress;
  }
});

export {
  getWebpackProgressPluginHandler
};
