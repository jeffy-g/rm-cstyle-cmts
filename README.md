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
     * @param {boolean} is_multi_t use multi process?, default is "false".
     */
    (source: string, rm_blank_line_n_ws?: boolean, is_multi_t?: boolean): string;

    /** package version */
    readonly version: string;
}

module.exports = Object.defineProperties(...) as IRemoveCStyleCommentsTypeSig;
```

## BUGS

* [ ] `BUG:` #cannot keep blank line at nested es6 template string, (`rm_blank_line_n_ws=true`, at src/ts/index.ts
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
/**
 * triple nested es6 template string.
 */
const test_text = `:Key Binding:${ 234 }}
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
*/
;

// coments line.!!-+*

/**
* block comment.
*/// test
const $3 = { keyCode: $1, key: "$5\"this is\
test" };

const gm = 234;
  ; ;; ;

var i = 100 / 10 * 123.555/gm; // comment line

var HTMLIZE_TEXT = {
  title: `/anything/g`,
  description: '--- nothing ---',
  qre: "/(<button)\\s+([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*(>.*<\\/button>)/g.toString()",
  re: /(<button)\s+([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*(>.*<\/button>)/g.toString(),

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
\
------------------------------[ X ]",

     ok: "",
      
  test_textS: ':Key Binding:\
\
:On comment:\`\ \' \"\`\"\
\
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

;
  

```
#### after
> samples/es6-after.js
```javascript
const test_text = `:Key Binding:${ 234 }}
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
;
const $3 = { keyCode: $1, key: "$5\"this is\
test" };
const gm = 234;
  ; ;; ;
var i = 100 / 10 * 123.555/gm;
var HTMLIZE_TEXT = {
  title: `/anything/g`,
  description: '--- nothing ---',
  qre: "/(<button)\\s+([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*(>.*<\\/button>)/g.toString()",
  re: /(<button)\s+([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*(>.*<\/button>)/g.toString(),
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
\
------------------------------[ X ]",
     ok: "",
  test_textS: ':Key Binding:\
\
:On comment:\`\ \' \"\`\"\
\
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

> es6.js 2,714 bytes,  
> with remove blank line and whitespaces and without (at node v8.4.0, intel core i5-2500k 3.3ghz

```ts
> rm-cstyle-cmts@1.4.3 test
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 | node ./bin/bench/ -p

v8.4.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v1.4.3, {case es6.js, size: 2,714 bytes}, remove_blanks=true
✔ order => version: v1.4.3, {case es6.js, size: 2,714 bytes}, remove_blanks=false

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 50.987697%
[version: v1.4.3, {case es6.js, size: 2,714 bytes}, remove_blanks=true] {
    average of entries: 139.301350 ms, total average for each run: 0.069651 ms
}
[version: v1.4.3, {case es6.js, size: 2,714 bytes}, remove_blanks=false] {
    average of entries: 71.026550 ms, total average for each run: 0.035513 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000' }
 --------------- start benchmark (remove blanks) ---------------
version: v1.4.3, {case es6.js, size: 2,714 bytes}, remove_blanks=true
es6.js, rm_blank_line_n_ws=true, loop=2000: 150.417ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 138.886ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 139.428ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.820ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 138.526ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 138.676ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.938ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.549ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.394ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.633ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 138.217ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 138.852ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 138.236ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 136.881ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 136.901ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.134ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.805ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 136.907ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.846ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 152.981ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: v1.4.3, {case es6.js, size: 2,714 bytes}, remove_blanks=false
es6.js, rm_blank_line_n_ws=false, loop=2000: 78.835ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 72.273ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.232ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.075ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.183ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.116ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.763ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.495ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.903ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.914ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.003ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.617ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.343ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 71.593ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.745ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.092ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 75.527ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.208ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.086ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.528ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```

> at node v5.12.0
```ts
> rm-cstyle-cmts@1.4.3 test
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 | node ./bin/bench/ -p

v5.12.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v1.4.3, {case es6.js, size: 2,714 bytes}, remove_blanks=true
✔ order => version: v1.4.3, {case es6.js, size: 2,714 bytes}, remove_blanks=false

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 65.084679%
[version: v1.4.3, {case es6.js, size: 2,714 bytes}, remove_blanks=true] {
    average of entries: 205.273350 ms, total average for each run: 0.102637 ms
}
[version: v1.4.3, {case es6.js, size: 2,714 bytes}, remove_blanks=false] {
    average of entries: 133.601500 ms, total average for each run: 0.066801 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000' }
 --------------- start benchmark (remove blanks) ---------------
version: v1.4.3, {case es6.js, size: 2,714 bytes}, remove_blanks=true
es6.js, rm_blank_line_n_ws=true, loop=2000: 209.381ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.097ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 220.858ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 216.432ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 202.636ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 202.185ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 204.050ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 204.240ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.416ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 202.678ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.311ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.014ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.308ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 204.045ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.097ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 204.542ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 204.311ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 204.427ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.414ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.025ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: v1.4.3, {case es6.js, size: 2,714 bytes}, remove_blanks=false
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.096ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.427ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.322ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.550ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.543ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.920ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.694ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 132.368ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.817ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.538ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.587ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.203ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 152.512ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 153.072ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 134.751ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.534ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 132.200ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.115ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.118ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.663ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```
