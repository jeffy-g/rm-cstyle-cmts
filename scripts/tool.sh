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
jstool() {
  [[ $1 == jstool ]] && {
    shift 1
  }
  node "./scripts/tiny/tools.js" "$@"
}

force-push() {
  local branch_name=$(git branch --contains=HEAD)
  branch_name=${branch_name/* /}
  echo "current brach name: [${branch_name}]"
  git push --tags --force --progress origin ${branch_name}:${branch_name}
}
patch_with_tag() {
  local ret=$(jstool -cmd "version" -extras "./src/index.ts," $1);
  local after=$(echo ${ret} | sed -E 's/.*version updated: ([0-9]+\.[0-9]+\.[0-9]+).*/\1/');
  echo version=[${after}];
  git add -u;
  git commit -m v${after};
  git tag v${after}
}

fix_import_path() {
  local target="./build/cjs/bench/index.js"
  sed -i -E 's/([./]+)(scripts\/tiny)/\.\.\/\.\.\/\.\.\/\2/' ${target}
}
# 
# remove "use strict" directive
# because typescript reference doesn't work
# 
del_usestrict() {
  # step 1
  local files=$(find ./dist/cjs/*.js)
  files+=" "$(find ./dist/cjs/gulp/*.js)
  # echo -e $files
  sed -i -z -E "s/\"use strict\";\n//" $files
}

copyfiles() {
  cpx ${cpxopt} "./{README.md,LICENSE}" dist &\
  cpx ${cpxopt} -t "./scripts/fix-refpath" "./build/**/!(bench|gulp)/*.js" dist &\
  cpx ${cpxopt} "./build/**/gulp/*.js" dist
}

# copytypes() {
#   local cpx_pre=$(echo "cpx ${cpxopt}" '"src/index.d.ts"')
#   local cpx_pre_gulp=$(echo "cpx ${cpxopt} -t" '"./scripts/fix-refpath" "src/gulp/{index.d.ts,package.json}"')
#   local -a commands=(
#     "${cpx_pre} ./dist"
#     "${cpx_pre} ./dist/umd"
#     "${cpx_pre} ./dist/webpack"
#     "${cpx_pre_gulp} ./dist/cjs/gulp"
#     "${cpx_pre_gulp} ./dist/webpack/gulp"
#   )
#   local executes=
#   for cmd in "${commands[@]}"; do
#     if [[ -z ${executes} ]]; then
#       executes="${cmd}"
#     else
#       executes="${executes} & ${cmd}"
#     fi
#   done

#   eval ${executes}
# }

emit_pkgjson() {
  local pkgjson=$(cat <<_EOT_
{
  "main": "./index.js",
  "types": "../index.d.ts"
}
_EOT_
)
  echo "${pkgjson}">$1
}

copytypes() {
  local cpx_pre=$(echo "cpx ${cpxopt}" '"src/{index,extras}.d.ts"')
  local cpx_pre_gulp=$(echo "cpx ${cpxopt} -t" '"./scripts/fix-refpath" "src/gulp/{index.d.ts,package.json}"')
  local executes="${cpx_pre} ./dist"
  # local -a dirs=(umd webpack cjs/gulp webpack/gulp)
  # for dir in "${dirs[@]}"; do
  #   local pre
  #   [[ "$dir" =~ "gulp" ]] && pre="${cpx_pre_gulp}" || pre="${cpx_pre}"
  #   executes+=" & ${pre} ./dist/${dir}"
  # done
  local -a dirs=(cjs/gulp webpack/gulp)
  for dir in "${dirs[@]}"; do
    executes+=" & ${cpx_pre_gulp} ./dist/${dir}"
  done

  eval ${executes}
  emit_pkgjson "./dist/webpack/package.json" & emit_pkgjson "./dist/umd/package.json"
}

webpack() {
  # rimraf "./dist/webpack/*" "./dist/umd/*"
  [ -z $CI ] && npx webpack || npx webpack>/dev/null
  echo
  jstool -cmd rws
}

if [ ! -z $1 ]; then
    [ "$1" = "patch_with_tag" ] && patch_with_tag $2 || {
      fname=$1
      shift
      $fname "$@"
    }
else
    echo "no parameters..."
fi
