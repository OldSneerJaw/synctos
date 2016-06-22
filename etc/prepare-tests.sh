#!/bin/sh

cd "$(dirname "$0")"/..

mkdir -p build/test-reports/

# Create a temporary sync function from sample-sync-doc-definitions.js to use in test cases
./make-sync-function samples/sample-sync-doc-definitions.js build/test-sample-sync-function.js
