/**
 * Loads the document definitions from the specified file. Any document definition fragments referenced therein will be resolved
 * automatically.
 *
 * @param {string} docDefinitionsFile The path to the document definitions file
 *
 * @returns {string} The full contents of the document definitions as a string
 */
exports.load = loadFromFile;

const fs = require('fs');
const path = require('path');
const fileFragmentLoader = require('./file-fragment-loader.js');

function loadFromFile(docDefinitionsFile) {
  let docDefinitions;
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

  const docDefinitionsDir = path.dirname(docDefinitionsFile);

  // Automatically replace instances of the "importDocumentDefinitionFragment" macro with the contents of the file that is specified by each
  return fileFragmentLoader.load(docDefinitionsDir, 'importDocumentDefinitionFragment', docDefinitions);
}
