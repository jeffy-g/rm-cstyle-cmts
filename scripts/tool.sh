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
cpxopt=$([ -z $CI ] && echo "-v" || echo "")
patch_with_tag() {
  local ret=$(yarn v $1);
  local after=$(echo $ret | sed -E 's/.*version updated: ([0-9]+\.[0-9]+\.[0-9]+).*/\1/');
  echo version=[$after];
  git add -u;
  git commit -m v$after;
  git tag v$after
}

fix_import_path() {
  local target="./build/cjs/bench/index.js"
  cat $target | sed -E 's/([./]+)(scripts\/tiny)/\.\.\/\.\.\/\.\.\/\2/'>$target.tmp
  mv $target.tmp $target
}

copyfiles() {
  concurrently -n "copy:lic,copy:js,copy:js:gulp" -c "green,blue" "cpx $cpxopt \"./{README.md,LICENSE}\" dist"\
    "cpx $cpxopt -t ./scripts/fix-refpath \"./build/**/!(bench|gulp)/*.js\" dist"\
    "cpx $cpxopt \"./build/**/gulp/*.js\" dist"
}

copytypes() {
  local cpx_pre="cpx $cpxopt src/index.d.ts"
  local cpx_pre_gulp="cpx $cpxopt -t ./scripts/fix-refpath \"src/gulp/{index.d.ts,package.json}\""
  local -a commands=(
    "$cpx_pre ./dist"
    "$cpx_pre ./dist/umd"
    "$cpx_pre ./dist/webpack"
    "$cpx_pre_gulp ./dist/cjs/gulp"
    "$cpx_pre_gulp ./dist/webpack/gulp"
  )
  concurrently -n dts:dist,dts:dist:umd,dts:dist:webpack,dts:gulp -c red,green,yellow,blue "${commands[@]@Q}" # need quote
}

webpack() {
  rimraf "./dist/webpack/*" "./dist/umd/*"
  [ -z $CI ] && npx webpack || npx webpack>/dev/null
  echo
}
webpackAfter() {
  # concurrently -n copy:dts,jstool:rws -c green,yellow  "cpx $cpxopt \"./dist/*.d.ts\" \"./dist/webpack/\"" "yarn jstool -cmd rws"
  yarn jstool -cmd rws
}

if [ ! -z $1 ]; then
    [ "$1" = "patch_with_tag" ] && patch_with_tag $2 || $1
else
    echo "no parameters..."
fi
