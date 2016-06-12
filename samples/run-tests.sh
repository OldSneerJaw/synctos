#!/bin/sh

# Create a temporary sync function for sample-sync-doc-definitions.js and then runs all of its unit tests with Mocha.
mkdir -p target/

../make-sync-function sample-sync-doc-definitions.js target/test-sample-sync-function.js

node_modules/.bin/mocha
