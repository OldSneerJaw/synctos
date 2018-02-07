/**
 * Parses the given document definitions string as JavaScript and creates a stubbed environment where the global Sync Gateway functions and
 * variables (e.g. doc, oldDoc, simpleTypeFilter, requireAccess) are simple stubs.
 *
 * @param {string} docDefinitionsString The document definitions as a string
 * @param {string} [originalFilename] The optional name/path of the file from which the document definitions were read. To be used in
 *                                    stack traces.
 *
 * @returns A JavaScript object that exposes the document definitions via the "documentDefinitions" property along with the stubbed global
 *          dependencies via properties that match their names (e.g. "doc", "oldDoc", "typeIdValidator", "channel")
 */
exports.init = init;

var fs = require('fs');
var vm = require('vm');
var underscore = require('../../lib/underscore/underscore-min');
var simpleMock = require('../../lib/simple-mock/index');

function init(docDefinitionsString, originalFilename) {
  var options = {
    filename: originalFilename,
    displayErrors: true
  };

  var envTemplateString = fs.readFileSync('templates/validation-environment-template.js', 'utf8').trim();

  // The test helper environment includes a placeholder string called "%DOC_DEFINITIONS_PLACEHOLDER%" that is to be replaced with the
  // contents of the document definitions
  var envString = envTemplateString.replace('%DOC_DEFINITIONS_PLACEHOLDER%', function() { return docDefinitionsString; });

  // The code that is compiled must be an expression or a sequence of one or more statements. Surrounding it with parentheses makes it a
  // valid statement.
  var envStatement = '(' + envString + ');';

  // Compile the document definitions environment function within the current virtual machine context so it can share access to the
  // "requireAccess", "channel", "customActionStub", etc. stubs
  var envFunction = vm.runInThisContext(envStatement, options);

  return envFunction(underscore, simpleMock);
}
