# remove cstyle comments
remove c style comments from text file(javascript source, json file etc...

## npm package name: rm-cstyle-cmts

### function signature
```ts
/**
 * #### remove c style comments form "source" content.  
 * 
 * step 1:  
 *  - remove line comments, multi line comments.  
 *  - and search the regexp literal. if found then concat it to results.  
 * 
 * step 2:  
 *  - remove whitespaces.(if need, see @param rm_blank_line_n_ws
 * 
 * @param {string} source c style commented text source.
 * @param {boolean} rm_blank_line_n_ws remove black line and whitespaces, default is "true".
 */
declare function removeCStyleComments(source: string, rm_blank_line_n_ws: boolean = true): string;
```

## usage

```js
var rmc = require("rm-cstyle-cmts");
var fs = require("fs");

var name = "sample-cfg";
var extension = "json";
var json = fs.readFileSync(`./${name}.${extension}`, 'utf-8');

console.info(" ----------- before contents ----------");
console.log(json);

// remove blank line and whitespaces.
var after = rmc(json, !0);
console.info(" ----------- after contents -----------");
console.log(after);

fs.writeFile(`./${name}-after.${extension}`, after, 'utf-8', function() {
    console.log("data written...");
});

```

## then

#### before
> sample-cfg.json.json
```json

/**
 * block comment.
 */
// coments line.!!-+*

    /**
 * block comment.
 */// test
const $3 = { keyCode: "$1", "key": "\\\/\\\//\\\\\\\\\\" }; // these are invalid line(for sample


/* -- block comment.
 */ // see: http://json.schemastore.org/tsconfig
{
    "compilerOptions": {
        "sourceMap": false,
        // 2017/6/1 22:18:29
        "removeComments": true, // after line comment!!!!!

        "declaration": true,
        // 2017/5/18 20:53:47
        "declarationDir": "/\/.*[^\\\r\n](?=\/)\/[gimuysx]*/g\
        invalid quote string?
        ",
        // statistics
        "diagnostics": false,
        //"inlineSourceMap": true,
        //"inlineSources": true,
        // Stylize errors and messages using color and context (experimental).
        "pretty": true,
        //
        //"checkJs": true,   /* */
        "rootDir": "/[\r\n]+/",            /**/
        "outDir": "./js/[\r\n]+/**/\\",     /* after line comment!!!!! */

        // this is bad syntax.
        "listFiles": `
            somethins*
    \\
 ---

        `,
        "newLine": "LF",
        // "experimentalDecorators": true,
        // "emitDecoratorMetadata": false,
        "target": "es6",
        // NOTE: amd or umd, commonjs?
        "module": "", // for webpack

        // do not genarate custom helper functions.
        "noEmitHelpers": false,

        "typeRoots": [
            "tools",
            "node_modules/@types\\/"
        ],
        "types": [
            "jquery", "chrome", "\resource\\"
        ],
        // "lib": [
        //     "es2015.promise", "es6", "esnext", "dom"
        // ],

        // https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#unused-labels
        "allowUnusedLabels": true,
        // 暗黙のany型の宣言をエラー
        // 厳密に型を決めたいとき、anyのものは全てエラーとする
        "noImplicitAny": false,
        "strictNullChecks": false,

        // NOTE: test use.
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    },
    "include": ["ts"],
    "exclude": [
        "ts/external",
        "!./ts/*.ts",
        "!./ts/external/*.ts"
    ]
/* syntax error */
}/*/*//
```
#### after
> sample-cfg.json-after.json
```json
const $3 = { keyCode: "$1", "key": "\\\/\\\//\\\\\\\\\\" }; 
{
    "compilerOptions": {
        "sourceMap": false,
        "removeComments": true, 
        "declaration": true,
        "declarationDir": "/\/.*[^\\\r\n](?=\/)\/[gimuysx]*/g\
        invalid quote string?
        ",
        "diagnostics": false,
        "pretty": true,
        "rootDir": "/[\r\n]+/",            
        "outDir": "./js/[\r\n]+/**/\\",     
        "listFiles": `
            somethins*
    \\
 ---

        `,
        "newLine": "LF",
        "target": "es6",
        "module": "", 
        "noEmitHelpers": false,
        "typeRoots": [
            "tools",
            "node_modules/@types\\/"
        ],
        "types": [
            "jquery", "chrome", "\resource\\"
        ],
        "allowUnusedLabels": true,
        "noImplicitAny": false,
        "strictNullChecks": false,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    },
    "include": ["ts"],
    "exclude": [
        "ts/external",
        "!./ts/*.ts",
        "!./ts/external/*.ts"
    ]
}/
```
## performance

> sample-cfg.json 2,205byte,  
> with remove blank line and whitespaces and without (at node v8.4.0, intel core i5-2500k 3.3ghz

```c
> node ./bin/test/ -r -f sample-cfg.json | node ./bin/test/ -p

→ → → → → → → → performance log started...
order => version: v1.3.0, case sample-cfg.json, size: 2205 bytes, keep more blank line: false
order => version: v1.3.0, case sample-cfg.json, size: 2205 bytes, keep more blank line: true

→ → → → → → → → performance ratio: 64.087021%
[version: v1.3.0, case sample-cfg.json, size: 2205 bytes, keep more blank line: false] {
    set average: 49.093350 ms, total average for each run: 0.049093 ms
}
[version: v1.3.0, case sample-cfg.json, size: 2205 bytes, keep more blank line: true] {
    set average: 76.604200 ms, total average for each run: 0.076604 ms
}


↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓
 { r: true, f: 'sample-cfg.json' }
 --------------- start benchmark ---------------
version: v1.3.0, case sample-cfg.json, size: 2205 bytes, keep more blank line: false
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 58.110ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 49.934ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.575ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 49.267ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 49.113ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.702ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 49.742ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.790ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.328ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.159ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.360ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.158ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.494ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.465ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.454ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.430ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.276ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.173ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.216ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 48.121ms
 ---------------- end benchmark ----------------
 --------------- start benchmark ---------------
version: v1.3.0, case sample-cfg.json, size: 2205 bytes, keep more blank line: true
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 77.460ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.674ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 77.197ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.446ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.933ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.418ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.391ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.471ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.462ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.438ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.410ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.410ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.360ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.383ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.397ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.373ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.467ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.833ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.987ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 76.574ms
 ---------------- end benchmark ----------------
--done--
sample-cfg-after.json written...
```