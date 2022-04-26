/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
const lib = require("../common");
const {
    checkENV,
    wppHandlerV5,
    wppHandlerV4,
    isWebpackV5later
} = require("./progress-extras");


/**
 * see https://webpack.js.org/plugins/progress-plugin/
 * 
 * @param {string} [logFilePath] can be undefined
 * @param {boolean} [disableRenderLine]
 * @version 2.0 detect webpack version(v4 or v5)
 * @version 2.1 detect gitpod process
 */
function createWebpackProgressPluginHandler(logFilePath, disableRenderLine = false) {

    const formatPercentage = (/** @type {number} */pct) => {
        return `processing ${(pct * 100).toFixed(4)}%`;
    };

    let dotted = 0;
    const renderDot = () => {
        process.stderr.write(".");
        // FIXME: first renderDot line length is not 100
        dotted++;
        if (dotted % 100 === 0) {
            process.stderr.write("\n");
        }
    };
    /** @type {((msg?: string) => void) | undefined} */
    const renderer = process.env.CI? renderDot: lib.renderLine;

    // (percentage: number, msg: string, moduleProgress?: string, activeModules?: string, moduleName?: string) => void
    /** @type {TWebpackProgressHandler} */
    let wpp_handler; {
        const shorttenProgress = (/** @type {number} */pct) => {
            renderer(formatPercentage(pct));
            pct === 1 && (console.log(), dotted = 0);
        };
        if (logFilePath !== void 0) {
            const wpp_logger = lib.createLogStreamAndResolvePath(logFilePath);
            /** @type {((p: number) => void) | undefined} */
            let writeCallback;

            if (!disableRenderLine) {
                writeCallback = shorttenProgress;
            }
            wpp_handler = (percentage, message, ...args) => {
                wpp_logger.write(`${formatPercentage(percentage)}, ${message}: ${args}\n`, () => {
                    writeCallback && writeCallback(percentage);
                });
                percentage === 1 && wpp_logger.end();
            };
        } else {
            if (disableRenderLine) {
                // DEVNOTE: 2022/02/16 ignore CI process
                wpp_handler = () => {};
            } else {
                const processType = checkENV();
                if (processType === "ci") {
                    wpp_handler = renderDot;
                } else {
                    if (processType === "gitpod") {
                        wpp_handler = shorttenProgress;
                    } else {
                        wpp_handler = isWebpackV5later()? wppHandlerV5: wppHandlerV4;
                    }
                }
            }
        }
    }

    return wpp_handler;
}

module.exports = {
    createWebpackProgressPluginHandler
};
