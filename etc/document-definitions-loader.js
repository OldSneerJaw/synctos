/**
 * Loads the document definitions from the specified file. Any document definition fragments referenced therein will be resolved
 * automatically.
 *
 * @param {string} docDefinitionsFile The path to the document definitions file
 *
 * @returns The full contents of the document definitions as a string
 */
exports.load = loadFromFile;

/**
 * Parses the given document definitions string as JavaScript.
 *
 * @param {string} docDefinitionsString The document definitions as a string
 * @param {string} [originalFilename] The optional name/path of the file from which the document definitions were read. Will be used in
 *                                    stack traces.
 *
 * @returns The document definitions as a JavaScript object or function
 */
exports.parseDocDefinitions = parseDocDefinitions;

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var fileFragmentLoader = require('./file-fragment-loader.js');

function loadFromFile(docDefinitionsFile) {
  var docDefinitions;
  try {
    docDefinitions = fs.readFileSync(docDefinitionsFile, 'utf8').trim();
  } catch (ex) {
    if (ex.code === 'ENOENT') {
      console.log('ERROR: Sync document definitions file does not exist');
    } else {
      console.log('ERROR: Unable to read the sync document definitions file: ' + ex);
    }

    throw ex;
  }

  var docDefinitionsDir = path.dirname(docDefinitionsFile);

  // Automatically replace instances of the "importDocumentDefinitionFragment" macro with the contents of the file that is specified by each
  return fileFragmentLoader.load(docDefinitionsDir, 'importDocumentDefinitionFragment', docDefinitions);
}

function parseDocDefinitions(docDefinitionsString, originalFilename) {
  // Fake the various global variables and functions that are available to document definitions
  var sandbox = {
    doc: { },
    oldDoc: { },
    typeIdValidator: { },
    simpleTypeFilter: function() { return true; },
    isDocumentMissingOrDeleted: function() { return false; },
    isValueNullOrUndefined: function() { return false; },
    getEffectiveOldDoc: function() { return oldDoc; },
    requireAccess: function() { },
    requireRole: function() { },
    requireUser: function() { },
    channel: function() { },
    access: function() { },
    role: function() { }
  };
  var options = {
    filename: originalFilename,
    displayErrors: true
  };

  var rawDocDefinitions = vm.runInNewContext('documentDefinitionsPlaceholder = ' + docDefinitionsString, sandbox, options);

  return rawDocDefinitions;
}
