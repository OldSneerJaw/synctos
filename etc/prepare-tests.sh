#!/bin/sh

cd "$(dirname "$0")"/.. || exit 1

outputDir="build/sync-functions"

mkdir -p "$outputDir"
mkdir -p build/test-reports/

# Create a temporary sync function from from the sample document definitions file
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
