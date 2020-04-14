[![Build Status](https://travis-ci.org/jeffy-g/rm-cstyle-cmts.svg?branch=master)](https://travis-ci.org/jeffy-g/rm-cstyle-cmts "travis status")
[![wercker status](https://app.wercker.com/status/871330ccbec8a35d57b965d5e1d8a1d9/s/master)](https://app.wercker.com/project/byKey/871330ccbec8a35d57b965d5e1d8a1d9 "wercker status")
[![codecov](https://codecov.io/gh/jeffy-g/rm-cstyle-cmts/branch/master/graph/badge.svg)](https://codecov.io/gh/jeffy-g/rm-cstyle-cmts)
[![npm version](https://badge.fury.io/js/rm-cstyle-cmts.svg)](https://badge.fury.io/js/rm-cstyle-cmts)
![node](https://img.shields.io/node/v/rm-cstyle-cmts.svg?style=plastic)

[![LICENSE](https://img.shields.io/badge/Lisence-Apache%202-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjeffy-g%2Frm-cstyle-cmts.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjeffy-g%2Frm-cstyle-cmts?ref=badge_shield)
[![DeepScan grade](https://deepscan.io/api/teams/3135/projects/4618/branches/37135/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=3135&pid=4618&bid=37135)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/jeffy-g/rm-cstyle-cmts.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/jeffy-g/rm-cstyle-cmts/context:javascript)
[![Maintainability](https://api.codeclimate.com/v1/badges/6fb687e6fd2c33a0a328/maintainability)](https://codeclimate.com/github/jeffy-g/rm-cstyle-cmts/maintainability)

[![Dependencies][dependencies]][dependencies-url]
[![Dev Dependencies][dev-dependencies]][dev-dependencies-url]
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/jeffy-g/rm-cstyle-cmts.svg?style=plastic)
![npm bundle size](https://img.shields.io/bundlephobia/min/rm-cstyle-cmts.svg?style=plastic)
![npm](https://img.shields.io/npm/dm/rm-cstyle-cmts.svg?style=plastic)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/jeffy-g/rm-cstyle-cmts.svg?style=plastic)

<!-- ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/rm-cstyle-cmts.svg) -->
<!-- ![npm bundle size (version)](https://img.shields.io/bundlephobia/min/rm-cstyle-cmts/latest.svg) -->
<!-- https://img.shields.io/npm/v/rm-cstyle-cmts.svg -->

[dependencies]: https://img.shields.io/david/jeffy-g/rm-cstyle-cmts.svg
[dependencies-url]: https://david-dm.org/jeffy-g/rm-cstyle-cmts
[dev-dependencies]: https://img.shields.io/david/dev/jeffy-g/rm-cstyle-cmts.svg
[dev-dependencies-url]: https://david-dm.org/jeffy-g/rm-cstyle-cmts#info=devDependencies


# remove cstyle comments

remove c style comments from text file(javascript source, json file etc...

## npm package name: rm-cstyle-cmts

## Playground

> [rm-cstyle-cmts Playground (powerd by monaco-editor)](https://rm-cstyle-cmts-playground.netlify.com/)


## install

> npm install rm-cstyle-cmts@latest --save-dev  
> \# shorthand  
> npm i rm-cstyle-cmts@latest -D

etc...

## rm-cstyle-cmts gulp plugin is available.

```js
const grmc = require("rm-cstyle-cmts/bin/gulp/");

// ...

gulp.src(["./src/**/*.js"]).pipe(
    /**
     * remove_ws : remove whitespace and blank lines.
     */
    grmc.getTransformer({
        remove_ws: true,
        render_progress: true,
    })
).pipe(gulp.dest("./tmp"));
```

## asynchronous processing supported (v2.1.x)

 + ~~In the near future, will be able to work with asynchronous processing~~

 + It is possible to process without problems in asynchronous processing from v2.1.x or later.

## rm-cstyle-cmts web version is available. (v2.2.x)

 + You can use web version from cdn such as `jsdelivr`.
   + can use the API through the `Rmc` global variable.

```html
<!-- or https://cdn.jsdelivr.net/npm/rm-cstyle-cmts@latest/bin/web/index.min.js -->
<script src="https://cdn.jsdelivr.net/npm/rm-cstyle-cmts@2.2/bin/web/index.min.js"></script>
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
// disable max line limitation
Rmc.avoidMinified = 0;
console.log(Rmc(source));
// print detected regex literals detail (in this case, nothing any result)
console.log(Rmc.getDetectedReContext());
// reset of related statistics
Rmc.reset();
```

## BUGS

* [x] ~~`BUG:` #cannot keep blank line at nested es6 template string, (`rm_blank_line_n_ws=true`, at src/ts/index.ts~~
* [X] ~~*`BUG:` When a newline character is CRLF, regexp instance specifying multiline flag can not correctly supplement CRLF with ^ and $*~~
* [X] ~~*`BUG:` In some cases, a newline character remains at the beginning or the end of the file. (`rm_blank_line_n_ws=true`, at src/ts/index.ts*~~
* [X] ~~*`BUG:` #cannot remove last new line char. (at src/ts/index.ts*~~
* [X] ~~*`FIXED:`? #cannot beyond regex. (at src/ts/index.ts*~~


## usage

> #### Case: single line input (js)

  + without regex misdetection
```js
const rmc = require("rm-cstyle-cmts");
const input = "    /** block comment */ const a = \"this is apple! \\n\", b = 'quoted \"strings\"', \
c = `list:\\n1. \${a}\\n2. \${b}\\n\${ /* comments */ ` - len: \${a.length + b.length}`}\\n ---`;  \
/* . */  let i = 2, n = 12 / 4 * 7/i; // last coment.  !";
//                               ^^^

const result = rmc(input, true, true);
console.log(result);
//> const a = "this is apple! \n", b = 'quoted "strings"', c = `list:\n1. ${a}\n2. ${b}\n${ /* comments */ ` - len: ${a.length + b.length}`}\n ---`;    let i = 2, n = 12 / 4 * 7/i;
```

  + with regex misdetection
```js
const rmc = require("rm-cstyle-cmts");
const input = "    /** block comment */ const a = \"this is apple! \\n\", b = 'quoted \"strings\"', \
c = `list:\\n1. \${a}\\n2. \${b}\\n\${ /* comments */ ` - len: \${a.length + b.length}`}\\n ---`;  \
/* . */  let i = 2, n = 12 / 4 * (7/i); // last coment.  !";
//               misdetection -> ^^^^^

const result = rmc(input, true, true);
console.log(result);
//> Regex SyntaxError: [/ 4 * (7/i]
//> const a = "this is apple! \n", b = 'quoted "strings"', c = `list:\n1. ${a}\n2. ${b}\n${ /* comments */ ` - len: ${a.length + b.length}`}\n ---`;    let i = 2, n = 12 / 4 * (7/i);
```

> #### Case: json source
```js
const rmc = require("rm-cstyle-cmts");
const input = `// see: http://json.schemastore.org/tsconfig
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

const result = rmc(input, true, true);
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


> #### Case: remove comments from file contents (js, jsx, ts, tsx)

```js
const rmc = require("rm-cstyle-cmts");
const fs = require("fs");

const name = "samples/es6";
const source = fs.readFileSync(`./${name}.js`, 'utf-8');

console.info(" ----------- before contents ----------");
console.log(source);

// remove blank line and whitespaces. (default: true)
const after = rmc(source/*, true*/);
console.info(" ----------- after contents -----------");
console.log(after);

fs.writeFile(`./${name}-after.js`, after, 'utf-8', function() {
    console.log("data written...");
});
```

## performance

> 📝 In v2.x and later, its **optimized to node v10 and later**.  
  This works even on node v9 and earlier, but with poor performance.

+ performance bench of "samples/es6.js"
```bash
npm run bench
```

> es6.js 4,557 bytes,  
> with remove blank line and whitespaces and without (at node v13.12.0, intel core i5-2500k 3.3ghz

```ts
> rm-cstyle-cmts@2.4.0 bench
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 -ol 10 | node ./bin/bench/ -p

v13.12.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v2.4.0, case: { source: es6.js@4,557 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
✔ order => version: v2.4.0, case: { source: es6.js@4,557 bytes, remove_blanks=false }, outerloop=10, innerloop=2000

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 44.080741%
[version: v2.4.0, case: { source: es6.js@4,557 bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 140.236300 ms, total average for each run: 0.070118 ms
}
[version: v2.4.0, case: { source: es6.js@4,557 bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 61.817200 ms, total average for each run: 0.030909 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000', ol: '10' }
avoidMinified: 8000
 --------------- start benchmark (remove blanks) ---------------
version: v2.4.0, case: { source: es6.js@4,557 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=true, loop=2000: 165.303ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 141.355ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 134.427ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 136.966ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 133.825ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 142.413ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.296ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 135.693ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 139.276ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 135.809ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: v2.4.0, case: { source: es6.js@4,557 bytes, remove_blanks=false }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=false, loop=2000: 62.969ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 62.778ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 60.365ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 63.1ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 63.149ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 62.689ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 60.458ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 60.249ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 62.493ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 59.922ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```

> at node v6.0.0
```ts
> rm-cstyle-cmts@2.4.0 bench
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 -ol 10 | node ./bin/bench/ -p

v6.0.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v2.4.0, case: { source: es6.js@4,557 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
✔ order => version: v2.4.0, case: { source: es6.js@4,557 bytes, remove_blanks=false }, outerloop=10, innerloop=2000

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 52.838312%
[version: v2.4.0, case: { source: es6.js@4,557 bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 376.361000 ms, total average for each run: 0.188181 ms
}
[version: v2.4.0, case: { source: es6.js@4,557 bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 198.862800 ms, total average for each run: 0.099431 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000', ol: '10' }
avoidMinified: 8000
 --------------- start benchmark (remove blanks) ---------------
version: v2.4.0, case: { source: es6.js@4,557 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=true, loop=2000: 397.152ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 371.594ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 389.365ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 368.111ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 368.005ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 366.553ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 367.572ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 390.976ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 373.609ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 370.673ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: v2.4.0, case: { source: es6.js@4,557 bytes, remove_blanks=false }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=false, loop=2000: 197.837ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 198.295ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 199.844ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 198.615ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 201.847ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 197.124ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 198.584ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 198.821ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 198.824ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 198.837ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```

## Regarding Verification of Regular Expression Literals:

>
>if regex literals contains quote marks and so on,  
>since the parse of QuoteVisitor class fails, it is necessary to skip regular expression literals.
>
>also, most regular expression literals can be detected,  
>in some cases incorrect detection is done in numerical calculation statement using "/".
>
>but in this program, this is not important :-
>

```perl

\/                   # regexp literal start@delimiter
  (?![?*+\/])        # not meta character "?*+/" @anchor
  (?:                # start non-capturing group $1
    \[               # class set start
      (?:            # non-capturing group $2
        [^\]\r\n\\]| # without class set end, newline, backslash
        \\[\s\S]     # escaped any character or
      )*             # end non-capturing group $2, q:0 or more
    \]|              # class set end, or
    [^\/\r\n\\]|     # characters without slash, newline, backslash
    \\[\s\S]         # escaped any character or
  )+                 # end non-capturing group $1, q:1 or more
\/                   # regexp literal end@delimiter
(?:                  # start non-capturing group $3
  [gimsuy]{1,6}\b|   # validate regex flags, but this pattern is imcomplete
)                    # end non-capturing group $3
(?![?*+\/\[\\])      # not meta character [?*+/[\] @anchor ...

```
as comment on samples/es6.js with descriptive explanation,

please look there.
