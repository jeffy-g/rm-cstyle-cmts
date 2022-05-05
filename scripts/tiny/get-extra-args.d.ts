/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
export = getExtraArgs;
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
function getExtraArgs<T extends Record<string, TExtraArgsValue>>(args_config?: typeof ArgsConfig, debug?: boolean): T & {
    args?: string[];
};
declare namespace getExtraArgs {
    export { TExtraArgsValue };
}
declare namespace ArgsConfig {
    const startIndex: number;
    const prefix: string;
}
type TExtraArgsValue = string | string[] | boolean | RegExp;
