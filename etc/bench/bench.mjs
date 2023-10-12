/// <reference path="../../src/index.d.ts"/>

//
//   esm imports
//
import Benchmark from "benchmark";
import os from "os";

import stripc from "strip-comments";
import stripj from "strip-json-comments";
import rmc from "../../dist/cjs/index.js";           // import cjs (as .js)
import rmcPacked from "../../dist/webpack/index.js"; // import cjs?
import Rmc from "../../dist/umd/index.js";


/**
 * @typedef { InstanceType<typeof import("benchmark")> & { name: string; } } TBenchmark
 */
/**
 * show running node platform info
 */
function printPlatform() {

    const v8 = process.versions.v8;
    const node = process.versions.node;
    const plat = `${os.type()} ${os.release()} ${os.arch()}
Node.JS: ${node}
V8     : ${v8}`;
    let cpus = os.cpus().map(function(cpu){
        return cpu.model;
    }).reduce(function(o, model){
        if( !o[model] ) o[model] = 0;
        o[model]++;
        return o;
    }, {});
    cpus = Object.keys(cpus).map(function( key ) {
        // \u00d7: × "x": 0x78
        return key + " x " + cpus[key];
    }).join("\n");

    console.log(`\n- - - - - - - bench mark test - - - - - - - - - `);
    console.log("Platform info:");
    console.log(plat + "\n" + cpus + "\n");
}

const json = `// see: http://json.schemastore.org/tsconfig
{
  "compilerOptions": {
    /* Basic Options */
    "target": "es5",                          /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019' or 'ESNEXT'. */
    "module": "commonjs",                     /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */
    // "allowJs": true,                       /* Allow javascript files to be compiled. */
    // "checkJs": true,                       /* Report errors in .js files. */
    // "declaration": true,                   /* Generates corresponding '.d.ts' file. */
    // "sourceMap": true,                     /* Generates corresponding '.map' file. */
    // "outFile": "./",                       /* Concatenate and emit output to single file. */
    // "outDir": "./",                        /* Redirect output structure to the directory. */
 
    /* Strict Type-Checking Options */
    "strict": true,                           /* Enable all strict type-checking options. */
    // "strictNullChecks": true,              /* Enable strict null checks. */
    // "strictFunctionTypes": true,           /* Enable strict checking of function types. */
 
    /* Additional Checks */
    // "noUnusedLocals": true,                /* Report errors on unused locals. */
    // "noUnusedParameters": true,            /* Report errors on unused parameters. */
 
    /* Module Resolution Options */
    // "baseUrl": "./",                       /* Base directory to resolve non-absolute module names. */
    // "typeRoots": [],                       /* List of folders to include type definitions from. */
    "esModuleInterop": true                   /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */
 
    /* Experimental Options */
    // "experimentalDecorators": true,        /* Enables experimental support for ES7 decorators. */
    // "emitDecoratorMetadata": true,         /* Enables experimental support for emitting type metadata for decorators. */
  },
  "files": [
    "y"
  ]
}`;
//
// start bench script
//
printPlatform();

/** @type {Record<string, string>} */
const results = {};
const suite = new Benchmark.Suite();
const stripjOpt = { whitespace: false };
/** @type {TRemoveCStyleCommentsOpt} */
const rmcOpt = { preserveBlanks: true };

suite.add("strip-comments", function(){
    return stripc(json);
})
.add("strip-json-comments", function(){
    return stripj(json, stripjOpt);
})
.add("rm-cstyle-cmts", function() {
    return rmc(json, rmcOpt);
})
.add("rm-cstyle-cmts (webpack)", function() {
    return rmcPacked(json, rmcOpt);
})
.add("rm-cstyle-cmts (umd)", function() {
    return Rmc(json, rmcOpt);
})
.on("cycle", function(e) {
    /** @type {TBenchmark} */
    const bench = e.target;
    console.log("" + bench);
    if (typeof bench.fn === "function") {
        results[bench.name] = bench.fn();
    }
}).on("complete", /** @type {(this: Benchmark.Suite, e: Event) => any} */function (e) {
    console.log("- - done - -");
    const modNames = Object.keys(results);
    let equals = 1;
    // DEVNOTE: 2022/04/06 - remove "strip-comments" result because its has buggy
    modNames.shift();
    const base = results[modNames[0]];
    modNames.forEach(key => {
        // DEVNOTE: convert whitespaces - " " to "·"(183), "\n" to "¶"(182) + "\n"
        // console.log(`"${key}":${results[key].replace(/\x20/g, "·").replace(/\n/g, "¶\n")}`);
        equals &= +(base === results[key]);
    });

    console.log(`all results are equals? ${!!equals}`);

}).run();
