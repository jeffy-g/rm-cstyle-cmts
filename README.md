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
> rm-cstyle-cmts@1.4.4 test
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 | node ./bin/bench/ -p

v8.4.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v1.4.4, {case es6.js, size: 2,714 bytes}, remove_blanks=true
✔ order => version: v1.4.4, {case es6.js, size: 2,714 bytes}, remove_blanks=false

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 51.125423%
[version: v1.4.4, {case es6.js, size: 2,714 bytes}, remove_blanks=true] {
    average of entries: 138.479050 ms, total average for each run: 0.069240 ms
}
[version: v1.4.4, {case es6.js, size: 2,714 bytes}, remove_blanks=false] {
    average of entries: 70.798000 ms, total average for each run: 0.035399 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000' }
 --------------- start benchmark (remove blanks) ---------------
version: v1.4.4, {case es6.js, size: 2,714 bytes}, remove_blanks=true
es6.js, rm_blank_line_n_ws=true, loop=2000: 150.712ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 139.089ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 138.456ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.583ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.967ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.237ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.083ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.942ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.740ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.235ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 137.044ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 136.506ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 136.161ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 136.424ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 136.243ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 135.850ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 136.025ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 136.542ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 136.920ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 150.822ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: v1.4.4, {case es6.js, size: 2,714 bytes}, remove_blanks=false
es6.js, rm_blank_line_n_ws=false, loop=2000: 77.544ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 72.785ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.908ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.320ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.889ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.805ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.748ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.169ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.177ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.982ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.992ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.733ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.935ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.875ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.818ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.210ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 73.423ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 71.957ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.720ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 69.970ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```

> at node v5.12.0
```ts
> rm-cstyle-cmts@1.4.4 test
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 | node ./bin/bench/ -p

v5.12.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v1.4.4, {case es6.js, size: 2,714 bytes}, remove_blanks=true
✔ order => version: v1.4.4, {case es6.js, size: 2,714 bytes}, remove_blanks=false

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 64.386151%
[version: v1.4.4, {case es6.js, size: 2,714 bytes}, remove_blanks=true] {
    average of entries: 207.031400 ms, total average for each run: 0.103516 ms
}
[version: v1.4.4, {case es6.js, size: 2,714 bytes}, remove_blanks=false] {
    average of entries: 133.299550 ms, total average for each run: 0.066650 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000' }
 --------------- start benchmark (remove blanks) ---------------
version: v1.4.4, {case es6.js, size: 2,714 bytes}, remove_blanks=true
es6.js, rm_blank_line_n_ws=true, loop=2000: 213.821ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 209.183ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 217.352ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 216.861ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 207.677ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 205.465ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 205.616ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 206.469ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 206.881ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 206.275ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 206.492ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 205.763ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 206.129ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.775ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 204.309ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.819ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.240ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 204.620ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.630ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 203.251ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: v1.4.4, {case es6.js, size: 2,714 bytes}, remove_blanks=false
es6.js, rm_blank_line_n_ws=false, loop=2000: 132.983ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 132.812ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 133.698ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 132.945ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 133.320ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 133.073ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 133.296ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 134.052ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 133.549ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 132.564ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 132.787ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 133.189ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 140.683ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 141.220ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.964ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.158ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.398ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.809ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.675ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.816ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```
