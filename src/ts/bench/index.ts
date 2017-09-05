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

/**
 * source path context.
 */
declare interface ISourcePath {
    /**  */
    full_path: string;
    /** [only name] */
    basename: string;
    /** [only name].extension */
    simple_name: string;
    /** .extension */
    ext: string;
    /** [only name][suffix].extension */
    addSuffix(suffix: string): string;
}

//path.parse('/home/user/dir/file.txt');
// Returns:
// { root: '/',
//   dir: '/home/user/dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' }

/**
 * ```
 * {
 * full_path  : F:\projects\remove-cstyle-comments\sample-cfg.json
 * basename   : sample-cfg.json
 * simple_name: sample-cfg
 * ext        : .json
 * addSuffix  : function addSuffix
 * }
 * ```
 * @param file_path 
 */
function parseFilePath(file_path: string): ISourcePath {
    let parsed_p = path.parse(file_path);
    return {
        full_path: path.resolve(parsed_p.dir, parsed_p.base),
        basename: path.resolve(parsed_p.dir, parsed_p.name),
        simple_name: parsed_p.base,
        ext: parsed_p.ext,
        addSuffix: function (suffix: string) {
            return path.resolve(parsed_p.dir, parsed_p.name + suffix + parsed_p.ext);
        }
    };
}


/**
 * ```
 * options:
 *   -f: read file path -f sample-cfg.json
 * 
 *   -l: inner loop counter value, typeof integer
 *   -p: read performance log from pipe
 * ```
 */
const settings = getExtraArgs();

let OUTER = 20;
let INNER = 1000;

// test source
let src: ISourcePath;

/** share source content */
let source_text;

// let emit_result = 0;
/**
 * performance measurement.
 * @param rm_ws remove blank line and whitespaces.
 * @param output_result 
 */
function benchmark(rm_ws: boolean, output_result: boolean = true): void {
    const tag = `${src.simple_name}, rm_blank_line_n_ws=${rm_ws}, loop=${INNER}`;
    const stat = fs.statSync(src.full_path);

    let ret;
    console.log(`version: ${rmc.version}, {case ${src.simple_name}, size: ${stat.size} bytes}, remove_blanks=${rm_ws}`);
    for (let a = OUTER; a--;) {
        console.time(tag);
        for (let b = INNER; b--;) {
            ret = rmc(source_text, rm_ws, false);
        }
        console.timeEnd(tag);
    }

    if (output_result) {
        let after_path = src.addSuffix("-rm_ws-" + rm_ws);
        fs.writeFile(after_path, ret, 'utf-8', function() {
            console.log(`${path.basename(after_path)} written...`);
        });
    }
}

// from pipe or log file: when -p option then
// USE:
// node ./bin/bench/ -f sample-cfg.json -l 1500 | node ./bin/bench/ -p
if (settings.p) {

    const emitResult = (): void => {
        console.log(
            `\n${"\u2193  ".repeat(10)}performance log   ${"\u2193  ".repeat(10)}\n`,
            ContractorPattern.average(inputs, !!0)
        );
    }
    let inputs = "";

    // from pipe.
    if (typeof settings.p === "boolean") {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', function (chunk: string) {
            inputs += chunk;
        });
        process.stdin.on('end', function () {
            emitResult();
        });
        // ✈: \u2708
        console.log("");
        console.log(`${"\u2708  ".repeat(8)}performance log started...`);
    // from log file.
    } else if (typeof settings.p === "string" && fs.existsSync(settings.p)) {
        inputs = fs.readFileSync(settings.p, 'utf-8');
        emitResult();
    }

} else {

    // file: when -f optiion then
    src = parseFilePath(
        typeof settings.f === "string"? settings.f: "sample-cfg.json"
    );

    // loop: when -l option then
    if (settings.l) {
        INNER = parseInt(settings.l);
    }

    source_text = fs.readFileSync(src.full_path, 'utf-8');

    // @deprecated since v1.3.8
    // rmc.keepMoreBlankLine(true);
    console.dir(settings, { color: true });
    console.log(" --------------- start benchmark (!remove blanks) ---------------");
    benchmark(false);
    console.log(" ------------------------ end benchmark ------------------------");
 
    // @deprecated since v1.3.8
    // rmc.keepMoreBlankLine(false);
    console.log(" --------------- start benchmark (remove blanks) ---------------");
    benchmark(true);
    console.log(" ------------------------ end benchmark ------------------------");
    console.log("--done--");
}

