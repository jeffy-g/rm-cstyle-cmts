/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2017 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/

// for String.replace
declare type AverageReplacer = (matchBody: string, loop: string, ms: string, tag: string, deadline: string, index?: number) => string;


interface IBenchmarkResult {
    loop: number;
    ms: number;
    average: number;
}

// entry caption text.
const explain: string = "average for each run";

/**
 * extended contractor pattern?
 */
const Contractor = {
    entries: {} as { [x: string]: IBenchmarkResult[] },
    currentTag: "",

    order(tag: string): void {
        !this.entries[tag] && (this.entries[tag] = []);
        this.currentTag = tag;
    },
    record(sloop: string, sms: string): number {
        const loop = +sloop, ms = +sms;
        /** average for each run */
        const average = (ms / loop);
        // record loop count, time spent, average.
        this.entries[this.currentTag].push({
            loop, ms, average
        });
        return average;
    },

    deadline(): void {
        /** list of average per run */
        const lapr: number[] = [];
        /** tag collection */
        const tags = Object.keys(this.entries), that = this;

        let msg = "";
        console.log("");
        tags.forEach(tag => {
            let averageSum = 0, tspentSum = 0;
            const size = that.entries[tag].length as number;
            that.entries[tag].forEach(result => {
                tspentSum += result.ms;
                averageSum += result.average;
            });
            // average for every run.
            const eachRun = averageSum / size;
            lapr.push(eachRun);
            // format message.
            msg += `[${tag}] {
    average of entries: ${(tspentSum / size).toFixed(6)} ms, total ${explain}: ${eachRun.toFixed(6)} ms
}\n`;
        });

        const min = Math.min(lapr[0], lapr[1]);
        const max = Math.max(lapr[0], lapr[1]);
        // ✈: \u2708
        console.log(`${"\u2708  ".repeat(8)}performance ratio: %s\%`, (min / max * 100).toFixed(6));
        // output result message.
        console.log(msg);
    }
};

/**
 * set true to "showlogPerEntry" param if need.
 * @param showlogPerEntry
 */
const emitReplacer = (showlogPerEntry: boolean): AverageReplacer => {
    const contractor = Contractor;
    // return replacement body.
    return (all, loop, ms, tag, deadline/* , index */) => {
        if (tag) {
            // ✔ :\u2714
            contractor.order(tag), console.log(`\u2714 order => ${tag}`);
        } else if (loop) {
            const average = contractor.record(loop, ms);
            // if want per entiry.
            showlogPerEntry && console.log(
                `loop: ${loop}, ${explain}: %s ms`, average.toFixed(6)
            );
        } else if (deadline) {
            contractor.deadline();
        }
        // NOTE: always return match content.
        return all;
    };
};

/** regex for performance log. */
// FIXED: there is no floting value in the result of "console.time" at node v4
const regex = /loop=(\d+):\s(\d+(?:\.\d+)?)ms|(version:\s.+)|(--done--)/g;

/**
 * Parse the log of inputs using regexp and write the mean to console.
 *
 * @param inputs the performance log text.
 * @param showlogPerEntry set true to "showlogPerEntry" param if need. default false
 */
export const average = (inputs: string, showlogPerEntry: boolean = false): string => {
    return inputs.replace(regex, emitReplacer(showlogPerEntry));
};
