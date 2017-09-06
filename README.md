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

* [ ] `BUG:` #cannot keep blank line at nested es6 template string, `rm_blank_line_n_ws` flag is `true`. (at src/ts/index.ts
* [ ] `BUG:` #cannot remove last new line char. (at src/ts/index.ts
* [X] ~~*`FIXED:`? #cannot beyond regex. (at src/ts/index.ts*~~


## usage

```js
var rmc = require("rm-cstyle-cmts");
var fs = require("fs");

var name = "sample-cfg";
var extension = "json";
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
  test_text: `:Key Binding:${ 234 }}
}
about                   [alt+A]

:On comment:\`\  \"\`\"\\

------------------------------[ X ]`,
  test_textQ: ":Key Binding:\
\
about                   [alt+A]\
\
:On comment:\`\  \"\`\"\
\
------------------------------[ X ]",

     ok: "",
      
  test_textS: ':Key Binding:\
\
about                   [alt+A]\
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
> samples/es6-rm_ws-true.js
```javascript
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
  test_text: `:Key Binding:${ 234 }}
}
about                   [alt+A]

:On comment:\`\  \"\`\"\\

------------------------------[ X ]`,
  test_textQ: ":Key Binding:\
\
about                   [alt+A]\
\
:On comment:\`\  \"\`\"\
\
------------------------------[ X ]",
     ok: "",
  test_textS: ':Key Binding:\
\
about                   [alt+A]\
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
>node ./bin/bench/ -f samples/es6.js | node ./bin/bench/ -p

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v1.4.0, {case es6.js, size: 1801 bytes}, remove_blanks=true
✔ order => version: v1.4.0, {case es6.js, size: 1801 bytes}, remove_blanks=false

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 59.092508%
[version: v1.4.0, {case es6.js, size: 1801 bytes}, remove_blanks=true] {
    average of entries: 41.224600 ms, total average for each run: 0.041225 ms
}
[version: v1.4.0, {case es6.js, size: 1801 bytes}, remove_blanks=false] {
    average of entries: 24.360650 ms, total average for each run: 0.024361 ms
}


↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓
 { f: 'samples/es6.js' }
 --------------- start benchmark (!remove blanks) ---------------
version: v1.4.0, {case es6.js, size: 1801 bytes}, remove_blanks=true
es6.js, rm_blank_line_n_ws=true, loop=1000: 53.287ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 41.491ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 42.262ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 41.700ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 41.233ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 41.830ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 40.376ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 40.610ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 40.073ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 40.069ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 40.612ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 40.131ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 40.028ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 40.238ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 40.304ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 40.379ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 40.328ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 39.921ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 39.826ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 39.794ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (remove blanks) ---------------
version: v1.4.0, {case es6.js, size: 1801 bytes}, remove_blanks=false
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.443ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.365ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.444ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.296ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.308ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.352ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.349ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.358ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.364ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.350ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.314ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.301ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.305ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.317ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.625ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.329ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.369ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.334ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.344ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 24.346ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```

> at node v5.12.0
```c
>node ./bin/bench/ -f samples/es6.js | node ./bin/bench/ -p

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: v1.4.0, {case es6.js, size: 1801 bytes}, remove_blanks=true
✔ order => version: v1.4.0, {case es6.js, size: 1801 bytes}, remove_blanks=false

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 70.551297%
[version: v1.4.0, {case es6.js, size: 1801 bytes}, remove_blanks=true] {
    average of entries: 82.043850 ms, total average for each run: 0.082044 ms
}
[version: v1.4.0, {case es6.js, size: 1801 bytes}, remove_blanks=false] {
    average of entries: 57.883000 ms, total average for each run: 0.057883 ms
}


↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓
 { f: 'samples/es6.js' }
 --------------- start benchmark (!remove blanks) ---------------
version: v1.4.0, {case es6.js, size: 1801 bytes}, remove_blanks=true
es6.js, rm_blank_line_n_ws=true, loop=1000: 90.197ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 82.381ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 82.811ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 83.426ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.212ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.110ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.324ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.930ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.302ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 82.244ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.560ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.192ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.288ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.684ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.207ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.291ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.052ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.326ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.196ms
es6.js, rm_blank_line_n_ws=true, loop=1000: 81.144ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (remove blanks) ---------------
version: v1.4.0, {case es6.js, size: 1801 bytes}, remove_blanks=false
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.890ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.612ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 58.090ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.868ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.503ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.245ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.574ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.215ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.192ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.228ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.221ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.323ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.198ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.222ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.190ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.216ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.205ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 57.311ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 60.103ms
es6.js, rm_blank_line_n_ws=false, loop=1000: 64.254ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```
