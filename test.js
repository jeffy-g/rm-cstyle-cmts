
var rmc = require("./");
var fs = require("fs");

var name = "sample-cfg";
var extension = "json";
var json = fs.readFileSync(`./${name}.${extension}`, 'utf-8');
// const json = fs.readFileSync("./src/ts/g.ts", 'utf-8');

console.info(" ----------- before contents ----------");
console.log(json);

// remove blank line and whitespaces.
var after = rmc(json, !0);
console.info(" ----------- after contents -----------");
console.log(after);

fs.writeFile(`./${name}-after.${extension}`, after, 'utf-8', function() {
    console.log("written data...");
});

