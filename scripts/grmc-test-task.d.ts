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
 * #### `gulp-rm-cmts` test task Main
 *
 * @param {typeof import("../src/gulp")} grmc gulp-rm-cmts package
 * @param {TGrmcTaskArgs} settings
 * @param {"cjs" | "esm"} mode
 * @returns {Promise<void>} 
 */
export function task(
    grmc: typeof import("../src/gulp"),
    settings: TGrmcTaskArgs,
    mode?: "cjs" | "esm"
): Promise<void>;
