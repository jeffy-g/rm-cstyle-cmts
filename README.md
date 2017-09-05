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

// default: maintain blank line in back quote.
// maintain blank lines in ["] or [']. (if need
//rmc.keepMoreBlankLine(true);

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
$ node ./bin/bench/ -r -f sample-cfg.json -l 1500 | node ./bin/bench/ -p

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v1.3.3, {case sample-cfg.json, size: 2205 bytes}, keep more blank line: false
✔ order => version: v1.3.3, {case sample-cfg.json, size: 2205 bytes}, keep more blank line: true

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 76.902373%
[version: v1.3.3, {case sample-cfg.json, size: 2205 bytes}, keep more blank line: false] {
    average of entries: 68.615950 ms, total average for each run: 0.045744 ms
}
[version: v1.3.3, {case sample-cfg.json, size: 2205 bytes}, keep more blank line: true] {
    average of entries: 89.224750 ms, total average for each run: 0.059483 ms
}


↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓
 { r: true, f: 'sample-cfg.json', l: '1500' }
 --------------- start benchmark ---------------
version: v1.3.3, {case sample-cfg.json, size: 2205 bytes}, keep more blank line: false
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 79.918ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 70.445ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 69.042ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 70.311ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 68.437ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 67.763ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 67.370ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 68.045ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 67.568ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 67.439ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 68.161ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 67.608ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 67.374ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 67.544ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 67.305ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 67.502ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 68.316ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 67.494ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 67.353ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 67.324ms
 ---------------- end benchmark ----------------
 --------------- start benchmark ---------------
version: v1.3.3, {case sample-cfg.json, size: 2205 bytes}, keep more blank line: true
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 88.206ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.300ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.306ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.296ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.670ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.334ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.675ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.736ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.517ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.474ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.553ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 90.718ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 95.405ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 97.654ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 97.508ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 89.184ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.942ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 88.062ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.668ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 87.287ms
 ---------------- end benchmark ----------------
--done--
sample-cfg-after written...
```

> at node v5.12.0
```c
$ node ./bin/bench/ -r -f sample-cfg.json -l 1500 | node ./bin/bench/ -p

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v1.3.3, {case sample-cfg.json, size: 2205 bytes}, keep more blank line: false
✔ order => version: v1.3.3, {case sample-cfg.json, size: 2205 bytes}, keep more blank line: true

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 89.075212%
[version: v1.3.3, {case sample-cfg.json, size: 2205 bytes}, keep more blank line: false] {
    average of entries: 177.636950 ms, total average for each run: 0.118425 ms
}
[version: v1.3.3, {case sample-cfg.json, size: 2205 bytes}, keep more blank line: true] {
    average of entries: 199.423550 ms, total average for each run: 0.132949 ms
}


↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓
 { r: true, f: 'sample-cfg.json', l: '1500' }
 --------------- start benchmark ---------------
version: v1.3.3, {case sample-cfg.json, size: 2205 bytes}, keep more blank line: false
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 183.543ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 185.989ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 178.288ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 176.932ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 177.789ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 176.483ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 176.571ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 176.510ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 176.442ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 177.047ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 177.122ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 176.518ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 176.571ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 176.377ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 176.286ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 177.523ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 177.042ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 176.892ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 176.307ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 176.507ms
 ---------------- end benchmark ----------------
 --------------- start benchmark ---------------
version: v1.3.3, {case sample-cfg.json, size: 2205 bytes}, keep more blank line: true
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 198.167ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 199.294ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 197.906ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 197.640ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 197.721ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 212.840ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 216.608ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 197.596ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 197.824ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 197.656ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 197.737ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 198.912ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 197.602ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 196.763ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 197.106ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 198.021ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 197.148ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 197.294ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 197.778ms
sample-cfg.json, rm_blank_line_n_ws=true, loop=1500: 196.858ms
 ---------------- end benchmark ----------------
--done--
sample-cfg-after written...
```
