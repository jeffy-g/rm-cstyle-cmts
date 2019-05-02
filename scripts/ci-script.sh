#!/bin/bash -x
# -----------------------------------------------------------------------
# 
# Copyright 2017 motrohi hirotom1107@gmail.com
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# 
# ------------------------------------------------------------------------
function process_bitbucket {
    local SUFFIX=;

    [ "$BITBUCKET_TAG" != "" ] && SUFFIX="-$BITBUCKET_TAG" || echo "BITBUCKET_TAG not setted...";
    [ "$BITBUCKET_BRANCH" != "" ] && SUFFIX="$SUFFIX-$BITBUCKET_BRANCH" || echo "BITBUCKET_BRANCH not setted...";

    local ARCHIVE_NAME=${BITBUCKET_REPO_SLUG}${SUFFIX}-$BITBUCKET_BUILD_NUMBER;

    cd ./dist
    #- zip -r ../rm-cstyle-cmts-release.zip *
    tar czf ../${ARCHIVE_NAME}.tar.gz *
    cd ..

    gulp dist:pack
    cd ./dist-pack
    tar czf ../${ARCHIVE_NAME}-webpack.tar.gz *
    cd ..
    # $BB_REST_API_DOWNLOADs: see Account level Environment variables
    # It can not be expanded if $BB_AUTH_STRING is included in the variable
    # ${BB_REST_API_DOWNLOADs} <- this also does not work...
    # NOTE: although it seems that only one can not be uploaded...
    curl -X POST "https://${BB_AUTH_STRING}@api.bitbucket.org/2.0/repositories/${BITBUCKET_REPO_OWNER}/${BITBUCKET_REPO_SLUG}/downloads" --form files=@"${ARCHIVE_NAME}.tar.gz"
    curl -X POST "https://${BB_AUTH_STRING}@api.bitbucket.org/2.0/repositories/${BITBUCKET_REPO_OWNER}/${BITBUCKET_REPO_SLUG}/downloads" --form files=@"${ARCHIVE_NAME}-webpack.tar.gz"
}

function process_travis {

    export ARCHIVE_NAME=rm-cstyle-cmts-$TRAVIS_TAG

    cd ./dist
    zip -r ../$ARCHIVE_NAME.zip *
    tar czf ../$ARCHIVE_NAME.tar.gz *
    cd ..

    gulp dist:pack # use webpack + awesome-typescript-loader
    cd ./dist-pack
    zip -r ../$ARCHIVE_NAME-webpack.zip *
    tar czf ../$ARCHIVE_NAME-webpack.tar.gz *
    cd ..
}

CALLABLE=;

[ "$TRAVIS_BUILD_NUMBER" != "" ] && CALLABLE=process_travis;
[ "$BITBUCKET_BUILD_NUMBER" != "" ] && CALLABLE=process_bitbucket;

[ "$CALLABLE" != "" ] && $CALLABLE;
