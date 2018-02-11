/**
 * Generates a complete sync function from the specified document definitions file.
 *
 * @param {string} docDefinitionsFile The path to the document definitions file
 *
 * @returns The full contents of the generated sync function as a string
 */
exports.load = loadFromFile;

const fs = require('fs');
const path = require('path');
const indent = require('../../lib/indent.js/indent.min');
const docDefinitionsLoader = require('./document-definitions-loader');
const fileFragmentLoader = require('./file-fragment-loader');

function loadFromFile(docDefinitionsFile) {
  const syncFuncTemplateDir = path.resolve(__dirname, '../../templates');

  const syncFuncTemplatePath = path.resolve(syncFuncTemplateDir, 'sync-function-template.js');
  let syncFuncTemplate;
  try {
    syncFuncTemplate = fs.readFileSync(syncFuncTemplatePath, 'utf8');
  } catch (ex) {
    console.log('ERROR: Unable to read the sync function template file: ' + ex);

    throw ex;
  }

  // Automatically replace each instance of the "importSyncFunctionFragment" macro with the contents of the file that is specified
  syncFuncTemplate = fileFragmentLoader.load(syncFuncTemplateDir, 'importSyncFunctionFragment', syncFuncTemplate);

  const docDefinitions = docDefinitionsLoader.load(docDefinitionsFile);

  // Load the document definitions into the sync function template
  const syncFunc = syncFuncTemplate.replace('%SYNC_DOCUMENT_DEFINITIONS%', function() { return docDefinitions; });

  // Normalize code block indentation, normalize line endings, replace blank lines with empty lines and then escape any occurrence of the
  // backtick character so the sync function can be used in a Sync Gateway configuration file multiline string
  return indent.js(syncFunc, { tabString: '  ' })
    .replace(/(?:\r\n)|(?:\r)/g, function() { return '\n'; })
    .replace(/^\s+$/gm, function() { return ''; })
    .replace(/`/g, function() { return '\\`'; });
}
