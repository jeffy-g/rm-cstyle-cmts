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
    console.log("written data...");
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
const $3 = { keyCode: "$1", "key": "$5" }; // these are invalid line(for sample


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
}


```
#### after
> sample-cfg.json-after.json
```json
const $3 = { keyCode: "$1", "key": "$5" }; 
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
}
```
## performance

> sample-cfg.json 2,165byte with remove blank line and whitespaces (at node v8.4.0, intel core i5-2500k 3.3ghz
```c
>node test
 --------------- start benchmark ---------------
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 89.167ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 81.415ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 79.385ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 79.447ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 77.779ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 78.467ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 78.578ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 78.042ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 77.780ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 77.861ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 78.118ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 77.990ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 77.727ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 78.647ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 78.646ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 78.009ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 78.069ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 78.024ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 79.603ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1000: 77.917ms
 ---------------- end benchmark ----------------
written data...
```