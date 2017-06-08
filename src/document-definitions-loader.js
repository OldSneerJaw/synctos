/**
 * Loads the document definitions from the specified file.
 *
 * @param {string} docDefinitionsFile The path to the document definitions file
 *
 * @returns The full contents of the document definitions as a string
 */
exports.load = loadFromFile;

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
