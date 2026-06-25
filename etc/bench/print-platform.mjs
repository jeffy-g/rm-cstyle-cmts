/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2026 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file etc/bench/print-platform.mjs
 */
import * as os from "node:os";


/**
 * show running node platform info
 */
export const log = console.log;
export function printPlatform(subtitle = "-- empty --") {

  const div = 1024 ** 3;
  const v8 = process.versions.v8;
  const node = process.versions.node;
  const totalMemGB = (os.totalmem() / div).toFixed(2);
  const freeMemGB = (os.freemem() / div).toFixed(2);

  const cpus = os.cpus().map(function (cpu) {
    return cpu.model;
  }).reduce(function (o, model) {
    if (!o[model]) o[model] = 0;
    o[model]++;
    return o;
  }, /** @type {Record<string, number>} */({}));
  const cpusSummary = Object.keys(cpus).map(function (key) {
    // \u00d7: × "x": 0x78
    return key + " x " + cpus[key];
  }).join("\n");

  const platfromSummary = `
OS     : ${os.type()} ${os.release()} ${os.arch()}
CPU    : ${cpusSummary}
Memory : ${totalMemGB} GB (Free: ${freeMemGB} GB)
Node.JS: ${node}
V8     : ${v8}`;

  log(`Platform info: (${subtitle})`);
  log(platfromSummary + "\n");

  return platfromSummary;
}
