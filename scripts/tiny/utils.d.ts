/*!
  The MIT License (MIT)

  Copyright (c) 2022 jeffy-g hirotom1107@gmail.com

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
/// <reference types="node"/>
/// <reference path="./basic-types.d.ts"/>

import type {
    Dirent
} from "fs";

export type TFsCallback = (err: any, data: string) => void;
/**
 * <T>
 */
export type TypedRecord<T> = {
    [x: string]: T;
};
export type TReadJsonCallback<T> = (err: any, data: Record<string, T>) => void;
export type TExtraArgsValue = string | boolean | RegExp | string[];
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
export function prependStringTo(str_array: string[], content: string, suffix?: string): void;

/**
 * use toLocaleString
 *@param {any} ymd use simple year month day formant? default `false`
 *  + should be truthy/falsy value
 */
export function dateStringForFile(ymd?: any): string;

export * as getExtraArgs from "./get-extra-args";

/**
 * write text content to dest path.
 * when not exists parent directory, creat it.
 *
 * @param {string|NodeJS.ReadableStream|Buffer} content text? content.
 * @param {string} dest content output path
 * @param {() => void} [callback] the callback function
 */
export function writeTextUTF8(content: string | NodeJS.ReadableStream | Buffer, dest: string, callback?: () => void): void;

type TFsCallback = (err: any, data: string) => void;
/**
 * @param {string} from file path.
 * @param [callback]
 */
export function readTextUTF8<C extends TBD<TFsCallback>, R extends undefined extends C ? string : void>(from: string, callback?: C): R;

type TypedRecord<T> = Record<string, T>;
type TReadJsonCallback<T> = (err: any, data: TypedRecord<T>) => void
/**
 * NOTE: when callback specified, returns undefined
 *
 * @param {string} path
 * @param [callback]
 */
export function readJson<T, C extends TBD<TReadJsonCallback<string>>, R extends undefined extends C ? TypedRecord<T> : void>(path: string, callback?: C): R;
/**
 *
 * @param {string} path
 * @param {(dirent: Dirent) => void} handler
 */
export function walkDirSync(path: string, handler: (dirent: Dirent) => void): void;

/**
 * it is bundled in webpack.js, other code becomes unnecessary.(at webpack
 *
 *   + 📝 using "exec" internally
 *     * 🆗️ can use pipe command
 *
 * @param {string} command
 * @param {(result: string) => void} doneCallbackWithArgs gulp callback function.
 */
export function execWithOutputResult(command: string, doneCallbackWithArgs: (result: string) => void): any;

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
export function convertRelativeDir(vinyl: any, dest?: string): string;

/**
 * @param {RegExp} regex
 * @param {string | Function} replacement
 * @param {string[]} paths Paths that do not exist are ignored
 * @param {boolean} [async]
 *
 * @date 2019-4-26
 */
export function fireReplace(regex: RegExp, replacement: string | Function, paths: string[], async?: boolean): void;

export const CI: boolean;
export const log: typeof console.log;
