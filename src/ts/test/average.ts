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
///<reference path="../replace.ts"/>

// for String.replace
declare type AverageReplacer = (matchBody: string, loop: any, ms: any, title: string, deadline: string, index: number) => string;

// regexp document: calculate performance average#2
export namespace AverageCalculator {

    interface IBenchmarkResult {
        loop: number, ms: number, average: number
    }

    let averager: IStringMap<any>;
    let RegexpApp;

    const regex = /(?:loop=(\d+):\s(\d+\.\d+)ms)|(version:\s.+)|(--done--)/g;
    // create closure
    /**
     * set true to "showlog_per_entry" param if need.
     * @param showlog_per_entry
     */
    const averageReplacer = (showlog_per_entry: boolean = false): AverageReplacer => {
        // entry caption text.
        const explain = "average for each run";
        // average caluclator.
        const _averager = {
            entries: {} as { [x: string]: IBenchmarkResult },
            addEntry: function(title) { !this.entries[title] && (this.entries[title] = []); },
            done: function() {
                const keys = Object.keys(this.entries), that = this;
                const total_averages: number[] = [];
                keys.forEach(item => {
                    let sum = 0;
                    const size = that.entries[item].length as number;
                    (<IBenchmarkResult[]>that.entries[item]).forEach(element => sum += element.average);
                    // add top average.
                    total_averages.push(sum / size);
                    // format message.
                    let msg = `${item}, total ${explain}: ${(sum / size).toFixed(6)} ms`;
                    // output average result.
                    console.log(msg);
                    // 
                    RegexpApp && RegexpApp.notifyMessage(`<span style="color: green">${msg}</span>`, 0);
                });
                const min = Math.min(total_averages[0], total_averages[1]);
                const max = Math.max(total_averages[0], total_averages[1]);
                // 😏 -> \u1F60F cannot print javascript?
                console.log(" -------> vs performance percentage: %s\% ------->", (min / max * 100).toFixed(6));
            }
        }
        // cache current entry tag.
        let current_title: string;
        if (!averager) {
            averager = _averager;
        }
        // replacement body.
        const _rp: AverageReplacer = (all, loop, ms, title, deadline, index) => {
            if (title) {
                current_title = title, averager.addEntry(title), console.log(`@${title}`);
            }
            else if (loop) {
                loop = parseInt(loop), ms = parseFloat(ms);
                const average = (ms / loop);
                averager.entries[current_title].push({
                    loop, ms, average
                });
                // if want per entiry.
                showlog_per_entry && console.log(`loop: ${loop}, ${explain}: %s ms`, average.toFixed(6));
            }
            else if (deadline) { averager.done(); }
            return all;
        }
        // return replacer.
        return _rp;
    };

    /**
     * inputs の log を regexp を使って解析し, 平均値を console に書き出します.  
     * inputs の内容は変更されません
     * @param inputs the performance log text.
     * @param showlog_per_entry set true to "showlog_per_entry" param if need. default false
     */
    export function average(inputs: string, showlog_per_entry: boolean = false): string {
        return inputs.replace(regex, averageReplacer(showlog_per_entry));
    }
}

