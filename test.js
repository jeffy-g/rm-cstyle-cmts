
var rmc = require("./");
var fs = require("fs");

var name = "sample-cfg";
var extension = "json";

var json = fs.readFileSync(`./${name}.${extension}`, 'utf-8');
// const json = fs.readFileSync("./src/ts/g.ts", 'utf-8');

/**
 * simple test.
 */
function simple_test() {
    console.info(" ----------- before contents ----------");
    console.log(json);
    
    // remove blank line and whitespaces.
    var after = rmc(json, !0);
    console.info(" ----------- after contents -----------");
    console.log(after);
    
    // fs.writeFile(`./${name}-after.${extension}`, after, 'utf-8', function() {
    //     console.log("written data...");
    // });
    fs.writeFileSync(`./${name}-after.${extension}`, after, {
        encoding: 'utf-8'
    });
}

var OUTER = 20;
var INNER = 1000;
/**
 * performance measurement.
 */
function benchmark(rm_ws) {
    var tag = `${name}.${extension}, rm_blank_line_n_ws=${rm_ws}, loop=${INNER}`;
    var ret;
    for (var a = OUTER; a--;) {
        console.time(tag);
        for (var b = INNER; b--;) {
            ret = rmc(json, rm_ws);
        }
        console.timeEnd(tag);
    }
    fs.writeFile(`./${name}-after.${extension}`, ret, 'utf-8', function() {
        console.log("written data...");
    });
}

console.log(" --------------- start benchmark ---------------");
benchmark(true);
console.log(" ---------------- end benchmark ----------------");


