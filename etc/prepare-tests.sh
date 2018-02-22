#!/bin/sh -e

cd "$(dirname "$0")"/.. || exit 1

outputDir="build/sync-functions"

echo "Linting modules and specs with JSHint...\n"
node_modules/jshint/bin/jshint src test

sampleDocDefinitionsPath="samples/sample-sync-doc-definitions.js"

# Validate the structure and sematics of the sample document definitions
echo "Validating sample document definitions...\n"
./validate-document-definitions "$sampleDocDefinitionsPath"

# Create a sync function from the sample document definitions file
echo "Generating sync functions...\n"
./make-sync-function "$sampleDocDefinitionsPath" "$outputDir"/test-sample-sync-function.js

# Automatically validate and create a sync function from each document definitions file in the test resources directory
definitionsDir="test/resources"
for docDefinitionPath in "$definitionsDir"/*-doc-definitions.js; do
  # Skip entries that are not files
  if [ ! -f "$docDefinitionPath" ]; then continue; fi

  ./validate-document-definitions "$docDefinitionPath"

  syncFuncName=$(basename "$docDefinitionPath" "-doc-definitions.js")

  outputFile="$outputDir/test-$syncFuncName-sync-function.js"

  ./make-sync-function "$docDefinitionPath" "$outputFile"
done

# Set up JSHint configuration for the generated sync functions
cp "etc/jshintrc-sync-function-template.json" "$outputDir/.jshintrc"

echo "\nLinting generated sync functions with JSHint...\n"
node_modules/jshint/bin/jshint "$outputDir"/*.js

echo "Done"
