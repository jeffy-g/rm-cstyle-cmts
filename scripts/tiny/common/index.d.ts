/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @param {string} dest
 */
export function checkParentDirectory(dest: string): void;
/**
 * @param {string} logPath
 */
export function createLogStreamAndResolvePath(logPath: string): any;
/**
 * use process.stderr stream
 *
 * @param {string} [msg] if empty string or undefined then only clear line and move cursor to head.
 */
export function renderLine(msg?: string): void;
/**
 *
 * @param {boolean} enabled
 * @param {NodeJS.WriteStream} [output]
 */
export function cursor(enabled: boolean, output?: NodeJS.WriteStream): void;
