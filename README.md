# remove cstyle comments
remove c style comments from text file(javascript source, json file etc...

## npm package name: rm-cstyle-cmts

### function signature
```ts
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
declare function removeCStyleComments(source: string, rm_blank_line_n_ws?: boolean, is_multi_t?: boolean): string;
```

## BUGS

* [ ] `BUG:` #cannot keep blank line at nested es6 template string, (`rm_blank_line_n_ws=true`, at src/ts/index.ts
* [ ] `BUG:` In some cases, a newline character remains at the beginning or the end of the file. (`rm_blank_line_n_ws=true`, at src/ts/index.ts
* [X] ~~*`BUG:` #cannot remove last new line char. (at src/ts/index.ts*~~
* [X] ~~*`FIXED:`? #cannot beyond regex. (at src/ts/index.ts*~~


## usage

```js
var rmc = require("rm-cstyle-cmts");
var fs = require("fs");

var name = "samples/es6";
var extension = "js";
var json = fs.readFileSync(`./${name}.${extension}`, 'utf-8');

console.info(" ----------- before contents ----------");
console.log(json);

// remove blank line and whitespaces.
var after = rmc(json/*, true*/);
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

> es6.js 1,801 bytes,  
> with remove blank line and whitespaces and without (at node v8.4.0, intel core i5-2500k 3.3ghz

```c
>node ./bin/bench/ -f samples/es6.js -l 2000 | node ./bin/bench/ -p

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v1.4.2, {case es6.js, size: 2714 bytes}, remove_blanks=true
✔ order => version: v1.4.2, {case es6.js, size: 2714 bytes}, remove_blanks=false

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 55.079904%
[version: v1.4.2, {case es6.js, size: 2714 bytes}, remove_blanks=true] {
    average of entries: 133.119150 ms, total average for each run: 0.066560 ms
}
[version: v1.4.2, {case es6.js, size: 2714 bytes}, remove_blanks=false] {
    average of entries: 73.321900 ms, total average for each run: 0.036661 ms
}


↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓
 { f: 'samples/es6.js', l: '2000' }
 --------------- start benchmark (!remove blanks) ---------------
version: v1.4.2, {case es6.js, size: 2714 bytes}, remove_blanks=true
es6.js, rm_blank_line_n_ws=true, loop=2000: 148.784ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 139.041ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 135.091ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 131.935ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 131.355ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 132.518ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 132.011ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 132.283ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 132.117ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 132.002ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 131.489ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 131.131ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 131.761ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 131.730ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 132.041ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 131.296ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 131.764ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 131.511ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 131.624ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 130.899ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (remove blanks) ---------------
version: v1.4.2, {case es6.js, size: 2714 bytes}, remove_blanks=false
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.983ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 74.215ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 71.036ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.672ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 71.225ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.936ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 72.421ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 71.009ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.871ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.824ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.883ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 71.484ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 71.326ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.883ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 73.177ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 87.717ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 75.994ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 88.697ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 70.945ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 71.140ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```

> at node v5.12.0
```c
>node ./bin/bench/ -f samples/es6.js -l 2000 | node ./bin/bench/ -p

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v1.4.2, {case es6.js, size: 2714 bytes}, remove_blanks=true
✔ order => version: v1.4.2, {case es6.js, size: 2714 bytes}, remove_blanks=false

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 66.121188%
[version: v1.4.2, {case es6.js, size: 2714 bytes}, remove_blanks=true] {
    average of entries: 198.889650 ms, total average for each run: 0.099445 ms
}
[version: v1.4.2, {case es6.js, size: 2714 bytes}, remove_blanks=false] {
    average of entries: 131.508200 ms, total average for each run: 0.065754 ms
}


↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓
 { f: 'samples/es6.js', l: '2000' }
 --------------- start benchmark (!remove blanks) ---------------
version: v1.4.2, {case es6.js, size: 2714 bytes}, remove_blanks=true
es6.js, rm_blank_line_n_ws=true, loop=2000: 210.695ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 206.875ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 200.256ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 199.519ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 198.351ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 199.373ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 198.493ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 198.167ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 199.477ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 198.096ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 199.769ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 197.860ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 199.501ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 196.753ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 195.600ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 195.244ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 196.265ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 196.458ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 195.686ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 195.355ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (remove blanks) ---------------
version: v1.4.2, {case es6.js, size: 2714 bytes}, remove_blanks=false
es6.js, rm_blank_line_n_ws=false, loop=2000: 129.679ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.967ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.974ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 129.689ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.163ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 129.773ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.076ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.226ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 141.830ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 146.576ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.332ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 131.754ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 129.793ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 129.844ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 129.110ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 129.819ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 129.611ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 129.852ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 130.299ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 129.797ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```
