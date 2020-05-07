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

interface String {
    /**
     * @param {number} n
     * @return {string}
     */
    repeat(n: number): string;
    /**
     * @param {number} n
     * @return {string}
     */
    padEnd(n: number): string;
}

interface IStringMap<T> {
    [key: string]: T;
}

type StringMap<T> = {
    [key: string]: T;
};

/**
 * #### To Be Defined
 * 
 *   + can be `undefined`.
 *   + 7 character shorten
 */
type TBD<T> = T | undefined;
