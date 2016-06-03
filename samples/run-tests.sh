#!/bin/sh

# Create a temporary sync function for sample-sync-doc-definitions.js and then runs all of its unit tests with Mocha.
mkdir -p target/

../sync-function-maker.rb sample-sync-doc-definitions.js target/sample-sync-function.js

node_modules/.bin/mocha
