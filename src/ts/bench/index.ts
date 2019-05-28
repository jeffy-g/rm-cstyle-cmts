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
if (!String.prototype.repeat) {
    String.prototype.repeat = function(n: number): string {
        let str = "";
        while (n--) {
            str += this;
        }
        return str;
    };
}

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
// import readline = require('readline'); also works

// NOTE: not necessary in this implementation.
//  -> found a way for this import statement to work on intellisense.
import * as rmc from "../";

// NOTE: reference to module.exports["default"]
// import rmc from "../";

// NOTE: can work this.
// -> return value of require is any
// const rmc: IRemoveCStyleCommentsTypeSig = require("../");

import * as ContractorPattern from "./contractor";

/** getExtraArgs default config.  */
const ArgsConfig = {
    startIndex: 2,
    prefix: "-",
    varIndex: 1
};
/**
 * get arguments helper.  
 * extra params must be start with "-".  
 * ```
 * ex: node <script path> -minify -target es6 -setA -setB -font serif
 * ```
 * if param value not specified -tag after then set value is "true".
 */
function getExtraArgs(args_config?: typeof ArgsConfig): StringMap<string|boolean> {
    args_config === void 0 && (args_config = ArgsConfig);
    const extra_index = args_config.startIndex;
    const params: StringMap<string|boolean> = {};
    if (process.argv.length > extra_index) {
        const args = process.argv;
        for (let index = extra_index; index < args.length;) {
            const opt = args[index++];
            if (opt && opt[0] === args_config.prefix) {
                let value: string|boolean = args[index];
                if (value === void 0 || value[0] === args_config.prefix) {
                    value = true;
                } else {
                    index++;
                }
                params[opt.substring(args_config.varIndex)] = value;
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
    return n.toLocaleString();
    // return n.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

/**
 * ```
 * options:
 *   -f: read file path -f sample-cfg.json
 * 
 *   -l: inner loop counter value, typeof integer
 *   -ol: outer loop counter value, typeof integer
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
let source_text: string;

// let emit_result = 0;
/**
 * performance measurement.
 * @param rm_ws remove blank line and whitespaces.
 * @param output_result default is "true".
 */
function benchmark(rm_ws: boolean, output_result: boolean = true): void {
    const tag = `${src.simple_name}, rm_blank_line_n_ws=${rm_ws}, loop=${INNER}`;

    console.log(`version: ${rmc.version}, case: { source: ${src.simple_name}@${
        formatNumber(fs.statSync(src.full_path).size)
    } bytes, remove_blanks=${rm_ws} }, outerloop=${OUTER}, innerloop=${INNER}`);

    let ret: string = "";
    for (let a = OUTER; a--;) {
        console.time(tag);
        for (let b = INNER; b--;) {
            ret = rmc(source_text, rm_ws);
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
function benchmark0(b?: boolean): void {
    b = !!b;
    const tag = `empty loop test, loop=${INNER}`;
    console.log(`version: N/A, case: { empty loop tag=${b} }, outerloop=${OUTER}, innerloop=${INNER}`);
    let ret: string;
    for (let a = OUTER; a--;) {
        console.time(tag);
        for (let b = INNER; b--;) {
            ret = "";
        }
        console.timeEnd(tag);
    }
}

/**
 * 
 * @param msg 
 */
function progress(msg?: string): void {
    const output = process.stderr;
    // clear the current line
    readline.clearLine(output, 0);
    readline.cursorTo(output, 0/* , void 0 */);
    // const x = /[\r\n]+/.exec(chunk);
    // chunk = chunk.substring(0, x.index);
    // write the message.
    msg && output.write(msg);
}
// old version (wrong reference?
// function progress(msg?: string): void {
//     const output: any = process.stderr;
//     // clear the current line
//     output.clearLine();
//     // move the cursor to the start of the line
//     output.cursorTo(0);
//     // const x = /[\r\n]+/.exec(chunk);
//     // chunk = chunk.substring(0, x.index);
//     // write the message.
//     msg && output.write(msg);
// }

// from pipe or log file: when -p option then
// USE:
// node ./bin/bench/ -f sample-cfg.json -l 1500 | node ./bin/bench/ -p
if (settings.p) {

    let inputs: string;
    // process.env.CI = 1;
    const emitResult = (): void => {
        console.log(
            `${"\u2193  ".repeat(10)}performance log   ${"\u2193  ".repeat(10)}\n`,
            ContractorPattern.average(inputs, !!0)
        );
    };

    // from pipe.
    if (settings.p === true) {
        process.stdin.resume();
        process.stdin.setEncoding("utf8");
        inputs = "";

        const on_data_handler = process.env.CI? (chunk: string): any => {
            chunk.length && (inputs += chunk);
            chunk[0] !== " " && process.stderr.write(".");
        }: (() => {
            const rotator = ["|", "/", "-", "\\", "|", "/", "-", "\\"];
            let rotator_index = 0;
            return (chunk: string): any => {
                chunk.length && (inputs += chunk);
                chunk[0] !== " " && progress(`performance measurement running [${rotator[rotator_index++ % rotator.length]}]`);
            }
        })();

        process.stdin.on("data", on_data_handler);
        process.stdin.on("end", function () {
            !process.env.CI && (progress(), 1) || console.log();
            emitResult();
        });
        // ✈: \u2708
        console.log();
        console.log(`${"✈  ".repeat(8)}performance log started...`);

    } else if (typeof settings.p === "string" && fs.existsSync(<string>settings.p)) { // from log file.
        inputs = fs.readFileSync(<string>settings.p, "utf-8");
        emitResult();
    }

} else {

    let method: (a: boolean) => void;
    // node ./bin/bench/ -empty -l 200000 -ol 10 | node ./bin/bench/ -p
    if (settings.empty) {
        method = benchmark0
    } else {
        method = benchmark
        // file: when -f optiion then
        src = parseFilePath(
            typeof settings.f === "string"? <string>settings.f: "./samples/sample-cfg.json"
        );
        source_text = fs.readFileSync(src.full_path, "utf-8");
    }

    // loop: when -l option then
    if (settings.l) {
        INNER = parseInt(<string>settings.l);
    }
    // loop: when -ol option then
    if (settings.ol) {
        OUTER = parseInt(<string>settings.ol);
    }

    // @ts-ignore 
    // rmc.avoidMinified = settings.am;
    // const multi_use = !!settings.m;
    console.dir(settings, { color: true });
    console.log("avoidMinified:", rmc.avoidMinified);
    // with remove blank line and whitespaces.
    console.log(" --------------- start benchmark (remove blanks) ---------------");
    method(!0);
    console.log(" ------------------------ end benchmark ------------------------");

    // without remove blank line and whitespaces.
    console.log(" --------------- start benchmark (!remove blanks) ---------------");
    method(!!0);
    console.log(" ------------------------ end benchmark ------------------------");
    console.log("--done--");
}
