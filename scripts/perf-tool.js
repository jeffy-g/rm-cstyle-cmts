/*!
-----------------------------------------------------------------------

  Copyright 2020 jeffy-g hirotom1107@gmail.com

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
/**
 * @file Script comparing performance between two versions from `npm run bench` output logs
 * @author jeffy-g <hirotom1107@gmail.com>
 * @version 1.0
 */
/**
 * @typedef PerfMap
 * @prop {number} true
 * @prop {number} false
 */

/**
 * @param {string} a 
 * @param {string} b 
 */
function generatePerformanceMap(a, b) {

    const regex = /(?:\[version: (?<version>v\d+.\d+.\d+))|(?:remove_blanks=(?<removeBlank>true|false))|(?:average of entries: (?<average>\d+(\.\d+)?))/g;
    /**
     * @type {Record<string, PerfMap>}
     */
    const map = {};
    /** @type {PerfMap} */
    let currentMap;
    /** @type {string} */
    let flag; // "true" or "false"
    /** @type {RegExpExecArray} */
    let m;
    let i = 2;

    do {
        let subject = i === 2? a: b;
        while (m = regex.exec(subject)) {
            // console.log(m);
            const groups = m.groups;
            if (groups.version && !map[groups.version]) {
                // @ts-ignore
                map[groups.version] = currentMap = {};
            } else if (groups.removeBlank && !(groups.removeBlank in currentMap)) {
                flag = groups.removeBlank;
                currentMap[flag] = 0;
            } else if (groups.average) {
                currentMap[flag] = +groups.average;
            }
        }
    } while (--i);

    return map;
}

/**
 * @param {string} a 
 * @param {string} b 
 */
function performanceComparison(a, b) {
    const map = generatePerformanceMap(a, b);
    const keys = Object.keys(map);

    /** @type {string} */
    let prevVersionKey;
    /** @type {string} */
    let nextVersionKey;
    if (keys[0].localeCompare(keys[1]) === -1) {
        prevVersionKey = keys[0];
        nextVersionKey = keys[1];
    } else {
        prevVersionKey = keys[1];
        nextVersionKey = keys[0];
    }

    const result = {
        rmBlanks: map[nextVersionKey]["true"] / map[prevVersionKey]["true"],
        withOutRmBlanks: map[nextVersionKey]["false"] / map[prevVersionKey]["false"],
    };

    return {
        map,
        result,
        improvementRate: {
            rmBlanks: (1 - result.rmBlanks) * 100 + "%",
            withOutRmBlanks: (1 - result.withOutRmBlanks) * 100 + "%",
        }
    };
}
/*
[comparison of v2.2.7 and v2.3.0] 2020/1/10

performanceComparison(`[version: v2.2.6, case: { source: es6.js@4,557 bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 159.142300 ms, total average for each run: 0.079571 ms
}
[version: v2.2.6, case: { source: es6.js@4,557 bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 75.914700 ms, total average for each run: 0.037957 ms
}`, `[version: v2.3.0, case: { source: es6.js@4,557 bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 147.149600 ms, total average for each run: 0.073575 ms
}
[version: v2.3.0, case: { source: es6.js@4,557 bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 67.681400 ms, total average for each run: 0.033841 ms
}`);

{
  "map": {
    "v2.2.6": {
      "true": 159.1423,
      "false": 75.9147
    },
    "v2.3.0": {
      "true": 147.1496,
      "false": 67.6814
    }
  },
  "result": {
    "rmBlanks": 0.9246416571835394,
    "withOutRmBlanks": 0.8915453792216791
  },
  "improvementRate": {
    "rmBlanks": "7.535834281646059%",
    "withOutRmBlanks": "10.84546207783209%"
  }
}
*/
