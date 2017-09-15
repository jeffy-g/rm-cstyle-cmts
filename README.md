[![Build Status](https://travis-ci.org/jeffy-g/rm-cstyle-cmts.svg?branch=master)](https://travis-ci.org/jeffy-g/rm-cstyle-cmts) [![npm version](https://badge.fury.io/js/rm-cstyle-cmts.svg)](https://badge.fury.io/js/rm-cstyle-cmts) [![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)](https://www.apache.org/licenses/LICENSE-2.0)
# remove cstyle comments

remove c style comments from text file(javascript source, json file etc...

## npm package name: rm-cstyle-cmts

> ### module definition
```ts
/**
 * remove c style comments interface.
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
     * @param {boolean} rm_blank_line_n_ws remove black line and whitespaces, default is "true".
     */
    (source: string, rm_blank_line_n_ws?: boolean): string;
}
/**
 * remove c style comments interface.
 */
interface IRemoveCStyleCommentsModule extends IRemoveCStyleCommentsTypeSig {
    /** package version */
    readonly version: string;
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

```js
var rmc = require("rm-cstyle-cmts");
var fs = require("fs");

var name = "samples/es6";
var extension = "js";
var source = fs.readFileSync(`./${name}.${extension}`, 'utf-8');

console.info(" ----------- before contents ----------");
console.log(source);

// remove blank line and whitespaces.
var after = rmc(source/*, true*/);
console.info(" ----------- after contents -----------");
console.log(after);

fs.writeFile(`./${name}-after.${extension}`, after, 'utf-8', function() {
    console.log("data written...");
});

```

## then

#### before
> samples/es6.js
```javascript
  
var i = {} / 10; // -> NaN

{ i = "aaa" } /aaa/.test(i);
var i = 10000 / 111.77; /[/*]/.test(i); // */

/* comments */var i = 10000 / 111.77; /\][/*]/.test(i); // */

[/\s*\(\?#.*\)\/[/*///]\s*$|#\s.*$|\s+/];


let gg = 10;
var re = 10000 / 111.77*gg /gg;;;;  ////// comments...
//             ^-------------^ <- this case is match. but, not regexp literal
//                 skip to -->^
//            line comment start -->^ <- parse by class SlashVisitor

// in this case, correctly detects.
const re4 = /\s*\(\?#.*\)\/[/*///]\s*$|#\s.*$|\s+/ /* comments...*/

let ok2 = 12.2 / 33 * .9 // "comments"...*/
//             ^ <- parse by class SlashVisitor
//                        ^---------------^ <- will recognize as regexp literal ...
//                       ^ however, since its actually a line comment, deleted from this position to the end of the line.

let ok3 = 12.2 / 33 * .9/* comments...*/
//             ^ <- parse by class SlashVisitor, in this case it can be correctly judged that it is not regexp literal.
//                      ^ <- parse by class SlashVisitor, Its recognized and deleted as multiline comment.

// ↓ parse by class SlashVisitor
/**
 * triple nested es6 template string.
 */
const test_text = `:Key Binding:${ 234 }}
//                ^  <- parse by class BackQuoteVistor
}
about                   [alt+A]
    ${
    "nest-1:" + `:Key Binding:${ 234 }}
    }

        ${

            // comment line...
            "nest-2:" + `:Key Binding:${ `let abc = ${
                Boolean("")
            }` }}
            }

                // comment line in backquote
                ${

                    /**
                    * triple nested es6 template string.
                    */

                    "nest-3:" + `:Key Binding:${ 234 }}
                    }

                    // comment line in backquote
                    :On comment:\`\  \"\`\"\\

                    ------------------------------[ X ]`
                }
            :On comment:\`\  \"\`\"\\

            ------------------------------[ X ]`
        }
    :On comment:\`\  \"\`\"\\

    ------------------------------[ X ]`

    // comment line...
    }
:On comment:\`\  \"\`\"\\

------------------------------[ X ]`;
  
     
     ;
/**
* block comment.
*/// test
const $3 = { keyCode: $1, key: "$5\"this is\
                               ^  <- parse by class QuoteVistor\
test" };

const gm = 234;
  ; ;; ;

var i = 100 / 10 * 123.555/gm; // comment line
//          ^  <- parse by class SlashVisitor

var HTMLIZE_TEXT = {
  title: `/anything/g`,
  //     ^  <- parse by class BackQuoteVistor
  description: '--- nothing ---',
  //           ^  <- parse by class QuoteVistor
  qre: "/(<button)\\s+([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*(>.*<\\/button>)/g.toString()",
//     ^  <- parse by class QuoteVistor
  re: /(<button)\s+([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:=`[^`]+`)?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*(>.*<\/button>)/g.toString(),
//    ^  <- parse by class SlashVisitor. this regexp literal although contains quote character, since it is correctly recognized as regexp literal, can avoid parse by quotevisitor. 

  ere: `(^:[\\w ]+:\$)|           (?#heading text)
(^[\\w ]+)(\\[[\\w\\+]+\\])| (?#text item)
(?:([\\-]+)(\\[ X \\]))    (?#emulate close button)`,
  
  flags: "",
  test_text: `:Key Binding:{}
}

:On comment:\`\  \"\`\"\\
------------------------------[ X ]`,
  test_textQ: ":Key Binding:\
\
:On comment:\`\  \"\`\"\
------------------------------[ X ]",
  test_textS: ':Key Binding:\
\
:On comment:\`\ \' \"\`\"\
------------------------------[ X ]',
  timestamp: 1499535241972
};
         
let name = "apple";           
// comment line.       
const templete = `function ${name}() {
   // comment line.
   var some = ${
       // comment line...
       `12.5 / 50 * 100,

       // might be a very important comment line.
       things = "${name}",
       obj={}`

   };
   /**
    * multi line comment...
    */
   return true;
}
`;     

; /*
  

```
#### after
> samples/es6-after.js
```javascript
var i = {} / 10;
{ i = "aaa" } /aaa/.test(i);
var i = 10000 / 111.77; /[/*]/.test(i);
var i = 10000 / 111.77; /\][/*]/.test(i);
[/\s*\(\?#.*\)\/[/*///]\s*$|#\s.*$|\s+/];
let gg = 10;
var re = 10000 / 111.77*gg /gg;;;;
const re4 = /\s*\(\?#.*\)\/[/*///]\s*$|#\s.*$|\s+/
let ok2 = 12.2 / 33 * .9
let ok3 = 12.2 / 33 * .9
const test_text = `:Key Binding:${ 234 }}
//                ^  <- parse by class BackQuoteVistor
}
about                   [alt+A]
    ${
    "nest-1:" + `:Key Binding:${ 234 }}
    }
        ${
            // comment line...
            "nest-2:" + `:Key Binding:${ `let abc = ${
                Boolean("")
            }` }}
            }

                // comment line in backquote
                ${

                    /**
                    * triple nested es6 template string.
                    */

                    "nest-3:" + `:Key Binding:${ 234 }}
                    }
                    // comment line in backquote
                    :On comment:\`\  \"\`\"\\

                    ------------------------------[ X ]`
                }
            :On comment:\`\  \"\`\"\\

            ------------------------------[ X ]`
        }
    :On comment:\`\  \"\`\"\\

    ------------------------------[ X ]`
    // comment line...
    }
