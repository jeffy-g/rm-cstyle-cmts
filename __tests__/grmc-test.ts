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
describe("rm-sctyle-cmts gulp plugin test", () => {

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

    it("Scan the js related files of `node_modules (walkthrough mode)`", async () => {
        await tryTask({
            progress: true,
            // showNoops: true,
            // timeMeasure: true,
            collectRegex: true,
            collectJSDocTag: true,
            isWalk: true
        });
    }, 40 * 1000);
    it("Scan the js related files of `node_modules (remove mode)`", async () => {
        grmc.getRmcInterface().reset();
        grmc.noopPaths.length = 0;
        await tryTask({
            progress: true,
            showNoops: true,
            timeMeasure: true,
            // collectRegex: true,
        });
    }, 80 * 1000);

});
