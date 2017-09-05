"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (!String.prototype.repeat) {
    String.prototype.repeat = function (n) {
        var str = "";
        while (n--)
            str += this;
        return str;
    };
}
var fs = require("fs");
var path = require("path");
var rmc = require("rm-cstyle-cmts");
var ContractorPattern = require("./contractor");
function getExtraArgs() {
    var extra_index = 2;
    var params = {};
    if (process.argv.length > extra_index) {
        var args = process.argv;
        for (var index = extra_index; index < args.length;) {
            var opt = args[index++];
            if (opt && opt[0] === "-") {
                var value = args[index];
                if (value === void 0 || value[0] === "-") {
                    value = true;
                }
                else {
                    index++;
                }
                params[opt.substring(1)] = value;
            }
        }
    }
    return params;
}
function parseFilePath(file_path) {
    var parsed_p = path.parse(file_path);
    return {
        full_path: path.resolve(parsed_p.dir, parsed_p.base),
        basename: path.resolve(parsed_p.dir, parsed_p.name),
        simple_name: parsed_p.base,
        ext: parsed_p.ext,
        addSuffix: function (suffix) {
            return path.resolve(parsed_p.dir, parsed_p.name + suffix + parsed_p.ext);
        }
    };
}
var settings = getExtraArgs();
var OUTER = 20;
var INNER = 1000;
var src = parseFilePath("sample-cfg.json");
var source_text;
function benchmark(rm_ws, output_result) {
    if (output_result === void 0) { output_result = false; }
    var tag = src.simple_name + ", rm_blank_line_n_ws=" + rm_ws + ", loop=" + INNER;
    var stat = fs.statSync(src.full_path);
    var ret;
    console.log("version: " + rmc.version + ", {case " + src.simple_name + ", size: " + stat.size + " bytes}, keep more blank line: " + rmc.isKeep);
    for (var a = OUTER; a--;) {
        console.time(tag);
        for (var b = INNER; b--;) {
            ret = rmc(source_text, rm_ws, false);
        }
        console.timeEnd(tag);
    }
    var after_path = src.addSuffix("-after");
    output_result && fs.writeFile(after_path, ret, 'utf-8', function () {
        console.log(path.basename(after_path, src.ext) + " written...");
    });
}
if (settings.p) {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    var inputs_1 = "";
    process.stdin.on('data', function (chunk) {
        inputs_1 += chunk;
    });
    process.stdin.on('end', function () {
        console.log("\n" + "\u2193  ".repeat(10) + "performance log   " + "\u2193  ".repeat(10) + "\n", ContractorPattern.average(inputs_1, !!0));
    });
    console.log("");
    console.log("\u2708  ".repeat(8) + "performance log started...");
}
else {
    if (settings.f) {
        src = parseFilePath(settings.f);
    }
    if (settings.l) {
        INNER = parseInt(settings.l);
    }
    var rmove_blank_n_ws = !!settings.r;
    source_text = fs.readFileSync(src.full_path, 'utf-8');
    console.dir(settings, { color: true });
    console.log(" --------------- start benchmark ---------------");
    benchmark(rmove_blank_n_ws, !0);
    console.log(" ---------------- end benchmark ----------------");
    rmc.keepMoreBlankLine(true);
    console.log(" --------------- start benchmark ---------------");
    benchmark(rmove_blank_n_ws);
    console.log(" ---------------- end benchmark ----------------");
    console.log("--done--");
}
