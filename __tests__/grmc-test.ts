/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
// <reference path="../src/gulp/index.d.ts"/>
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// import * as grmc from "../src/gulp/";
import { task } from "../scripts/grmc-test-task.js";
import type { TGrmcTaskArgs } from "../scripts/grmc-test-task.js";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                  run test
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

eachModule("../src/gulp/");
eachModule("../dist/cjs/gulp/");
eachModule("../dist/webpack/gulp/");

function eachModule(path: string) {

    let grmc: typeof import("../src/gulp/");
    beforeAll(async () => {
        grmc = await import(path);
    });

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
        const stimeout = 600 * 1000;

        describe.each<[title: string, opt: TGrmcTaskArgs, timeout: number, disable?: number]>([
            [`[${path}] walkthrough mode`, {
                progress: true,
                // showNoops: true,
                collectRegex: true,
                collectJSDocTag: true,
                isWalk: true
            }, stimeout],
            [`[${path}] remove mode`, {
                progress: true,
                showNoops: true,
                timeMeasure: true,
                // collectRegex: true,
            }, stimeout/*, 1*/],
        ])(
            "Scan the js related files of `node_modules`",
            (title, opt, timeout, disable = 0) => {
                it(title, async () => {
                    if (disable) return;
                    !opt.isWalk && reset();
                    await tryTask(opt);
                }, timeout);
            }
        );
    });
}
