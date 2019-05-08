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
        report_regex_evaluate_error?: boolean
    ): string;
}
interface IAvoidance {
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
interface IRemoveCStyleComments extends IRemoveCStyleCommentsTypeSig, IAvoidance {
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
     * reset "noops" and "processed".
     */
    reset(): void;
}

module.exports = Object.defineProperties(...) as IRemoveCStyleCommentsModule;
```

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

> #### Case: single line input

  + without regex misdetection
```js
const rmc = require("rm-cstyle-cmts");
const input = "    /** block comment */ const a = \"this is apple! \\n\", b = 'quoted \"strings\"', \
c = `list:\\n1. \${a}\\n2. \${b}\\n\${ /* comments */ ` - len: \${a.length + b.length}`}\\n ---`;  \
/* . */  let i = 2, n = 12 / 4 * 7/i; // last coment.  !";
//                               ^^^

rmc(input, true, true);
// > const a = "this is apple! \n", b = 'quoted "strings"', c = `list:\n1. ${a}\n2. ${b}\n${ /* comments */ ` - len: ${a.length + b.length}`}\n ---`;    let i = 2, n = 12 / 4 * 7/i;
```

  + with regex misdetection
```js
const rmc = require("rm-cstyle-cmts");
const input = "    /** block comment */ const a = \"this is apple! \\n\", b = 'quoted \"strings\"', \
c = `list:\\n1. \${a}\\n2. \${b}\\n\${ /* comments */ ` - len: \${a.length + b.length}`}\\n ---`;  \
/* . */  let i = 2, n = 12 / 4 * (7/i); // last coment.  !";
//               misdetection -> ^^^^^

rmc(input, true, true);
// > Regex SyntaxError: [/ 4 * (7/i]
// > const a = "this is apple! \n", b = 'quoted "strings"', c = `list:\n1. ${a}\n2. ${b}\n${ /* comments */ ` - len: ${a.length + b.length}`}\n ---`;    let i = 2, n = 12 / 4 * (7/i);
```

> #### Case: remove comments from file contents

```js
const rmc = require("rm-cstyle-cmts");
const fs = require("fs");

const name = "samples/es6";
const source = fs.readFileSync(`./${name}.js`, 'utf-8');

console.info(" ----------- before contents ----------");
console.log(source);

// remove blank line and whitespaces.
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

> es6.js 4,509 bytes,  
> with remove blank line and whitespaces and without (at node v12.2.0, intel core i5-2500k 3.3ghz

```ts
> rm-cstyle-cmts@1.6.3 bench
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 -ol 10 | node ./bin/bench/ -p

v12.2.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: 1.6.3, case: { source: es6.js@4,509 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
✔ order => version: 1.6.3, case: { source: es6.js@4,509 bytes, remove_blanks=false }, outerloop=10, innerloop=2000

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 53.073341%
[version: 1.6.3, case: { source: es6.js@4,509 bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 142.834800 ms, total average for each run: 0.071417 ms
}
[version: 1.6.3, case: { source: es6.js@4,509 bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 75.807200 ms, total average for each run: 0.037904 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000', ol: '10' }
avoidMinified: 8000
 --------------- start benchmark (remove blanks) ---------------
version: 1.6.3, case: { source: es6.js@4,509 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=true, loop=2000: 158.195ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 141.063ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 139.932ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 142.496ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 140.510ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 139.869ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 139.568ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 140.185ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 145.671ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 140.859ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: 1.6.3, case: { source: es6.js@4,509 bytes, remove_blanks=false }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=false, loop=2000: 76.184ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 75.679ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 76.685ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 75.366ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 75.282ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 75.228ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 76.572ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 74.977ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 75.410ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 76.689ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```

> at node v8.4.0
```ts
> rm-cstyle-cmts@1.6.3 bench
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 -ol 10 | node ./bin/bench/ -p

v8.4.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: 1.6.3, case: { source: es6.js@4,509 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
✔ order => version: 1.6.3, case: { source: es6.js@4,509 bytes, remove_blanks=false }, outerloop=10, innerloop=2000

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 65.375017%
[version: 1.6.3, case: { source: es6.js@4,509 bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 202.428400 ms, total average for each run: 0.101214 ms
}
[version: 1.6.3, case: { source: es6.js@4,509 bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 132.337600 ms, total average for each run: 0.066169 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000', ol: '10' }
avoidMinified: 8000
 --------------- start benchmark (remove blanks) ---------------
version: 1.6.3, case: { source: es6.js@4,509 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=true, loop=2000: 213.710ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 197.377ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 200.507ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 207.434ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 211.632ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 197.987ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 196.946ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 202.616ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 197.107ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 198.968ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: 1.6.3, case: { source: es6.js@4,509 bytes, remove_blanks=false }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=false, loop=2000: 135.927ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 132.548ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 134.264ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.258ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 133.931ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.831ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 133.620ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.504ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.266ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 129.227ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-false.js written...
es6-rm_ws-true.js written...
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

(?<!<)               # avoidance: jsx or tsx start tag, available on node v8.10
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
(?![?*+\/\[\\])      # not meta character [?*+/[\] @anchor ...

```
as comment on samples/es6.js with descriptive explanation,

please look there.
