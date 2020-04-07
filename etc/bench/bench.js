const Benchmark = require("benchmark");

const stripc = require("strip-comments");
const stripj = require("strip-json-comments");
const rmc = require("../../bin");
// const NodeDeque= require("deque").Dequeue;
// const DequeBuiltIn = Array;

/**
 * 
 * @param {number} loop 
 */
function printPlatform(loop) {

    const os = require("os");
    const v8 = process.versions.v8;
    const node = process.versions.node;
    // os.type() + " " + os.release() + " " + os.arch() + "\nNode.JS " + node + "\nV8 " + v8;
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

    console.log(`\n- - - - - - - bench of deque kinds (loop ${loop.toLocaleString()}) - - - - - - - - - `);
    console.log("Platform info:");
    console.log(plat + "\n" + cpus + "\n");
}

const loop = process.argv[2];
// +undefined || 1000 -> 1000
let l = +loop || 10000;

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
printPlatform(l);

const suite = new Benchmark.Suite();
suite
.add("strip-comments", function(){
    const ret = stripc(json, true);
})
.add("strip-json-comments", function(){
    const ret = stripj(json, { whitespace: false });
})
.add("rm-cstyle-comments", function() {
    const ret = rmc(json, true);
})
.on("cycle", function(e) {
    console.log("" + e.target);
}).on("complete", /** @type {(this: Benchmark.Suite, e: Event) => any} */function (e) {
    // console.log(this, arguments);
    console.log("- - done - -");
}).run();

/* [2020/3/3 0:57:20]
strip-comments x 11,583 ops/sec ±0.32% (83 runs sampled)
strip-json-comments x 16,834 ops/sec ±0.10% (94 runs sampled)
rm-cstyle-comments x 67,453 ops/sec ±0.17% (93 runs sampled)  *** faster

[2020/3/3 1:05:14]
strip-comments x 11,393 ops/sec ±0.28% (88 runs sampled)
strip-json-comments x 17,101 ops/sec ±0.11% (93 runs sampled)
rm-cstyle-comments x 68,452 ops/sec ±0.12% (94 runs sampled)  *** faster

[2020/04/08 2:47] v2.3.3
strip-comments x 11,668 ops/sec ±0.30% (87 runs sampled)
strip-json-comments x 17,084 ops/sec ±0.10% (92 runs sampled)
rm-cstyle-comments x 68,715 ops/sec ±0.12% (94 runs sampled)

strip-comments x 11,335 ops/sec ±0.39% (88 runs sampled)
strip-json-comments x 17,146 ops/sec ±0.14% (92 runs sampled)
rm-cstyle-comments x 69,439 ops/sec ±0.11% (95 runs sampled)


>node -i
const stripc = require("strip-comments");
const stripj = require("strip-json-comments");
const rmc = require("../../dist/bin");

const json = `...`;


let ret = stripc(json, true);
ret = stripj(json, { whitespace: false });
ret = rmc(json, true);  *** perfect

*/
// [Arguments] of "complete" event
// const X = {
//     '0': /* Event */ {
//         timeStamp: 1582270005987,
//         currentTarget: /* Suite */ {
//             '0': [Benchmark],
//             '1': [Benchmark],
//             '2': [Benchmark],
//             '3': [Benchmark],
//             name: undefined,
//             options: [Object],
//             length: 4,
//             events: [Object],
//             running: false
//         },
//         type: 'complete',
//         target: /* Benchmark */ {
//             name: 'built-in array',
//             options: [Object],
//             async: false,
//             defer: false,
//             delay: 0.005,
//             initCount: 1,
//             maxTime: 5,
//             minSamples: 5,
//             minTime: 0.05,
//             id: 4,
//             fn: [Function (anonymous)],
//             stats: [Object],
//             times: [Object],
//             running: false,
//             count: 195280,
//             compiled: [Function: anonymous],
//             cycles: 8,
//             hz: 3803234.622222012
//         }
//     }
// };

