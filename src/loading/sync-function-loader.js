/**
 * Generates a complete sync function from the specified document definitions file.
 *
 * @param {string} docDefinitionsFile The path to the document definitions file
 * @param {Object} [formatOptions] (DEPRECATED) Controls how the sync function is formatted. Options:
 *                                 - jsonString: Boolean indicating whether to return the result enclosed in a JSON-compatible string
 *
 * @returns The full contents of the generated sync function as a string
 */
exports.load = loadFromFile;

const fs = require('fs');
const path = require('path');
const indent = require('../../lib/indent.js/indent.min');
const docDefinitionsLoader = require('./document-definitions-loader');
const fileFragmentLoader = require('./file-fragment-loader');

function loadFromFile(docDefinitionsFile, formatOptions = { }) {
  const syncFuncTemplateDir = path.resolve(__dirname, '../../templates/sync-function');
  const syncFuncTemplatePath = path.resolve(syncFuncTemplateDir, 'template.js');
  const rawSyncFuncTemplate = fs.readFileSync(syncFuncTemplatePath, 'utf8');

  // Automatically replace each instance of the "importSyncFunctionFragment" macro with the contents of the file that is specified
  const fullSyncFuncTemplate =
    fileFragmentLoader.load(syncFuncTemplateDir, 'importSyncFunctionFragment', rawSyncFuncTemplate);

  const docDefinitions = docDefinitionsLoader.load(docDefinitionsFile);

  // Load the document definitions into the sync function template
  const rawSyncFuncString = fullSyncFuncTemplate.replace('$DOCUMENT_DEFINITIONS_PLACEHOLDER$', () => docDefinitions);

  return formatSyncFunction(rawSyncFuncString, formatOptions);
}

function formatSyncFunction(rawSyncFuncString, formatOptions) {
  // Normalize code block indentation, normalize line endings and then replace blank lines with empty lines
  const normalizedFuncString = indent.js(rawSyncFuncString, { tabString: '  ' })
    .replace(/(?:\r\n)|(?:\r)/g, () => '\n')
    .replace(/^\s+$/gm, () => '');

  if (formatOptions.jsonString) {
    // Escape all escape sequences, backslash characters and line ending characters then wrap the result in quotes to
    // make it a valid JSON string
    const formattedFuncString = normalizedFuncString.replace(/\\/g, () => '\\\\')
      .replace(/"/g, () => '\\"')
      .replace(/\n/g, () => '\\n');

    return `"${formattedFuncString}"`;
  } else {
    return normalizedFuncString;
  }
}
