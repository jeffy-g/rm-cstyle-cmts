[![Build Status](https://travis-ci.org/jeffy-g/rm-cstyle-cmts.svg?branch=master)](https://travis-ci.org/jeffy-g/rm-cstyle-cmts)
[![codecov](https://codecov.io/gh/jeffy-g/rm-cstyle-cmts/branch/master/graph/badge.svg)](https://codecov.io/gh/jeffy-g/rm-cstyle-cmts)
[![npm version](https://badge.fury.io/js/rm-cstyle-cmts.svg)](https://badge.fury.io/js/rm-cstyle-cmts)
[![LICENSE](https://img.shields.io/badge/Lisence-Apache%202-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjeffy-g%2Frm-cstyle-cmts.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjeffy-g%2Frm-cstyle-cmts?ref=badge_shield)
[![DeepScan grade](https://deepscan.io/api/teams/3135/projects/4618/branches/37135/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=3135&pid=4618&bid=37135)
<!-- https://img.shields.io/npm/v/rm-cstyle-cmts.svg -->
# remove cstyle comments

remove c style comments from text file(javascript source, json file etc...

## npm package name: rm-cstyle-cmts

> ### module definition
```ts
/**
 * "remove c style comments" function signature.
 */
interface IRemoveCStyleCommentsTypeSig {
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
     * @param {boolean} [rm_blank_line_n_ws] remove black line and whitespaces, default is `true`.
     * @param {boolean} [report_regex_evaluate_error] want report regex literal evaluation error? default is `undefined`
     */
    (
        source: string,
        rm_blank_line_n_ws?: boolean,
        /**
         * NOTE:
         *  + Once you change this setting, it will be taken over from the next time.
         *    So, if you want to make a temporary change, be aware that you need to switch each time.
         * ---
         */
        report_regex_evaluate_error?: boolean
    ): string;
}
interface IRemoveCStyleCommentsProperties {
    /** package version */
    readonly version: string;

    /**
     * **If a minified source is detected, the default configuration does nothing**.
     * 
     * number of times the process was bypassed because the line was too long
     */
    readonly noops: number;
    /**
     * number of times successfully processed
     */
    readonly processed: number;

    /**
     * **set whether to avoid minified source**.
     * 
     *  + threshold to avoid processing such as minified source (line length.  
     *    this also applies to embedded sourcemaps and so on.
     * 
     * NOTE: If a minified source is detected, the source is returned without any processing.
     * 
     * ⚠️This flag was set because it was found that the processing of this program would be very slow at the source to which minify was applied.
     * 
     * If you know in advance that you do not to handle minified sources,  
     * setting this value to "0" will be disable this feature.
     * 
     * default is `8000`
     */
    avoidMinified: number;
}

interface IRemoveCStyleComments extends IRemoveCStyleCommentsTypeSig, IRemoveCStyleCommentsProperties {
    /**
    * reset "noops" and "processed".
    */
    reset(): void;
    /**
    * 
    */
    getDetectedReContext(): DetectedReContext;
}

/**
 *
 */
interface DetectedReContext {
    detectedReLiterals: string[];
    evaluatedLiterals: number;
}

declare const removeCStyleComments: IRemoveCStyleComments;
export = removeCStyleComments;
```

## Playground

> [rm-cstyle-cmts Playground (powerd by monaco-editor)](https://rm-cstyle-cmts-playground.netlify.com/)

## install

> npm install rm-cstyle-cmts@latest --save-dev  
> \# shorthand  
> npm i rm-cstyle-cmts@latest -D

etc...

## BUGS

* [ ] `BUG:` #cannot keep blank line at nested es6 template string, (`rm_blank_line_n_ws=true`, at src/ts/index.ts
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

+ performance bench of "samples/es6.js"
```bash
npm run bench
```

> es6.js 4,544 bytes,  
> with remove blank line and whitespaces and without (at node v12.2.0, intel core i5-2500k 3.3ghz

```ts
> rm-cstyle-cmts@1.7.0 bench
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 -ol 10 | node ./bin/bench/ -p

v12.2.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v1.7.0, case: { source: es6.js@4,544 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
✔ order => version: v1.7.0, case: { source: es6.js@4,544 bytes, remove_blanks=false }, outerloop=10, innerloop=2000

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 54.514581%
[version: v1.7.0, case: { source: es6.js@4,544 bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 152.647600 ms, total average for each run: 0.076324 ms
}
[version: v1.7.0, case: { source: es6.js@4,544 bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 83.215200 ms, total average for each run: 0.041608 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000', ol: '10' }
avoidMinified: 8000
 --------------- start benchmark (remove blanks) ---------------
version: v1.7.0, case: { source: es6.js@4,544 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=true, loop=2000: 167.750ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 149.966ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 149.239ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 152.142ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 152.287ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 149.069ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 148.990ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 149.865ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 155.362ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 151.806ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: v1.7.0, case: { source: es6.js@4,544 bytes, remove_blanks=false }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=false, loop=2000: 83.947ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 82.645ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 82.920ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 82.375ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 82.821ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 84.503ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 84.908ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 83.529ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 82.168ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 82.336ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```

> at node v8.10.0
```ts
> rm-cstyle-cmts@1.7.0 bench
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 -ol 10 | node ./bin/bench/ -p

v8.10.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v1.7.0, case: { source: es6.js@4,544 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
✔ order => version: v1.7.0, case: { source: es6.js@4,544 bytes, remove_blanks=false }, outerloop=10, innerloop=2000

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 69.495084%
[version: v1.7.0, case: { source: es6.js@4,544 bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 227.592500 ms, total average for each run: 0.113796 ms
}
[version: v1.7.0, case: { source: es6.js@4,544 bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 158.165600 ms, total average for each run: 0.079083 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000', ol: '10' }
avoidMinified: 8000
 --------------- start benchmark (remove blanks) ---------------
version: v1.7.0, case: { source: es6.js@4,544 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=true, loop=2000: 239.332ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 223.376ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 224.937ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 234.354ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 235.614ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 222.905ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 222.482ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 225.346ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 224.902ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 222.677ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: v1.7.0, case: { source: es6.js@4,544 bytes, remove_blanks=false }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=false, loop=2000: 158.386ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 158.186ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 156.872ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 156.740ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 157.889ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 156.928ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 159.159ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 158.185ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 157.594ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 161.717ms
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

(?<![<\w\]])         # avoidance: jsx or tsx start tag, available on node v8.10
\/                   # regexp literal start@delimiter
  (?![?*+\/])        # not meta character "?*+/" @anchor
  (?:                # start non-capturing group $1
    \[               # class set start
      (?:            # non-capturing group $2
        \\[\s\S]|    # escaped any character or
        [^\]\r\n\\]  # without class set end, newline, backslash
      )*             # end non-capturing group $2, q:0 or more
    \]|              # class set end, or
    \\[\s\S]|        # escaped any character or
    [^\/\r\n\\]      # characters without slash, newline, backslash
  )+                 # end non-capturing group $1, q:1 or more
\/                   # regexp literal end@delimiter
(?:                  # start non-capturing group $3
  [gimsuy]{1,6}\b|   # validate regex flags, but this pattern is imcomplete
)                    # end non-capturing group $3
(?![?*+\/[\\])       # not meta character [?*+/[\\] @anchor ...

```
as comment on samples/es6.js with descriptive explanation,

please look there.
