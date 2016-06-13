#!/bin/sh

cd "$(dirname "$0")"/..

mkdir -p target/test-reports/

# Create a temporary sync function from sample-sync-doc-definitions.js to use in test cases
./make-sync-function samples/sample-sync-doc-definitions.js target/test-sample-sync-function.js
