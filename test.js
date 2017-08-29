
const rmc = require("./");
const fs = require("fs");

const json = fs.readFileSync("./sample-tsconfig.json", 'utf-8');
console.info(" ----------- before contents ----------");
console.log(json);
console.info(" ----------- after contents -----------");
console.log(rmc(json));
