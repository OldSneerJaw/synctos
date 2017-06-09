#!/bin/sh -e

cd "$(dirname "$0")"/.. || exit 1

outputDir="build/sync-functions"

mkdir -p "$outputDir"
mkdir -p build/test-reports/

echo "Linting modules and specs with JSHint\n"
node_modules/jshint/bin/jshint src/*.js test/*.js

# Create a temporary sync function from the sample document definitions file
./make-sync-function samples/sample-sync-doc-definitions.js "$outputDir"/test-sample-sync-function.js

# Automatically create a sync function from each document definitions file in the test resources directory
definitionsDir="test/resources"
for docDefinitionPath in "$definitionsDir"/*-doc-definitions.js; do
  # Skip entries that are not files
  if [ ! -f "$docDefinitionPath" ]; then continue; fi

  syncFuncName=$(basename "$docDefinitionPath" "-doc-definitions.js")

  outputFile="$outputDir/test-$syncFuncName-sync-function.js"

  ./make-sync-function "$docDefinitionPath" "$outputFile"
done

echo "\nLinting generated sync functions with JSHint"
node_modules/jshint/bin/jshint "$outputDir"/*.js
