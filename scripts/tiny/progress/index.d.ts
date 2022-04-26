/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
declare global {
    type TWebpackProgressHandler = (percentage: number, message: string, ...args: string[]) => void;
}
/**
 * see https://webpack.js.org/plugins/progress-plugin/
 *
 * @param {string} [logFilePath] can be undefined
 * @param {boolean} [disableRenderLine]
 */
export function createWebpackProgressPluginHandler(logFilePath?: string, disableRenderLine?: boolean): (percentage: number, message: string, ...args: string[]) => void;
