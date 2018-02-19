/**
 * Generates a complete sync function from the specified document definitions file.
 *
 * @param {string} docDefinitionsFile The path to the document definitions file
 *
 * @returns The full contents of the generated sync function as a string
 */
exports.load = loadFromFile;

var fs = require('fs');
var path = require('path');
var indent = require('../../lib/indent.js/indent.min.js');
var docDefinitionsLoader = require('./document-definitions-loader.js');
var fileFragmentLoader = require('./file-fragment-loader.js');

function loadFromFile(docDefinitionsFile) {
  var syncFuncTemplateDir = path.resolve(__dirname, '../../templates/sync-function');

  var syncFuncTemplatePath = path.resolve(syncFuncTemplateDir, 'template.js');
  var syncFuncTemplate;
  try {
    syncFuncTemplate = fs.readFileSync(syncFuncTemplatePath, 'utf8');
  } catch (ex) {
    console.log('ERROR: Unable to read the sync function template file: ' + ex);

    throw ex;
  }

  // Automatically replace each instance of the "importSyncFunctionFragment" macro with the contents of the file that is specified
  syncFuncTemplate = fileFragmentLoader.load(syncFuncTemplateDir, 'importSyncFunctionFragment', syncFuncTemplate);

  var docDefinitions = docDefinitionsLoader.load(docDefinitionsFile);

  // Load the document definitions into the sync function template
  var syncFunc = syncFuncTemplate.replace('%SYNC_DOCUMENT_DEFINITIONS%', function() { return docDefinitions; });

  // Normalize code block indentation, normalize line endings, replace blank lines with empty lines and then escape any occurrence of the
  // backtick character so the sync function can be used in a Sync Gateway configuration file multiline string
  return indent.js(syncFunc, { tabString: '  ' })
    .replace(/(?:\r\n)|(?:\r)/g, function() { return '\n'; })
    .replace(/^\s+$/gm, function() { return ''; })
    .replace(/`/g, function() { return '\\`'; });
}
