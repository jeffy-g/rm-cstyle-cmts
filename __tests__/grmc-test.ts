/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import * as grmc from "../src/gulp/";
import {
    task, TGrmcTaskArgs
} from "../scripts/grmc-test-task";
/**
 * @typedef {import("../scripts/grmc-test-task").TGrmcTaskArgs} TGrmcTaskArgs
 */


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                  run test
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
describe("rm-cstyle-cmts gulp plugin test", () => {

    /**
     * @param {TGrmcTaskArgs} args 
     */
    const tryTask = async (args: TGrmcTaskArgs) => {
        let error: any = null;
        try {
            await task(grmc, args);
        } catch (e: any) {
            error = e;
        }
        expect(error).toBe(null);
    };
    const reset = () => {
        grmc.getRmcInterface().reset();
        grmc.noopPaths.length = 0;
    };

    describe.each<[string, TGrmcTaskArgs, number]>([
        ["walkthrough mode", {
            progress: true,
            // showNoops: true,
            collectRegex: true,
            collectJSDocTag: true,
            isWalk: true
        }, 40 * 1000],
        ["remove mode", {
            progress: true,
            showNoops: true,
            timeMeasure: true,
            // collectRegex: true,
        }, 80 * 1000],
    ])(
        "Scan the js related files of `node_modules`",
        (title, opt, timeout) => {
            it(title, async () => {
                !opt.isWalk && reset();
                await tryTask(opt);
            }, timeout);
        }
    );
});
