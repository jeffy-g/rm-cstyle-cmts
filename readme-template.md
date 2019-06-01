[![Build Status](https://travis-ci.org/jeffy-g/rm-cstyle-cmts.svg?branch=master)](https://travis-ci.org/jeffy-g/rm-cstyle-cmts)
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

## asynchronous processing supported

 + ~~In the near future, will be able to work with asynchronous processing~~

 + It is possible to process without problems in asynchronous processing from v2.1.x or later.

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

> es6.js @SIZE bytes,  
> with remove blank line and whitespaces and without (at node @NODE_LATEST_V, intel core i5-2500k 3.3ghz

```ts
@NODE_LATEST_LOG
```

> at node @NODE_OLD_V
```ts
@NODE_OLD_LOG
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
(?![?*+\/\\])        # not meta character [?*+\/\\] @anchor ...

```
as comment on samples/es6.js with descriptive explanation,

please look there.

## module definition
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
     * @param {boolean} [rm_blank_line_n_ws] remove blank line and whitespaces, default is `true`.
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
