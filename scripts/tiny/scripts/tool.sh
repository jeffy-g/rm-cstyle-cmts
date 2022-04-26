#!/bin/bash -x
#
#  The MIT License (MIT)
#
#  Copyright (c) 2022 jeffy-g hirotom1107@gmail.com
#
#  Permission is hereby granted, free of charge, to any person obtaining a copy
#  of this software and associated documentation files (the "Software"), to deal
#  in the Software without restriction, including without limitation the rights
#  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#  copies of the Software, and to permit persons to whom the Software is
#  furnished to do so, subject to the following conditions:
#
#  The above copyright notice and this permission notice shall be included in
#  all copies or substantial portions of the Software.
#
#  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
#  THE SOFTWARE.
#
patch_with_tag() {
  local ret=$(npm run v);
  local after=$(echo $ret | sed -E 's/.*version updated: ([0-9]+\.[0-9]+\.[0-9]+).*/\1/');
  echo version=[$after];
  git add -u;
  git commit -m v$after;
  git tag v$after
}

copyfiles() {
  concurrently -n copy:lic,copy:js,copy:js:gulp -c green,blue "cpx -v \"./{README.md,LICENSE}\" dist"\
    "cpx -v -t ./scripts/fix-refpath \"./build/**/!(bench|gulp)/*.js\" dist" "cpx -v \"./build/**/gulp/*.js\" dist"
}

copytypes() {
  local cpx_pre='cpx -v src/index.d.ts'
  local cpx_pre_gulp='cpx -v "src/gulp/{index.d.ts,package.json}"'
  #
  # TIP: https://www.gnu.org/software/bash/manual/html_node/Arrays.html#Arrays
  # TIP: https://stackoverflow.com/questions/40732193/bash-how-to-use-operator-parameter-expansion-parameteroperator
  #
  # echo "${!commands[@]}" -> 0 1 2 3 4
  local -a commands=(
    "$cpx_pre ./dist"
    "$cpx_pre ./dist/cjs"
    "$cpx_pre ./dist/umd"
    "$cpx_pre ./dist/webpack"
    "$cpx_pre_gulp ./dist/cjs/gulp"
    "$cpx_pre_gulp ./dist/esm/gulp"
  )
  concurrently -n dts:dist,dts:dist:cjs,dts:dist:umd,dts:dist:webpack,dts:gulp,dts:esm:gulp -c red,green,yellow,blue,magenta "${commands[@]@Q}" # need quote!!
}

if [ ! -z $1 ]; then
    eval $1
else
    echo "no parameters..."
fi
