"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var explain = "average for each run";
var Contractor = {
    entries: {},
    current_tag: null,
    order: function (tag) {
        !this.entries[tag] && (this.entries[tag] = []);
        this.current_tag = tag;
    },
    record: function (loop, ms) {
        loop = parseInt(loop), ms = parseFloat(ms);
        var average = (ms / loop);
        this.entries[this.current_tag].push({
            loop: loop, ms: ms, average: average
        });
        return average;
    },
    deadline: function () {
        var lapr = [];
        var tags = Object.keys(this.entries), that = this;
        var msg = "";
        console.log("");
        tags.forEach(function (tag) {
            var average_sum = 0, tspent_sum = 0;
            var size = that.entries[tag].length;
            that.entries[tag].forEach(function (result) {
                tspent_sum += result.ms;
                average_sum += result.average;
            });
            lapr.push(average_sum / size);
            msg += "[" + tag + "] {\n    average of entries: " + (tspent_sum / size).toFixed(6) + " ms, total " + explain + ": " + (average_sum / size).toFixed(6) + " ms\n}\n";
        });
        var min = Math.min(lapr[0], lapr[1]);
        var max = Math.max(lapr[0], lapr[1]);
        console.log("\u2708  ".repeat(8) + "performance ratio: %s%", (min / max * 100).toFixed(6));
        console.log(msg);
    }
};
var emitReplacer = function (showlog_per_entry) {
    if (showlog_per_entry === void 0) { showlog_per_entry = false; }
    var contractor = Contractor;
    return function (all, loop, ms, tag, deadline, index) {
        if (tag) {
            contractor.order(tag), console.log("\u2714 order => " + tag);
        }
        else if (loop) {
            var average_1 = contractor.record(loop, ms);
            showlog_per_entry && console.log("loop: " + loop + ", " + explain + ": %s ms", average_1.toFixed(6));
        }
        else if (deadline) {
            contractor.deadline();
        }
        return all;
    };
};
var regex = /(?:loop=(\d+):\s(\d+\.\d+)ms)|(version:\s.+)|(--done--)/g;
exports.average = function (inputs, showlog_per_entry) {
    if (showlog_per_entry === void 0) { showlog_per_entry = false; }
    return inputs.replace(regex, emitReplacer(showlog_per_entry));
};
