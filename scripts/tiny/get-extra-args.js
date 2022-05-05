/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/

/**
 * @typedef {string | string[] | boolean | RegExp} TExtraArgsValue
 */
/** getExtraArgs default config.  */
const ArgsConfig = {
    /**
     * @default 2
     */
    startIndex: 2,
    /**
     * @default "-"
     */
    prefix: "-",
};
/**
 * get arguments helper.  
 * extra params must be start with "-".
 * 
 * > command example:
 * 
 * ```shell
 * node <script path> -minify -t es6 -values "value0,value1,value2" -array "['value0', 100, true, /\r?\n/g]" -regex "/\d+/g"
 * ```
 *
 * + then resut is
 *
 * ```js
 * // params
 * {
 *   minify: true,
 *   t: "es6",
 *   values: ["value0", "value1", "value2"],
 *   array: ["value0", 100, true, /\r?\n/g],
 *   regex: /\d+/g,
 * }
 * ```
 *
 * if param value not specified -tag after then set value is "true".
 * 
 * @template {Record<string, TExtraArgsValue>} T
 * @param {typeof ArgsConfig} [args_config]
 * @param {boolean} [debug]
 * @returns {T & { args?: string[]; }}
 */
function getExtraArgs(args_config, debug = false) {
    // debug log, if need.
    debug && console.log("process.argv: ", process.argv);
    /** @type {typeof ArgsConfig} */
    // @ts- ignore will be not `Partial`
    let actualConfig = args_config || {};
    actualConfig = Object.assign(ArgsConfig, actualConfig);

    const varIndex = actualConfig.prefix.length;

    const extra_index = actualConfig.startIndex || 2;
    /** @type {ReturnType<typeof getExtraArgs>} */
    const params = {};

    if (process.argv.length > extra_index) {
        const cmdArgs = process.argv;
        for (let index = extra_index; index < cmdArgs.length;) {
            const opt = cmdArgs[index++];
            if (opt) {
                if (opt.startsWith(actualConfig.prefix)) {
                    /** @type {TExtraArgsValue} */
                    let value = cmdArgs[index];
                    if (value === void 0 || value.startsWith(actualConfig.prefix)) {
                        value = true;
                    } else {
                        // DEVNOTE: now possible to process array parameters
                        // DEVNOTE: 2020/2/28 - support regex parameter
                        if (/^\[.+\]$/.test(value) || /^\/[^/]+\/[gimuys]{0,6}$/.test(value)) {
                            // value is array or regex
                            value = /** @type {string[] | RegExp} */(eval(value));
                        } else if (/\\,/.test(value)) { // not Comma Separated Value
                            // DEVNOTE: fix comma in glob strings
                            value = value.replace(/\\,/g, ",");
                        } else if (/,/.test(value)) { // Comma Separated Value
                            value = value.split(",");
                        }
                        index++;
                    }
                    params[
                        /** @type {keyof typeof params} */(opt.substring(varIndex))
                    ] = value;
                } else {
                    let args = /** @type {string[]} */(params.args);
                    !args && (params.args = args = []);
                    args.push(opt);
                }
            }
        }
    }
    return params;
};

module.exports = getExtraArgs;
