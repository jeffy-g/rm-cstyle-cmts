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
// gist: https://gist.github.com/jeffy-g/d718412d7b7419ef78aca05a7b222538

/* utilities module by own. */
const utils = require("./utils");

const params = utils.getExtraArgs({ startIndex: 2 });
console.log(params);

const ToolFunctions = {
    // node ./scripts/version-tool -cmd version
    version: () => {
        const targets = [
            "src/ts/index.ts"
        ];

        let { major, minor/*, patch*/ } = params;
        /** @type {string} */
        let nextVersion;
        utils.fireReplace(/"version": "(\d+)\.(\d+)\.(\d+)"/, ($0, $1, $2, $3) => {
            let _major = $1;
            let _minor = $2;
            let _patch = $3;
            if (major) {
                _minor = 0;
                _major = parseInt(_major) + 1;
            }
            else if (minor) {
                _minor = parseInt(_minor) + 1;
            }
            if (major || minor) {
                _patch = 0;
            } else {
                _patch = parseInt(_patch) + 1;
            }
            nextVersion = `${_major}.${_minor}.${_patch}`;
            return `"version": "${nextVersion}"`;
        }, ["./package.json"]);

        utils.fireReplace(/v(\d+\.\d+\.\d+)/, ($0, $1) => {
            if ($1) {
                return "v" + nextVersion;
            }
            return $0;
        }, targets);

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