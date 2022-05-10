/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2019 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
export type TGrmcTaskArgsBase = {
    paths?: string | string[];
    progress?: true;
    collectJSDocTag?: true;
    showNoops?: boolean;
    /**
     * cleanup previous output then exit
     */
    cleanup?: boolean;
    /**
     * scan external directory?
     */
    useExtern?: boolean;
    preserveJSDoc?: boolean;
};
export type TGrmcTaskArgs = TGrmcTaskArgsBase & NsGulpRmc.TOptions;
/**
 * @typedef TGrmcTaskArgsBase
 * @prop {string | string[]} [paths]
 * @prop {true} [progress]
 * @prop {true} [collectJSDocTag]
 * @prop {boolean} [showNoops]
 * @prop {boolean} [cleanup] cleanup previous output then exit
 * @prop {boolean} [useExtern] scan external directory?
 *
 * @typedef {TGrmcTaskArgsBase & NsGulpRmc.TOptions} TGrmcTaskArgs
 */

/**
 * #### `gulp-rm-cmts` test task Main
 *
 * @param {typeof import("../src/gulp")} grmc gulp-rm-cmts package
 * @param {TGrmcTaskArgs} settings
 * @param {"cjs" | "esm"} mode
 */
export function task(
    grmc: typeof import("../src/gulp"),
    settings: TGrmcTaskArgs,
    mode?: "cjs" | "esm"
): Promise<void>;
