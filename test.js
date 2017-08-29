
const rmc = require("./");
const fs = require("fs");

const tsc = fs.readFileSync("./tsconfig.json", 'utf-8');
console.info(" ----------- before contents ----------");
console.log(tsc);
console.info(" ----------- after contents -----------");
console.log(rmc(tsc));
