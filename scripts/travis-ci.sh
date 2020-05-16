#!/bin/bash

before_install() {
  # npm i -g yarn codecov gulp
  # export CI execution environment status as FIRE_CODECOV variable
  local VER=$(echo $(x=$(node -v); echo ${x:1:2}))
  export FIRE_CODECOV=$([ $TRAVIS_OS_NAME = "linux" -a $VER = "14" ] && echo "1" || echo "")
}

before_script() {
  if [ ! -z $FIRE_CODECOV ] && [ ! -z $CC_TEST_REPORTER_ID ]; then
    # install cc-test-reporter
    curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
    chmod +x ./cc-test-reporter
    ./cc-test-reporter before-build
  fi
}

after_script() {
  if [ ! -z $FIRE_CODECOV ] && [ ! -z $CC_TEST_REPORTER_ID ]; then
    # after-build: combines format-coverage
    ./cc-test-reporter after-build --exit-code $TRAVIS_TEST_RESULT
  fi
}

after_success() {
  if [ ! -z $FIRE_CODECOV ]; then
    # or bash <(curl -s https://codecov.io/bash) ?
    # upload-coverage.
    local args="-f coverage/coverage-final.json"
    if [ ! -z $CODECOV_TOKEN ]; then
      args="$args -t $CODECOV_TOKEN";
    fi
    codecov $args
  fi
}


if [ ! -z $1 ]; then
    eval $1
else
    echo "no parameters..."
fi
