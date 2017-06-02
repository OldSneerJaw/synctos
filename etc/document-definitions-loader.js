/**
 * Loads the document definitions from the specified file.
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
 *
 * @returns The document definitions as a JavaScript entity
 */
exports.parseDocDefinitions = parseDocDefinitions;

var fs = require('fs');
var path = require('path');
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

// Fake the various global variables and functions that are available to document definitions
var doc = { };
var oldDoc = { };
var typeIdValidator = { };
function simpleTypeFilter() { return true; }
function isDocumentMissingOrDeleted() { return false; }
function isValueNullOrUndefined() { return false; }
function getEffectiveOldDoc() { return oldDoc; }
function requireAccess() { }
function requireRole() { }
function requireUser() { }
function channel() { }
function access() { }
function role() { }

function parseDocDefinitions(docDefinitionsString) {
  var rawDocDefinitions;
  /*jslint evil: true */
  eval('rawDocDefinitions = ' + docDefinitionsString);
  /*jslint evil: false */

  return rawDocDefinitions;
}
