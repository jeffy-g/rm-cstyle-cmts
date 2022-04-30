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
import * as assert from "assert";
import * as gulp from "gulp";
// @ts-ignore
import * as rimraf from "rimraf";
import * as utils from "../scripts/tiny/utils";
import * as grmc from "../src/gulp/";
import {
    task, TGrmcTaskArgs
    // @ts-ignore
} from "../scripts/grmc-test-task";
/**
 * @typedef {import("../scripts/grmc-test-task").TGrmcTaskArgs} TGrmcTaskArgs
 */


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** @type {TGrmcTaskArgs & GulpRmc.TOptions} */
const taskArgs: TGrmcTaskArgs & GulpRmc.TOptions = {
    progress: true,
    showNoops: true,
    timeMeasure: true,
    collectRegex: true,
};

beforeAll(() => {
    process.env.CI = "true";
});

describe("rm-sctyle-cmts gulp plugin test", () => {
    it("will be scan the js related files of `node_modules` without error", () => {
        assert.doesNotThrow(() => {
            task(gulp, rimraf, utils, grmc, taskArgs);
        });
    });
});
