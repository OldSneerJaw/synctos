#!/bin/sh

fullPath() {
  (
    cd "$(dirname "$1")" || exit 1
    echo "$PWD"
  )
}

WORKING_DIR=$(fullPath "$0")
cd "$WORKING_DIR"/..

# Create a temporary sync function for sample-sync-doc-definitions.js
mkdir -p target/

./make-sync-function samples/sample-sync-doc-definitions.js target/test-sample-sync-function.js

# Run all unit tests with Mocha on the temporary sync function
node_modules/.bin/mocha
