//
// DEVNOTE: 2020/1/8
//
// I've always been concerned about the cost of building a regex literal and
// a new instance of a regex(new RegExp (...)) (I knew that the new RegExp was expensive
//
// In this issue, I wrote a simple test code and executed it in order to renew awareness about this concern.
//
const OUTER_REPEAT = 4;
const REPEAT = 1000000;
function regexLiteralVsNewRegex(innerRepeat = REPEAT) {

    console.log("test case literal x %d", innerRepeat);
    for (let x = OUTER_REPEAT; x--;) {
        let i = innerRepeat;
        console.time("test");
        while (i--) {
            /\n\s+(?=\n)|\s+(?=\n)|`|"(?:[^\\"]+|\\[\s\S])*"|'(?:[^\\']+|\\[\s\S])*'|\//g.test("'text'");
        }
        console.timeEnd("test");
    }

    console.log("test case new regex instance x %d", innerRepeat);
    for (let x = OUTER_REPEAT; x--;) {
        let i = innerRepeat;
        console.time("test");
        while (i--) {
            new RegExp(`\\n\\s+(?=\\n)|\\s+(?=\\n)|\`|"(?:[^\\\\"]+|\\\\[\\s\\S])*"|'(?:[^\\\\']+|\\\\[\\s\\S])*'|\\/`, "g").test("'text'");
        }
        console.timeEnd("test");
    }
}
/*
[node v13.4.0]
> regexLiteralVsNewRegex();
test case literal x 1000000
test: 47.177ms
test: 40.623ms
test: 37.012ms
test: 36.862ms
test case new regex instance x 1000000
test: 358.043ms
test: 358.057ms
test: 357.271ms
test: 355.504ms

[Google Chrome: 79.0.3945.117（Official Build） （64-bit）]
regexLiteralVsNewRegex();
test: 55.455078125ms
test: 43.53125ms
test: 39.3779296875ms
test: 38.83984375ms
test case new regex instance x 1000000
test: 211.5498046875ms
test: 212.908203125ms
test: 209.93212890625ms
test: 210.4599609375ms
*/
