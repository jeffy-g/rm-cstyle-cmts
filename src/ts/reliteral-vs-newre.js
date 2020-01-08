//
// DEVNOTE: 2020/1/8
//
// I've always been concerned about the cost of building a regex literal and
// a new instance of a regex(new RegExp (...)) (I knew that the new RegExp was expensive
//
// In this issue, I wrote a simple test code and executed it in order to renew awareness about this concern.
//
const OUTER_REPEAT = 4;
const REPEAT = 10000000;
function regexLiteralVsNewRegex(innerRepeat = REPEAT) {

    console.log("test case literal x %d", innerRepeat);
    for (let x = OUTER_REPEAT; x--;) {
        let i = innerRepeat;
        console.time("test");
        while (i--) {
            /\n\s+(?=\n)|\s+(?=\n)|`|"(?:[^\\"]+|\\[\s\S])*"|'(?:[^\\']+|\\[\s\S])*'|\//g;
        }
        console.timeEnd("test");
    }

    console.log("test case new regex instance x %d", innerRepeat);
    for (let x = OUTER_REPEAT; x--;) {
        let i = innerRepeat;
        console.time("test");
        while (i--) {
            new RegExp(`\\n\\s+(?=\\n)|\\s+(?=\\n)|\`|"(?:[^\\\\"]+|\\\\[\\s\\S])*"|'(?:[^\\\\']+|\\\\[\\s\\S])*'|\\/`, "g");
        }
        console.timeEnd("test");
    }
}
/*
[node v13.4.0]
> regexLiteralVsNewRegex();
test case literal x 10000000
test: 11.999ms
test: 12.769ms
test: 8.85ms
test: 8.06ms
test case new regex instance x 10000000
test: 4.712s
test: 4.814s
test: 4.731s
test: 4.698s

[Chromium: 79.0.3945.88（Official Build） (64-bit)]
regexLiteralVsNewRegex();
test case literal x 10000000
test: 12.472900390625ms
test: 11.4501953125ms
test: 6.94482421875ms
test: 6.94384765625ms
test case new regex instance x 10000000
test: 3828.946044921875ms
test: 3827.702880859375ms
test: 3817.5830078125ms
test: 3899.433837890625ms
*/
