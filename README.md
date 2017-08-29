# remove cstyle comments
remove c style comments from text file(javascript source, json file etc...

## npm package name: rm-cstyle-cmts

### function signature
```ts
/**
 * remove c style comments form "source" content.
 * @param {string} source c style commented text source.
 * @param {boolean} is_multi_process_use multi thread like?
 */
declare function removeCStyleComments(source: string, is_multi_process_use: boolean = false): string;
```

### usage

```js
const rmc = require("rm-cstyle-cmts");
const fs = require("fs");

const json = fs.readFileSync("./sample-tsconfig.json", 'utf-8');
console.info(" ----------- before contents ----------");
console.log(json);
console.info(" ----------- after contents -----------");
console.log(rmc(json));
```

### then

```json
 ----------- before contents ----------

/**
 * block comment.
 */
// coments line.!!-+*

    /**
 * block comment.
 */// test
const $3 = { keyCode: $1, key: "$5" }; // these are invalid line(for sample


/* -- block comment.
 */ // see: http://json.schemastore.org/tsconfig
{
    "compilerOptions": {
        "sourceMap": false,
        // 2017/6/1 22:18:29
        "removeComments": true, // after line comment!!!!!

        "declaration": true,
        // 2017/5/18 20:53:47
        "declarationDir": "./project.d.ts",
        // statistics
        "diagnostics": false,
        //"inlineSourceMap": true,
        //"inlineSources": true,
        // Stylize errors and messages using color and context (experimental).
        "pretty": true,
        //
        //"checkJs": true,   /* */
        "rootDir": "./ts",            /**/
        "outDir": "./js",     /* after line comment!!!!! */

        "listFiles": false,
        "newLine": "LF",
        // "experimentalDecorators": true,
        // "emitDecoratorMetadata": false,
        "target": "es6",
        // NOTE: amd or umd, commonjs?
        "module": "es2015", // for webpack

        // do not genarate custom helper functions.
        "noEmitHelpers": false,

        "typeRoots": [
            "tools",
            "node_modules/@types/"
        ],
        "types": [
            "jquery", "chrome", "resource"
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
        "ts/external"
    ]
}


 ----------- after contents -----------
const $3 = { keyCode: $1, key: "$5" };
{
    "compilerOptions": {
        "sourceMap": false,
        "removeComments": true,
        "declaration": true,
        "declarationDir": "./project.d.ts",
        "diagnostics": false,
        "pretty": true,
        "rootDir": "./ts",
        "outDir": "./js",
        "listFiles": false,
        "newLine": "LF",
        "target": "es6",
        "module": "es2015",
        "noEmitHelpers": false,
        "typeRoots": [
            "tools",
            "node_modules/@types/"
        ],
        "types": [
            "jquery", "chrome", "resource"
        ],
        "allowUnusedLabels": true,
        "noImplicitAny": false,
        "strictNullChecks": false,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    },
    "include": ["ts"],
    "exclude": [
        "ts/external"
    ]
}

```
