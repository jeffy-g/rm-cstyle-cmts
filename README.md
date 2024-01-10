[![Node.js CI](https://github.com/jeffy-g/rm-cstyle-cmts/actions/workflows/nodejs.yml/badge.svg)](https://github.com/jeffy-g/rm-cstyle-cmts/actions/workflows/nodejs.yml)
[![CircleCI](https://circleci.com/gh/jeffy-g/rm-cstyle-cmts/tree/master.svg?style=svg)](https://circleci.com/gh/jeffy-g/rm-cstyle-cmts/tree/master)
[![codecov](https://codecov.io/gh/jeffy-g/rm-cstyle-cmts/graph/badge.svg?token=pqMULIrDTY)](https://codecov.io/gh/jeffy-g/rm-cstyle-cmts)
![NPM Version](https://img.shields.io/npm/v/rm-cstyle-cmts?style=plastic&color=green)
![node-current](https://img.shields.io/node/v/rm-cstyle-cmts?style=plastic)
![LICENSE](https://img.shields.io/badge/Lisence-MIT-blue.svg)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fjeffy-g%2Frm-cstyle-cmts.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fjeffy-g%2Frm-cstyle-cmts?ref=badge_shield&issueType=license)
[![DeepScan grade](https://deepscan.io/api/teams/3135/projects/4618/branches/37135/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=3135&pid=4618&bid=37135)

[![Maintainability](https://api.codeclimate.com/v1/badges/6fb687e6fd2c33a0a328/maintainability)](https://codeclimate.com/github/jeffy-g/rm-cstyle-cmts/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6fb687e6fd2c33a0a328/test_coverage)](https://codeclimate.com/github/jeffy-g/rm-cstyle-cmts/test_coverage)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/jeffy-g/rm-cstyle-cmts?style=plastic)
![npm bundle size](https://img.shields.io/bundlephobia/min/rm-cstyle-cmts?style=plastic)
![NPM Downloads](https://img.shields.io/npm/dm/rm-cstyle-cmts?style=plastic)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/jeffy-g/rm-cstyle-cmts?style=plastic)


# remove cstyle comments (rm-cstyle-cmts)

 remove c style comments from text file. (javascript source, json file etc

  * This module removes comments from source files such as `typescript` and `javascript`.  
  It does not remove lines that are meaningful to `typescript`, such as `@ts-ignore` and `<reference types="node"/>`,  
  but removes other **single line comments** and **multi line comments**.

  * For other **single line comment** and **multi line comment**, it is possible to control which comment is remove by setting [**scan listener**](#the-walkthrough-mode).

  * This module is [much faster than the popular comment removal module](#performance-measurement-with-benchmarkjs).

  * [**gulp plugin**](#rm-cstyle-cmts-gulp-plugin) is available.

  * [**web version**](#rm-cstyle-cmts-web-version) is available.

  * new property `keepJsDoc` (v3.3.11)

## install

  * npm

  ```shell
  $ npm install rm-cstyle-cmts --save-dev  
  # shorthand  
  $ npm i rm-cstyle-cmts -D
  ```

  * yarn
 
   ```shell
   $ yarn add rm-cstyle-cmts -D
   ```

## Features

  + remove mode

  ```js
  const rmc = require("rm-cstyle-cmts");
  const removed = rmc("<source file content>");
  ```

  + walkthrough mode (walkthrough mode does things like statistics for source code comments by setting a scan listener.)

  ```js
  const rmc = require("rm-cstyle-cmts");

  /** @type {Map<string, number>} */
  const tagStatistics = new Map();
  /**
   * Take statistics for jsDoc tag
   *
   * @param {object} context
   * @param {TScannerEventContext["event"]} context.event - currently EScannerEvent.(SingleLineComment | MultiLineComment) only
   * @param {TScannerEventContext["fragment"]} context.fragment comment body
   * @param {TScannerEventContext["offset"]} context.offset - fragment start offset from original source
   */
  function handleScanEvent({ event, fragment, offset }) => {
    if (event === /*EScannerEvent.MultiLineComment*/1) {
        if (/^\/\*\*[^*]/.test(fragment)) {
            const re = /(?<=[\s\*{])@\w+(?=\s)/g;
            /** @type {RegExpExecArray} */
            let m;
            while (m = re.exec(fragment)) {
                const tag = m[0];
                let count = tagStatistics.get(tag) || 0;
                tagStatistics.set(tag, count + 1);
            }
        }
    }
    return true;
  }

  // At current implementation, accept one listener only
  rmc.setListener(handleScanEvent);
  rmc.walk("<source file content>");

  ```

## API

  node module.

  ```js
  const rmc = require("rm-cstyle-cmts");
  ```

### run as remove mode

```js
const opt = { collectRegex: true, showErrorMessage: true, preserveBlanks: true };
const removed = rmc("<source file content>", opt);
```

- **source** `{string}` -- The target source content.
- **opt** `{object}`
  - [**opt.collectRegex**](https://github.com/jeffy-g/rm-cstyle-cmts/blob/master/src/index.d.ts#L19) `{true | undefined}` -- Whether collect detected regex. Default: `undefined`.
  - [**opt.showErrorMessage**](https://github.com/jeffy-g/rm-cstyle-cmts/blob/master/src/index.d.ts#L27) `{true | undefined}` -- Whether to display an error message. Default: `undefined`.
  - [**opt.preserveBlanks**](https://github.com/jeffy-g/rm-cstyle-cmts/blob/master/src/index.d.ts#L37) `{true | undefined}` -- Whether preserve whitespace and blank lines. Default: `undefined`.

### run as walkthrough mode

```js
const opt = { collectRegex: true, showErrorMessage: true };
rmc.walk("<source file content>", opt);
```

- **source** `{string}` -- The target source content.
- **opt** `{object}`
  - [**opt.collectRegex**](https://github.com/jeffy-g/rm-cstyle-cmts/blob/master/src/index.d.ts#L19) `{true | undefined}` -- Whether collect detected regex. Default: `undefined`.
  - [**opt.showErrorMessage**](https://github.com/jeffy-g/rm-cstyle-cmts/blob/master/src/index.d.ts#L27) `{true | undefined}` -- Whether to display an error message. Default: `undefined`.

## Playground

 + [rm-cstyle-cmts Playground (powerd by monaco-editor)](https://rm-cstyle-cmts-playground.netlify.com/)

## Performance measurement with `Benchmark.js`

  ```shell
  $ npm run benchmark
  ```

  + We are comparing the process of deleting only `comment` from the following sample

    <details>

    ```js
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
    ```

    </details>

  > ### node v12.22.11
  
  ```shell
  yarn run v1.22.18
  $ node bench.mjs

  - - - - - - - bench mark test - - - - - - - - -
  Platform info:
  Windows_NT 10.0.19043 x64
  Node.JS: 12.22.11
  V8     : 7.8.279.23-node.56
  Intel(R) Core(TM) i5-2500K CPU @ 3.30GHz x 4

  strip-comments x 11,677 ops/sec ±0.32% (90 runs sampled)
  strip-json-comments x 16,759 ops/sec ±0.11% (97 runs sampled)
  rm-cstyle-cmts x 169,240 ops/sec ±0.09% (95 runs sampled)
  rm-cstyle-cmts (webpack) x 174,768 ops/sec ±0.16% (94 runs sampled)
  rm-cstyle-cmts (umd) x 172,408 ops/sec ±0.18% (94 runs sampled)
  - - done - -
  all results are equals? true # see NOTE:
  Done in 27.79s.
  ```

  > ### node v17.9.0
  
  ```shell
  yarn run v1.22.18
  $ node etc/bench/bench.mjs

  - - - - - - - bench mark test - - - - - - - - -
  Platform info:
  Windows_NT 10.0.19043 x64
  Node.JS: 17.9.0
  V8     : 9.6.180.15-node.16
  Intel(R) Core(TM) i5-2500K CPU @ 3.30GHz x 4

  strip-comments x 11,327 ops/sec ±0.43% (87 runs sampled)
  strip-json-comments x 17,281 ops/sec ±0.08% (95 runs sampled)
  rm-cstyle-cmts x 163,564 ops/sec ±0.08% (94 runs sampled)
  rm-cstyle-cmts (webpack) x 159,575 ops/sec ±0.08% (93 runs sampled)
  rm-cstyle-cmts (umd) x 160,841 ops/sec ±0.18% (96 runs sampled)
  - - done - -
  all results are equals? true # see NOTE:
  Done in 27.74s.
  ```

  + NOTE: `strip-comments` may be buggy and is excluded from comparison


## The `Walkthrough mode`

`Walkthrough mode` is not modify original source.

The current implementation calls the `listener` on __line comment__ and __multi-line comment__ scan events.

```ts
import * as rmc from "rm-cstyle-cmts";

/**
 * @param {object} context
 * @param {TScannerEventContext["event"]} context.event - currently EScannerEvent.(SingleLineComment | MultiLineComment) only
 * @param {TScannerEventContext["fragment"]} context.fragment comment body
 * @param {TScannerEventContext["offset"]} context.offset - fragment start offset from original source
 */
function handleScanEvent({ event, fragment, offset }) => {
  if (event === /*EScannerEvent.MultiLineComment*/1) {
    // remove mode: preserve JSDoc comment
    // walkthrough mode: whether proceed walkthrough
    return /^\/\*\*[^*]/.test(fragment);
  }
  return false;
}
// At current implementation, accept one listener only
rmc.setListener(handleScanEvent);

const opt = { collectRegex: true, showErrorMessage: true };
rmc("<commented source>", opt);
rmc.walk("<commented source>", opt);
```

> __NOTE__: Handling of listener in `remove mode` and `walkthrough mode`

  + In `walkthrough mode`: Returns `true` to continue processing. otherwise stop processing.

  + In `remove mode`: it returns `true` to preserve in the **line comment** and **multi line comment** deletion process.


## `rm-cstyle-cmts` gulp plugin

### gulp plugin sample task
  + sample task to scan javascript related files directly under `node_modules`

  ```shell
  $ npm run grmc-test:cjs
  ```

### API of gulp plugin

```js
const gulp = require("gulp"); 
const grmc = require("rm-cstyle-cmts/cjs/gulp/");
const grmcOpt = {
    preserveBlanks: undefined, // remove blank lines and traling whitespace
    renderProgress: true,      // show progress
    // isWalk: true // want walk through?
};
gulp.src(["./src/**/*.{js,jsx,ts,tsx}"]).pipe(
    grmc.getTransformer(grmcOpt)
).pipe(gulp.dest("./tmp"));
```

#### gulp plugin options

- [**preserveBlanks**](https://github.com/jeffy-g/rm-cstyle-cmts/blob/9f110983eac55d29ff34e86ca366de450810cde1/src/gulp/index.d.ts#L32) `{true | undefined}` -- Whether preserve whitespace and blank lines. Default: `undefined`.
- [**renderProgress**](https://github.com/jeffy-g/rm-cstyle-cmts/blob/9f110983eac55d29ff34e86ca366de450810cde1/src/gulp/index.d.ts#L40) `{true | undefined}` -- log scan source path(relative) currently being processed. Default: `undefined`.
- [**collectRegex**](https://github.com/jeffy-g/rm-cstyle-cmts/blob/9f110983eac55d29ff34e86ca366de450810cde1/src/gulp/index.d.ts#L44) `{true | undefined}` -- Whether collect detected regex. Default: `undefined`.
- [**isWalk**](https://github.com/jeffy-g/rm-cstyle-cmts/blob/9f110983eac55d29ff34e86ca366de450810cde1/src/gulp/index.d.ts#L50) `{true | undefined}` -- Whether to run in walkthrough mode. Default: `undefined`.
- [**extraExtensions**](https://github.com/jeffy-g/rm-cstyle-cmts/blob/9f110983eac55d29ff34e86ca366de450810cde1/src/gulp/index.d.ts#L56) `{string[] | undefined}` -- Add additional extensions. Default: `undefined`.
- [**disableDefaultExtentions**](https://github.com/jeffy-g/rm-cstyle-cmts/blob/9f110983eac55d29ff34e86ca366de450810cde1/src/gulp/index.d.ts#L72) `{true | undefined}` -- use `extraExtensions` only, instaed of `defaultExtensions`. Default: `undefined`.
  + `defaultExtensions` - ".js", ".jsx", ".ts", ".tsx", ".cjs", ".mjs", ".cts", ".mts"
- [**timeMeasure**](https://github.com/jeffy-g/rm-cstyle-cmts/blob/9f110983eac55d29ff34e86ca366de450810cde1/src/gulp/index.d.ts#L78) `{true | undefined}` -- Whether to record the processing time for each file (replace mode only). Default: `undefined`.

#### example with `scan listener`

```js
const gulp = require("gulp"); 
const grmc = require("rm-cstyle-cmts/cjs/gulp/");

// set scan event listener
grmc.getRmcInterface().setListener(({ event, fragment, offset }) => {
    if (event === /*EScannerEvent.MultiLineComment*/1) {
        // true: Concatenate fragment to result in "remove mode", continue walkthrough in "walkthrough mode".
        // false: remove fragment in "remove mode", stop walkthrough in "walkthrough mode".
        return /^\/\*(\*|!)\s/.test(fragment);
    }
    else if (event === /*EScannerEvent.SingleLineComment*/0) {
        return /(?:\/\/\/?\s+@ts-\w+|\/\/\/\s*<reference)/.test(fragment);
    }
    // remove fragment in "remove mode", stop walkthrough in "walkthrough mode".
    return false;
});

gulp.src(["./src/**/*.{js,jsx,ts,tsx}"]).pipe(
    /**
     * preserveBlanks : keep blank line and whitespaces, default is `undefined`.
     */
    grmc.getTransformer({
        preserveBlanks: undefined, // remove blank lines and traling whitespace
        renderProgress: true,      // show progress
        // isWalk: true // want walk through?
    })
).pipe(gulp.dest("./tmp"));
```

## rm-cstyle-cmts web version

 + You can use web version from cdn such as `jsdelivr`.
   + can use the API through the `Rmc` global variable.

```html
<!-- or https://cdn.jsdelivr.net/npm/rm-cstyle-cmts@latest/umd/index.min.js -->
<script src="https://cdn.jsdelivr.net/npm/rm-cstyle-cmts@3/umd/index.min.js"></script>
```

```js
const source = `
///  <reference types="node"/>

import React from "react";
import ReactDOM from "react-dom";

/**
 * jsdoc comment
 */
function App() {
  return (
    // TODO: can optionally include quote string in react syntax.
    // such source input does not complete successfully.
    <h1>Hello's world's</h1>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
`;

/**
 * You can use the API through the `Rmc` global variable.
 */
console.log(Rmc(source));
// print detected regex literals detail (in this case, nothing any result)
console.log(Rmc.getDetectedReContext());
// reset of related statistics
Rmc.reset();
```


## usage

> #### Case: single line input (js)

```js
const rmc = require("rm-cstyle-cmts");
const input = "    /** block comment */ const a = \"this is apple! \\n\", b = 'quoted \"strings\"', \
c = `list:\\n1. \${a}\\n2. \${b}\\n\${ /* comments */ ` - len: \${a.length + b.length}`}\\n ---`;  \
/* . */  let i = 2, n = 12 / 4 * 7/i; // last coment.  !";

const result = rmc(input);
console.log(result);
//> const a = "this is apple! \n", b = 'quoted "strings"', c = `list:\n1. ${a}\n2. ${b}\n${ /* comments */ ` - len: ${a.length + b.length}`}\n ---`;    let i = 2, n = 12 / 4 * 7/i;
```

> #### Case: json source
```js
const rmc = require("rm-cstyle-cmts");
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

const result = rmc(input);
console.log(result);
//> {
//>   "compilerOptions": {
//>     "target": "es5",
//>     "module": "commonjs",
//>     "strict": true,
//>     "esModuleInterop": true
//>   },
//>   "files": [
//>     "y"
//>   ]
//> }

```

