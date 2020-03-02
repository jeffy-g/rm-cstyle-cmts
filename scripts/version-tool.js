/*!
-----------------------------------------------------------------------

Copyright 2019 jeffy-g hirotom1107@gmail.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

------------------------------------------------------------------------
*/
/* utilities module by own. */
const utils = require("./utils");

const params = utils.getExtraArgs({ startIndex: 2 });

/**
 * @typedef {(matchs: string, ...args: any[]) => string} TStringReplacer
 */
const ToolFunctions = {
    // // node ./scripts/version-tool -cmd version -extras "['src/ts/index.ts']"
    version: () => {
        let { major, minor/*, patch*/ } = params;
        /** @type {string} */
        let nextVersion;
        utils.fireReplace(/"version": "(\d+)\.(\d+)\.(\d+)(-\w+)?"/, /** @type {TStringReplacer} */($0, $1, $2, $3, tag) => {
            /** @type {string | number} */
            let _major = $1;
            /** @type {string | number} */
            let _minor = $2;
            /** @type {string | number} */
            let _patch = $3;
            if (major) {
                _minor = 0;
                _major = +_major + 1;
            }
            else if (minor) {
                _minor = +_minor + 1;
            }
            if (major || minor) {
                _patch = 0;
            } else {
                _patch = +_patch + 1;
            }
            nextVersion = `${_major}.${_minor}.${_patch}${tag? tag: ""}`;
            return `"version": "${nextVersion}"`;
        }, ["./package.json"]);
        utils.fireReplace(/v(\d+\.\d+\.\d+)(-\w+)?/g, /** @type {TStringReplacer} */($0, $1, $2) => {
            if ($1) {
                return "v" + nextVersion; // + ($2? $2: "");
            }
            return $0;
        }, params.extras || ["src/ts/index.ts"]);
        console.log("version updated: %s", nextVersion);
    },
}

if (params.cmd) {
    const fn = ToolFunctions[params.cmd];
    if (typeof fn === "function") {
        fn();
    } else {
        const commands = Object.keys(ToolFunctions);
        console.log("- - - - available commands:");
        for (const cmd of commands) {
            console.log(cmd);
        }
    }
}
