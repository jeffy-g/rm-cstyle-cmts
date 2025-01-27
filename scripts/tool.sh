#!/bin/bash -x
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
#  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
#  Released under the MIT license
#  https://opensource.org/licenses/mit-license.php
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
  local ret=$(jstool -cmd "version" -extras "./src/index.ts," $1)
  local after=$(echo ${ret} | sed -E 's/.*version updated: ([0-9]+\.[0-9]+\.[0-9]+).*/\1/')
  echo version=[${after}]
  git add -u
  git commit -m v${after}
  git tag v${after}
}

fix_import_path() {
  local target="./build/cjs/bench/index.js"
  fire-sed 's/([./]+)(scripts\/tiny)/\.\.\/\.\.\/\.\.\/\2/' $target
}
#
# remove "use strict" directive
# because typescript reference doesn't work
#
del_usestrict() {
  local files=$(find ./dist/cjs/*.js)
  files+=" "$(find ./dist/cjs/gulp/*.js)
  fire-sed "s/\"use strict\";\\n//" $files
}
fire-sed() {
  local regex=$1
  shift
  local flags="-Ei -z"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    flags=$(echo $flags " -e")
  fi
  sed $flags "$regex" "$@"
}

copyfiles() {
  cpx ${cpxopt} "./{README.md,LICENSE}" dist &
  cpx ${cpxopt} -t "./scripts/fix-refpath" "./build/**/!(bench|gulp)/*.js" dist &
  cpx ${cpxopt} "./build/**/gulp/*.js" dist
}

emit_pkgjson() {
  local pkgjson=$(
    cat <<_EOT_
{
  "main": "./index.js",
  "types": "../index.d.ts"
}
_EOT_
  )
  echo "${pkgjson}" >$1
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
  emit_pkgjson "./dist/webpack/package.json" &
  emit_pkgjson "./dist/umd/package.json"
}

webpack() {
  # rimraf "./dist/webpack/*" "./dist/umd/*"
  [ -z $CI ] && npx webpack || npx webpack >/dev/null
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
