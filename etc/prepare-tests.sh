#!/bin/sh

cd "$(dirname "$0")"/..

mkdir -p build/resources/
mkdir -p build/test-reports/

# Create a temporary sync function from test resource document definitions to use in test cases
./make-sync-function samples/sample-sync-doc-definitions.js build/resources/test-sample-sync-function.js
./make-sync-function test/resources/array-doc-definitions.js build/resources/test-array-sync-function.js
./make-sync-function test/resources/immutable-doc-definitions.js build/resources/test-immutable-sync-function.js
./make-sync-function test/resources/string-doc-definitions.js build/resources/test-string-sync-function.js
./make-sync-function test/resources/date-doc-definitions.js build/resources/test-date-sync-function.js
./make-sync-function test/resources/datetime-doc-definitions.js build/resources/test-datetime-sync-function.js
