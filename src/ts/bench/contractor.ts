/*
-----------------------------------------------------------------------

Copyright 2017 motrohi hirotom1107@gmail.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

------------------------------------------------------------------------
*/

// for String.replace
declare type AverageReplacer = (matchBody: string, loop: any, ms: any, tag: string, deadline: string, index: number) => string;

// regexp document: calculate performance average#2
/**
 * extended contractor pattern?
 */
// namespace ContractorPattern {

    interface IBenchmarkResult {
        loop: number;
        ms: number;
        average: number;
    }

    // entry caption text.
    const explain: string = "average for each run";

    // contractor. (
    const Contractor: IStringMap<any> = {
        entries: {} as { [x: string]: IBenchmarkResult[] },
        current_tag: null as string,

        order: function(tag: string): void {
            !this.entries[tag] && (this.entries[tag] = []);
            this.current_tag = tag;
        },
        record: function(loop: any, ms: any): number {
            loop = parseInt(loop), ms = parseFloat(ms);
            /** average for each run */
            const average = (ms / loop);
            // record loop count, time spent, average.
            this.entries[this.current_tag].push({
                loop, ms, average
            });
            return average;
        },

        deadline: function(): void {
            /** list of average per run */
            const lapr: number[] = [];
            /** tag collection */
            const tags = Object.keys(this.entries), that = this;

            let msg = "";
            console.log("");
            tags.forEach(tag => {
                let average_sum = 0, tspent_sum = 0;
                const size = that.entries[tag].length as number;
                (<IBenchmarkResult[]>that.entries[tag]).forEach(result => {
                    tspent_sum += result.ms;
                    average_sum += result.average;
                });
                // average for every run.
                lapr.push(average_sum / size);
                // format message.
                msg += `[${tag}] {
    average of entries: ${(tspent_sum / size).toFixed(6)} ms, total ${explain}: ${(average_sum / size).toFixed(6)} ms
}\n`;
            });

            const min = Math.min(lapr[0], lapr[1]);
            const max = Math.max(lapr[0], lapr[1]);
            // 😏 :\u1F60F ☞: \u261E
            // ✈: \u2708
            console.log(`${"\u2708  ".repeat(8)}performance ratio: %s\%`, (min / max * 100).toFixed(6));
            // output result message.
            console.log(msg);
        }
    };

    /**
     * set true to "showlog_per_entry" param if need.
     * @param showlog_per_entry
     */
    const emitReplacer = (showlog_per_entry: boolean = false): AverageReplacer => {
        const contractor = Contractor;
        // return replacement body.
        return (all, loop, ms, tag, deadline, index) => {
            if (tag) { // ✔ :\u2714
                contractor.order(tag), console.log(`\u2714 order => ${tag}`);
            } else if (loop) {
                const average = contractor.record(loop, ms);
                // if want per entiry.
                showlog_per_entry && console.log(
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
     * inputs の log を regexp を使って解析し, 平均値を console に書き出します.  
     * inputs の内容は変更されません
     * @param inputs the performance log text.
     * @param showlog_per_entry set true to "showlog_per_entry" param if need. default false
     */
    export const average = (inputs: string, showlog_per_entry: boolean = false): string => {
        return inputs.replace(regex, emitReplacer(showlog_per_entry));
    };
// }

