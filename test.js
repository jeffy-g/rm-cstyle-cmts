
const rmc = require("./");
const fs = require("fs");

const name = "sample-cfg";
const json = fs.readFileSync(`./${name}.json`, 'utf-8');
// const json = fs.readFileSync("./src/ts/g.ts", 'utf-8');

console.info(" ----------- before contents ----------");
console.log(json);

// remove blank line and whitespaces.
let after = rmc(json, !0);
console.info(" ----------- after contents -----------");
console.log(after);

fs.writeFile(`./${name}-after.json`, after, 'utf-8', function() {
    console.log("written data...");
});

