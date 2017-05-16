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
var indent = require('../lib/indent.js/indent.min.js');

function loadFromFile(docDefinitionsFile) {
  var syncFuncTemplateDir = path.dirname(module.filename);

  function readSyncFunctionFragment(fullMatch, fragmentFilename) {
    return readFileFragment(fullMatch, fragmentFilename, syncFuncTemplateDir);
  }

  var docDefinitionDir = path.dirname(docDefinitionsFile);
  function readDocDefinitionFragment(fullMatch, fragmentFilename) {
    return readFileFragment(fullMatch, fragmentFilename, docDefinitionDir);
  }

  var syncFuncTemplatePath = syncFuncTemplateDir + '/sync-function-template.js';
  var syncFuncTemplate;
  try {
    syncFuncTemplate = fs.readFileSync(syncFuncTemplatePath, 'utf8');
  } catch (ex) {
    console.log('ERROR: Unable to read the sync function template file: ' + ex);

    throw ex;
  }

  // Automatically replace each instance of the "importSyncFunctionFragment" macro with the contents of the file that is specified
  syncFuncTemplate = syncFuncTemplate.replace(/importSyncFunctionFragment\s*\(\s*"((?:\\"|[^"])+)"\s*\)/g, readSyncFunctionFragment)
    .replace(/importSyncFunctionFragment\s*\(\s*'((?:\\'|[^'])+)'\s*\)/g, readSyncFunctionFragment);

  var syncDocDefn;
  try {
    syncDocDefn = fs.readFileSync(docDefinitionsFile, 'utf8').trim();
  } catch (ex) {
    if (ex.code === 'ENOENT') {
      console.log('ERROR: Sync document definitions file does not exist');
    } else {
      console.log('ERROR: Unable to read the sync document definitions file: ' + ex);
    }

    throw ex;
  }

  // Automatically replace instances of the "importDocumentDefinitionFragment" macro with the contents of the file that is specified by each
  syncDocDefn = syncDocDefn.replace(/importDocumentDefinitionFragment\s*\(\s*"((?:\\"|[^"])+)"\s*\)/g, readDocDefinitionFragment)
    .replace(/importDocumentDefinitionFragment\s*\(\s*'((?:\\'|[^'])+)'\s*\)/g, readDocDefinitionFragment);

  // Load the document definitions into the sync function template
  var syncFunc = syncFuncTemplate.replace('%SYNC_DOCUMENT_DEFINITIONS%', function() { return syncDocDefn; });

  // Normalize code block indentation, normalize line endings, replace blank lines with empty lines and then escape any occurrence of the
  // backtick character so the sync function can be used in a Sync Gateway configuration file multiline string
  syncFunc = indent.indentJS(syncFunc, '  ')
    .replace(/(?:\r\n)|(?:\r)/g, function() { return '\n'; })
    .replace(/^\s+$/gm, function() { return '' })
    .replace(/`/g, function() { return '\\`'; });

  return syncFunc;
};

function readFileFragment(fullMatch, fragmentFilename, relativePath) {
  // The filename may have been defined with escape sequences (e.g. \\, \', \") in it, so unescape them
  var sanitizedFragmentFilename = fragmentFilename.replace(/\\(.)/g, function(escapeSequence, escapedChar) { return escapedChar; });

  try {
    // Attempt to import the fragment file with a path that is relative to the main document definition file
    return fs.readFileSync(relativePath + '/' + sanitizedFragmentFilename, 'utf8').trim();
  } catch (outerEx) {
    try {
      // It's possible the fragment file path was not relative so try again as an absolute path
      return fs.readFileSync(sanitizedFragmentFilename, 'utf8').trim();
    } catch (innerEx) {
      console.log('ERROR: Unable to read fragment file "' + sanitizedFragmentFilename + '": ' + innerEx);

      throw innerEx;
    }
  }
}
