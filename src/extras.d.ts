/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2017 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/

/**
 * #### To Be Defined
 * 
 *   + can be `undefined`.
 *   + 7 character shorten
 */
type TBD<T> = T | undefined;
type TBC<T> = T | null;

interface RegExp {
  /**
   * es2022 feature
   */
  readonly indices?: Array<[number, number]>;
}

type TBivariant<M extends (...args: any[]) => any> = {
  bivarianceHack(...args: Parameters<M>): ReturnType<M>;
}["bivarianceHack"];
/**
 * @template {(...args: any[]) => any} M
 * @typedef {{ bivarianceHack(...args: Parameters<M>): ReturnType<M>; }["bivarianceHack"]} TBivariant
 */
