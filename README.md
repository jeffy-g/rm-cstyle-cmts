# remove cstyle comments
remove c style comments from text file(javascript source, json file etc...

## npm package name: rm-cstyle-cmts

### usage

```js
const rmc = require("rm-cstyle-cmts");
const fs = require("fs");

const tsc = fs.readFileSync("./tsconfig.json", 'utf-8');
console.info(" ----------- before contents ----------");
console.log(tsc);
console.info(" ----------- after contents -----------");
console.log(rmc(tsc));
```

### then

```json
 ----------- before contents ----------
// see: http://json.schemastore.org/tsconfig
{
    "compilerOptions": {
        "sourceMap": false,
        // 2017/6/1 22:18:29
        "removeComments": true,

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
        //"checkJs": true,
        "rootDir": "./ts",
        "outDir": "./js",

        "listFiles": false,
        "newLine": "LF",
        // "experimentalDecorators": true,
        // "emitDecoratorMetadata": false,
        // firefox で動かすなら target :"es5" が better?
        "target": "es6",
        // NOTE: amd or umd? commonjs?
        "module": "es2015", // for webpack

        // do not genarate custom helper functions.
        // NOTE: for r.js build is set "true"
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
        // "outFile": "all",
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