:On comment:\`\  \"\`\"\\

------------------------------[ X ]`;
     ;
const $3 = { keyCode: $1, key: "$5\"this is\
                               ^  <- parse by class QuoteVistor\
test" };
const gm = 234;
  ; ;; ;
var i = 100 / 10 * 123.555/gm;
var HTMLIZE_TEXT = {
  title: `/anything/g`,
  description: '--- nothing ---',
  qre: "/(<button)\\s+([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*(>.*<\\/button>)/g.toString()",
  re: /(<button)\s+([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:=`[^`]+`)?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*(>.*<\/button>)/g.toString(),
  ere: `(^:[\\w ]+:\$)|           (?#heading text)
(^[\\w ]+)(\\[[\\w\\+]+\\])| (?#text item)
(?:([\\-]+)(\\[ X \\]))    (?#emulate close button)`,
  flags: "",
  test_text: `:Key Binding:{}
}

:On comment:\`\  \"\`\"\\
------------------------------[ X ]`,
  test_textQ: ":Key Binding:\
\
:On comment:\`\  \"\`\"\
------------------------------[ X ]",
  test_textS: ':Key Binding:\
\
:On comment:\`\ \' \"\`\"\
------------------------------[ X ]',
  timestamp: 1499535241972
};
let name = "apple";
const templete = `function ${name}() {
   // comment line.
   var some = ${
       // comment line...
       `12.5 / 50 * 100,
       // might be a very important comment line.
       things = "${name}",
       obj={}`

   };
   /**
    * multi line comment...
    */
   return true;
}
`;
;
```
## performance

> es6.js 4,435 bytes,  
> with remove blank line and whitespaces and without (at node v8.5.0, intel core i5-2500k 3.3ghz

```ts
> rm-cstyle-cmts@1.4.15 test
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 -ol 10 | node ./bin/bench/ -p

v8.5.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: 1.4.15, case: { source: es6.js@4,435bytes, remove_blanks=true }, outerloop=10, innerloop=2000
✔ order => version: 1.4.15, case: { source: es6.js@4,435bytes, remove_blanks=false }, outerloop=10, innerloop=2000

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 58.245896%
[version: 1.4.15, case: { source: es6.js@4,435bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 163.954900 ms, total average for each run: 0.081977 ms
}
[version: 1.4.15, case: { source: es6.js@4,435bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 95.497000 ms, total average for each run: 0.047749 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000', ol: '10' }
 --------------- start benchmark (remove blanks) ---------------
version: 1.4.15, case: { source: es6.js@4,435bytes, remove_blanks=true }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=true, loop=2000: 189.316ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 174.622ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 160.212ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 161.260ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 159.782ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 159.627ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 158.511ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 158.476ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 158.712ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 159.031ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: 1.4.15, case: { source: es6.js@4,435bytes, remove_blanks=false }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=false, loop=2000: 95.552ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 94.780ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 95.236ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 95.821ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 94.998ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 95.427ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 95.145ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 94.777ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 96.556ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 96.678ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```

> at node v5.12.0
```ts
> rm-cstyle-cmts@1.4.15 test
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 -ol 10 | node ./bin/bench/ -p

v5.12.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: 1.4.15, case: { source: es6.js@4,435bytes, remove_blanks=true }, outerloop=10, innerloop=2000
✔ order => version: 1.4.15, case: { source: es6.js@4,435bytes, remove_blanks=false }, outerloop=10, innerloop=2000

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 73.627869%
[version: 1.4.15, case: { source: es6.js@4,435bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 269.680900 ms, total average for each run: 0.134840 ms
}
[version: 1.4.15, case: { source: es6.js@4,435bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 198.560300 ms, total average for each run: 0.099280 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000', ol: '10' }
 --------------- start benchmark (remove blanks) ---------------
version: 1.4.15, case: { source: es6.js@4,435bytes, remove_blanks=true }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=true, loop=2000: 275.905ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 276.383ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 287.717ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 266.715ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 264.907ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 264.668ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 266.234ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 264.031ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 265.803ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 264.446ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: 1.4.15, case: { source: es6.js@4,435bytes, remove_blanks=false }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=false, loop=2000: 197.376ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 196.373ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 198.471ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 198.302ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 199.234ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 199.518ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 198.117ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 198.998ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 199.356ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 199.858ms
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

```php

\/                   # regexp literal start@delimiter
  (?![?*+\/])        # not meta character "?*+/" @anchor
  (?:                # start non-capturing group $1
    \\[\s\S]|        # escaped any character, or
    \[               # class set start
      (?:            # non-capturing group $2
        \\[\s\S]|    # escaped any character, or
        [^\]\r\n\\]  # without class set end, newline, backslash
      )*             # end non-capturing group $2 (q: 0 or more
    \]|              # class set end, or
    [^\/\r\n\\]      # without slash, newline, backslash
  )+                 # end non-capturing group $1 (q: 1 or more
\/                   # regexp literal end@delimiter
(?:                  # start non-capturing group $3
  [gimuy]+\b|        # validate regex flags, but this pattern is imcomplete
)                    # end non-capturing group $3
(?![?*+\/\[\\])      # not meta character [?*+/[\] @anchor ...

```
as comment on samples/es6.js with descriptive explanation,

please look there.
