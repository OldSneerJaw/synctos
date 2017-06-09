/**
 * Parses the given document definitions string as JavaScript and creates a shell where the global functions and variables (e.g. doc,
 * oldDoc, simpleTypeFilter, requireAccess) are simple stubs.
 *
 * @param {string} docDefinitionsString The document definitions as a string
 * @param {string} [originalFilename] The optional name/path of the file from which the document definitions were read. To be used in
 *                                    stack traces.
 *
 * @returns The document definitions as a JavaScript object or function with stubbed global dependencies
 */
exports.createShell = createShell;

var vm = require('vm');

function createShell(docDefinitionsString, originalFilename) {
  // Fake the various global variables and functions that are available to document definitions
  var sandbox = {
    doc: { },
    oldDoc: { },
    typeIdValidator: { },
    simpleTypeFilter: function() { },
    isDocumentMissingOrDeleted: function() { },
    isValueNullOrUndefined: function() { },
    getEffectiveOldDoc: function() { },
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

  var rawDocDefinitions = vm.runInNewContext('(' + docDefinitionsString + ');', sandbox, options);

  return rawDocDefinitions;
}
