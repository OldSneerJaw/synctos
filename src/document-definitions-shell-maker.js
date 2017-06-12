/**
 * Parses the given document definitions string as JavaScript and creates a shell where the global functions and variables (e.g. doc,
 * oldDoc, simpleTypeFilter, requireAccess) are simple stubs.
 *
 * @param {string} docDefinitionsString The document definitions as a string
 * @param {string} [originalFilename] The optional name/path of the file from which the document definitions were read. To be used in
 *                                    stack traces.
 *
 * @returns A JavaScript object that exposes the document definitions via the "documentDefinitions" property along with the stubbed global
 *          dependencies via properties that match their names (e.g. "doc", "oldDoc", "typeIdValidator", "channel")
 */
exports.createShell = createShell;

var fs = require('fs');
var vm = require('vm');

function createShell(docDefinitionsString, originalFilename) {
  var options = {
    filename: originalFilename,
    displayErrors: true
  };

  var shellTemplateString;
  try {
    shellTemplateString = fs.readFileSync(__dirname + '/templates/document-definitions-shell-template.js', 'utf8').trim();
  } catch (ex) {
    console.log('ERROR: Unable to read the document definitions shell template: ' + ex);

    throw ex;
  }

  // The test helper environment includes a placeholder string called "%DOC_DEFINITIONS_PLACEHOLDER%" that is to be replaced with the
  // contents of the document definitions
  var shellString = shellTemplateString.replace('%DOC_DEFINITIONS_PLACEHOLDER%', function() { return docDefinitionsString; });

  // The code that is compiled must be an expression or a sequence of one or more statements. Surrounding it with parentheses makes it a
  // valid statement.
  var shellStatement = '(' + shellString + ');';

  // Compile the document definitions shell function within the current virtual machine context so it can share access to the
  // "requireAccess", "channel", "customActionStub", etc. stubs
  var shellFunction = vm.runInThisContext(shellStatement, options);

  return shellFunction(require);
}
