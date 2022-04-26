/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference path="./index.d.ts"/>
const lib = require("../common");


const checkENV = () => {
    const env = process.env;
    if (env.CI)
        return "ci";
    for (const k of Object.keys(env)) {
        if (k.startsWith("GITPOD_"))
            return "gitpod";
    }
    return "maybe-local";
};
/** @type {TWebpackProgressHandler} */
const wppHandlerV4 = ((renderer, cwd) => {
    return (percentage, message, ...args) => {
        // DEVNOTE: 2022/02/16 these values are webpack v4 (maybe
        let [modules, actives, path = ""] = args;
        // let [modules, actives, path = ""] = args;
        if (message) {
            const x = path.lastIndexOf(cwd) + 1;
            x > 0 && (path = path.substring(x + cwd.length));
        } else { // which means all processing done
            message = "- done -";
        }
        // TODO: 2022/2/16 webpack version 5 is different parameters
        //   so rewrite it.
        renderer(
            `processing ${(percentage * 100).toFixed(4)}% | ` + message + ` [${modules}, ${actives}] ${path}`
        );
        percentage === 1 && console.log();
    };
})(lib.renderLine, process.cwd());

/** @type {TWebpackProgressHandler} */
const wppHandlerV5 = ((renderer, cwd) => {
    return (percentage, message, ...args) => {
        if (!message) {
            message = "- done -";
        }
        // plugin name or source path
        let str = args[1];
        if (str) {
            const x = str.lastIndexOf(cwd) + 1;
            if (x > 0) {
                args[1] = str.substring(x + cwd.length);
            }
        }
        str = args.shift();
        renderer(
            `pct: ${(percentage * 100).toFixed(4)}%, process: [${message}]${str ? `, info: [${str}]` : ""}${args.length ? " - " : ""}${args.join(", ")}`
        );
        // console.log(`pct: ${(percentage*100).toFixed(4)}%, process: [${message}]${ str? `, info: [${str}]`: "" }${ args.length? " -": "" }`, args.join(", "));
        percentage === 1 && console.log();
    };
})(lib.renderLine, process.cwd());



let checkedCache;
/**
 * @type {() => boolean}
 */
const isWebpackV5later = () => {
    if (checkedCache === void 0) {
        try {
            const webpack = require("webpack");
            checkedCache = +webpack.version[0] > 4;
        } catch (e) {
            console.info(e);
            checkedCache = false;
        }
    }
    return checkedCache;
};

module.exports = {
    checkENV,
    wppHandlerV4,
    wppHandlerV5,
    isWebpackV5later
};
