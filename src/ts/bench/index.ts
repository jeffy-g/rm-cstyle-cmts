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
// <reference types="rm-cstyle-cmts"/>

if (!String.prototype.repeat) {
    String.prototype.repeat = function(n: number): string {
        let str = "";
        while (n--) {
            // tslint:disable-next-line:no-invalid-this
            str += this;
        }

        return str;
    };
}

import * as fs from "fs";
import * as path from "path";

// NOTE: not necessary in this implementation.
//  -> found a way for this import statement to work on intellisense.
import * as rmc from "../";

// NOTE: reference to module.exports["default"]
// import rmc from "../";

// NOTE: can work this.
// -> return value of require is any
// const rmc: IRemoveCStyleCommentsTypeSig = require("../");

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
function getExtraArgs(): IStringMap<string|boolean> {
    const extra_index = 2;
    const params: IStringMap<string|boolean> = {};
    if (process.argv.length > extra_index) {
        const args = process.argv;
        for (let index = extra_index; index < args.length;) {
            const opt = args[index++];
            if (opt && opt[0] === "-") {
                let value: string|boolean = args[index];
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

// path.parse('/home/user/dir/file.txt');
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
    const parsed_p = path.parse(file_path);
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

function formatNumber(n: number): string {
    return n.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

/**
 * ```
 * options:
 *   -f: read file path -f sample-cfg.json
 * 
 *   -l: inner loop counter value, typeof integer
 *   -ol: outer loop counter value, typeof integer
 * 
 *   -m: multi process test: boolean
 * 
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
 * @param multi_use default is "false".
 * @param output_result default is "true".
 */
function benchmark(rm_ws: boolean, multi_use: boolean = false, output_result: boolean = true): void {
    const tag = `${src.simple_name}, rm_blank_line_n_ws=${rm_ws}, loop=${INNER}`;

    console.log(`version: ${rmc.version}, case: { source: ${src.simple_name}@${
        formatNumber(fs.statSync(src.full_path).size)
    }bytes, remove_blanks=${rm_ws}, multi_use=${multi_use} }, outerloop=${OUTER}, innerloop=${INNER}`);

    let ret: string;
    for (let a = OUTER; a--;) {
        console.time(tag);
        for (let b = INNER; b--;) {
            ret = rmc(source_text, rm_ws, multi_use);
        }
        console.timeEnd(tag);
    }

    if (output_result) {
        const after_path = src.addSuffix(`-rm_ws-${rm_ws}`);
        fs.writeFile(after_path, ret, "utf-8", function() {
            console.log(`${path.basename(after_path)} written...`);
        });
    }
}

/**
 * 
 * @param msg 
 */
function progress(msg?: string): void {
    // tslint:disable-next-line:no-any
    const output: any = process.stderr;
    // clear the current line
    output.clearLine();
    // move the cursor to the start of the line
    output.cursorTo(0);
    // const x = /[\r\n]+/.exec(chunk);
    // chunk = chunk.substring(0, x.index);
    // write the message.
    msg && output.write(msg);
}
// from pipe or log file: when -p option then
// USE:
// node ./bin/bench/ -f sample-cfg.json -l 1500 | node ./bin/bench/ -p
if (settings.p) {

    const emitResult = (): void => {
        console.log(
            `${"\u2193  ".repeat(10)}performance log   ${"\u2193  ".repeat(10)}\n`,
            ContractorPattern.average(inputs, !!0)
        );
        // ContractorPattern.average(inputs, !!0);
    };

    let inputs = "";
    // from pipe.
    if (typeof settings.p === "boolean") {
        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        const rotator = ["|", "/", "-", "\\", "|", "/", "-", "\\"];
        let rotator_index = 0;
        process.stdin.on("data", function (chunk: string) {
            inputs += chunk;
            // console.log(chunk);
            progress(`performance measurement running [${rotator[rotator_index++ % rotator.length]}]`);
        });
        process.stdin.on("end", function () {
            progress();
            emitResult();
        });
        // ✈: \u2708
        console.log("");
        console.log(`${"\u2708  ".repeat(8)}performance log started...`);
    // from log file.
    } else if (typeof settings.p === "string" && fs.existsSync(<string>settings.p)) {
        inputs = fs.readFileSync(<string>settings.p, "utf-8");
        emitResult();
    }

} else {

    // file: when -f optiion then
    src = parseFilePath(
        typeof settings.f === "string"? <string>settings.f: "sample-cfg.json"
    );

    // loop: when -l option then
    if (settings.l) {
        INNER = parseInt(<string>settings.l);
    }
    // loop: when -ol option then
    if (settings.ol) {
        OUTER = parseInt(<string>settings.ol);
    }

    source_text = fs.readFileSync(src.full_path, "utf-8");

    const multi_use = !!settings.m;
    console.dir(settings, { color: true });
    // with remove blank line and whitespaces.
    console.log(" --------------- start benchmark (remove blanks) ---------------");
    benchmark(!0, multi_use);
    console.log(" ------------------------ end benchmark ------------------------");

    // without remove blank line and whitespaces.
    console.log(" --------------- start benchmark (!remove blanks) ---------------");
    benchmark(!!0, multi_use);
    console.log(" ------------------------ end benchmark ------------------------");
    console.log("--done--");
}
