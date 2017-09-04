/*
-----------------------------------------------------------------------

Copyright 2017 motrohi hirotom1107@gmail.com

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
// test development javascript.

///<reference path="../replace.ts"/>

declare global {
    interface String {
        repeat(n: number): string;
    }
}
if (!String.prototype.repeat) {
    String.prototype.repeat = function(n: number): string {
        let str = "";
        while(n--)
            str += this;

        return str;
    }
}


interface ISource {
    /** [only name] */
    name: string;
    /** [only name].extension */
    simple_name: string;
    /** .extension */
    extension: string;
}

import * as fs from "fs";
import * as path from "path";

// NOTE: not necessary in this implementation. 
// import * as rmc from "../";

// NOTE: reference to module.exports["default"]
// although the main function works, other functions do not work...
// import rmc from "../";

// NOTE: can work this.
// -> return value of require is any
const rmc: IRemoveCStyleCommentsTypeSig = require("../");

// import { ContractorPattern } from "./contractor";
import * as ContractorPattern from "./contractor";

/**
 * get arguments helper.  
 * extra params must be start with "-".  
 * ```
 * ex: node <script path> -minify -target es6 -setA -setB -font serif
 * ```
 * if param value not specified -tag after then set value is "true".
 */
function getExtraArgs(): IStringMap<any> {
    const extra_index = 2;
    const params: IStringMap<any> = {};
    if (process.argv.length > extra_index) {
        let args = process.argv;
        for (let index = extra_index; index < args.length;) {
            let opt = args[index++];
            if (opt && opt[0] === "-") {
                let value: any = args[index];
                if (value === void 0 || value[0] === "-") {
                    value = true;
                } else {
                    index++;
                }
                params[opt.substring(1)] = value;
            }
        }
    }
    return params;
}

/*
path.parse('/home/user/dir/file.txt');
// Returns:
// { root: '/',
//   dir: '/home/user/dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' }
*/
/**
 * 
 * @param file_path 
 */
// full_path  : F:\local-links\javascript\node-projects\projects\remove-cstyle-comments\sample-cfg.json
// basename   : sample-cfg.json
// simple_name: sample-cfg
// extension  : .json
function parseFilePath(file_path: string): ISource {
    let parsed_p = path.parse(file_path);
    return {
        name: path.resolve(parsed_p.dir, parsed_p.name),
        simple_name: parsed_p.base,
        extension: parsed_p.ext
    };
}


/**
 * ```
 * options:
 *   -r: remove blank line and whitespaces.(boolean)
 *   -f: read file path -f sample-cfg.json
 * 
 *   -l: inner loop counter value, typeof integer
 *   -p: read performance log from pipe
 * ```
 */
const settings = getExtraArgs();

// sample-cfg.josn 2,208 byte
/** [only name] */
let basename = "sample-cfg";
/** .extension */
let extension = ".json";
/** [only name].extension */
let simple_name = "sample-cfg.json";

let OUTER = 20;
let INNER = 1000;

/** share source content */
let source_text;

/**
 * performance measurement.
 * @param rm_ws remove blank line and whitespaces.
 * @param output_result 
 */
function benchmark(rm_ws: boolean, output_result: boolean = false): void {
    const tag = `${simple_name}, rm_blank_line_n_ws=${rm_ws}, loop=${INNER}`;
    const stat = fs.statSync(`${basename}${extension}`);
    let ret;
    console.log(`version: ${rmc.version}, case ${simple_name}, size: ${stat.size} bytes, keep more blank line: ${rmc.isKeep}`);
    for (let a = OUTER; a--;) {
        console.time(tag);
        for (let b = INNER; b--;) {
            ret = rmc(source_text, rm_ws, false);
        }
        console.timeEnd(tag);
    }
    output_result && fs.writeFile(`${basename}-after${extension}`, ret, 'utf-8', function() {
        console.log(`${path.basename(`${basename}${extension}`, extension)}-after${extension} written...`);
    });
}

// from pipe: when -p option then
// USE:
// node test/tdev -r -f sample-cfg.json | node test/tdev -p
// node test/tdev -r -f rr.js -l 300 | node test/tdev -p
if (settings.p) {

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let inputs = "";
    process.stdin.on('data', function (chunk: string) {
        inputs += chunk;
    });
    process.stdin.on('end', function () {
        console.log(
            `\n${"\u2193  ".repeat(10)}performance log   ${"\u2193  ".repeat(10)}\n`,
            ContractorPattern.average(inputs, !!0)
        );
    });
    // ✈: \u2708
    console.log("");
    console.log(`${"\u2708  ".repeat(8)}performance log started...`);

} else {

    // file: when -f optiion then
    if (settings.f) {
        let c = parseFilePath(settings.f);
        basename = c.name;
        simple_name = c.simple_name;
        extension = c.extension;
    }
    // loop: when -l option then
    if (settings.l) {
        INNER = parseInt(settings.l);
    }
    
    /** remove blank line and more? */
    let rmove_blank_n_ws = !!settings.r
    source_text = fs.readFileSync(`${basename}${extension}`, 'utf-8');

    // console.log(process.argv);
    console.dir(settings, { color: true });
    console.log(" --------------- start benchmark ---------------");
    benchmark(rmove_blank_n_ws, !0);
    console.log(" ---------------- end benchmark ----------------");
 
    // version 1.2.3
    rmc.keepMoreBlankLine(true);
    console.log(" --------------- start benchmark ---------------");
    benchmark(rmove_blank_n_ws);
    console.log(" ---------------- end benchmark ----------------");
    console.log("--done--");
}
