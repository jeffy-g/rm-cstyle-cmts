/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2017 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

import * as rmc from "../";
import * as ContractorPattern from "./contractor";
import * as tinArgs from "tin-args";


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
type TBenchParams = {
    f: string;
    l: string;
    ol: string;
    p: boolean;
    empty: boolean;
};


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
// @ts-ignore convert to cjs, no problem
const settings = tinArgs<TBenchParams>();

let OUTER = 20;
let INNER = 1000;

// test source
let src: ISourcePath;

/** share source content */
let source: string;

// let emit_result = 0;
/**
 * performance measurement.
 * @param preserveBlanks keep blank line and whitespaces.
 * @param outputResult default is "true".
 */
function benchmark(preserveBlanks?: true, outputResult: boolean = true): void {
    const tag = `${src.simple_name}, preserveBlanks=${preserveBlanks}, loop=${INNER}`;

    console.log(`version: ${rmc.version}, case: { source: ${src.simple_name}@${
        formatNumber(fs.statSync(src.full_path).size)
    } bytes, preserveBlanks=${preserveBlanks} }, outerloop=${OUTER}, innerloop=${INNER}`);

    const opt: TRemoveCStyleCommentsOpt = {
        preserveBlanks: preserveBlanks,
        // isWalk: false
    };
    let ret: string = "";
    for (let a = OUTER; a--;) {
        console.time(tag);
        for (let b = INNER; b--;) {
            // @ts-ignore convert to cjs, no problem
            ret = rmc(source, opt);
        }
        console.timeEnd(tag);
    }

    if (outputResult) {
        const after_path = src.addSuffix(`-rm_ws-${preserveBlanks === void 0 || false}`);
        fs.writeFile(after_path, ret, "utf-8", function() {
            console.log(`${path.basename(after_path)} written...`);
        });
    }
}
function benchmark0(preserveBlanks?: true): void {
    const tag = `empty loop test, loop=${INNER}`;
    console.log(`version: N/A, case: { preserveBlanks=${preserveBlanks} }, outerloop=${OUTER}, innerloop=${INNER}`);
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
 * @param {string} [msg] 
 */
function progress(msg?: string): void {
    const output = process.stderr;
    // move cursor to line head
    readline.cursorTo(output, 0);
    // write the message.
    msg && output.write(msg);
    // clear line to the right from cursor
    readline.clearLine(output, 1);
}

// from pipe or log file: when -p option then
// USE:
// node ./build/cjs/bench/ -f ./samples/sample-cfg.json -l 1500 | node ./build/cjs/bench/ -p
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
        const stdin = process.stdin;
        stdin.resume().setEncoding("utf8");
        inputs = "";

        const onDataHandler = process.env.CI? (chunk: string): any => {
            chunk.length && (inputs += chunk);
            chunk[0] !== " " && process.stderr.write(".");
        }: (() => {
            const rotator = ["|", "/", "-", "\\", "|", "/", "-", "\\"];
            let rotatorIndex = 0;
            return (chunk: string): any => {
                chunk.length && (inputs += chunk);
                chunk[0] !== " " && progress(`performance measurement running [${rotator[rotatorIndex++ % rotator.length]}]`);
            };
        })();

        stdin.on("data", onDataHandler).on("end", function () {
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

    let method: (a?: true) => void;
    // node ./build/cjs/bench/ -empty -l 200000 -ol 10 | node ./build/cjs/bench/ -p
    if (settings.empty) {
        method = benchmark0;
    } else {
        method = benchmark;
        // file: when -f optiion then
        src = parseFilePath(
            typeof settings.f === "string"? <string>settings.f: "./samples/sample-cfg.json"
        );
        source = fs.readFileSync(src.full_path, "utf-8");
    }

    // loop: when -l option then
    if (settings.l) {
        INNER = +settings.l;
    }
    // loop: when -ol option then
    if (settings.ol) {
        OUTER = +settings.ol;
    }

    console.dir(settings, { color: true });
    // with remove blank line and whitespaces.
    console.log(" --------------- start benchmark (!preserveBlanks) ---------------");
    method();
    console.log(" ------------------------ end benchmark ------------------------");

    // without remove blank line and whitespaces.
    console.log(" --------------- start benchmark (preserveBlanks) ---------------");
    method(!0);
    console.log(" ------------------------ end benchmark ------------------------");
    console.log("--done--");
}
