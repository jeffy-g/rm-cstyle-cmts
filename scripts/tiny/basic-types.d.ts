/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2018 jeffy-g <hirotom1107@gmail.com>
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
/**
 * #### To Be Completed
 *
 *   + can be `null`.
 *   + 2 character shorten
 */
type TBC<T> = T | null;

/**
 * T is falsy then return A, trusy then B
 * 
 * @date 20/03/31
 */
type Conditional<T, A, B> = unknown extends T ? A : T extends (void | false | undefined) ? A : B;

/**
 * Remove readonly
 */
type Writable<T> = {
    -readonly [P in keyof T]: T[P];
};

/**
 * pickup public fields and methods from `typescript` class.
 *
 * shorthand of:
 * ```ts
 * const someValue: Pick<T, keyof T>;
 * ```
 *
 * NOTE: cannot listed `protected` and `private` modifier
 *
 * @see Partial
 * @see Required
 * @see ReadOnly
 */
type InterfaceType<T> = {
    [P in keyof T]: T[P];
};
