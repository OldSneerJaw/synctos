/**
 * Creates simulated Sync Gateway sync function environments for use in tests.
 *
 * @param {string} rawSyncFunction The raw string contents of the sync function
 * @param {string} [syncFunctionFile] The optional path to the sync function file, to be used to generate stack traces when errors occur
 *
 * @returns {Object} The simulated environment created for the sync function
 */
exports.init = init;

const fs = require('fs');
const vm = require('vm');
const underscore = require('../../lib/underscore/underscore-min');
const simpleMock = require('../../lib/simple-mock/index');

function init(rawSyncFunction, syncFunctionFile) {
  const options = {
    filename: syncFunctionFile,
    displayErrors: true
  };

  const environmentTemplate = fs.readFileSync('templates/test-environment-template.js', 'utf8').trim();

  // The test environment includes a placeholder string called "%SYNC_FUNC_PLACEHOLDER%" that is to be replaced with the contents of
  // the sync function
  const environmentString = environmentTemplate.replace(
    '%SYNC_FUNC_PLACEHOLDER%',
    () => unescapeBackticks(rawSyncFunction));

  // The code that is compiled must be an expression or a sequence of one or more statements. Surrounding it with parentheses makes it a
  // valid statement.
  const environmentStatement = `(${environmentString});`;

  // Compile the test environment function within the current virtual machine context so it can share access to the "requireAccess",
  // "channel", "customActionStub", etc. stubs with the test-helper module
  const environmentFunction = vm.runInThisContext(environmentStatement, options);

  return environmentFunction(underscore, simpleMock);
}

// Sync Gateway configuration files use the backtick character to denote the beginning and end of a multiline string. The sync function
// generator script automatically escapes backtick characters with the sequence "\`" so that it produces a valid multiline string.
// However, when loaded by the test helper, a sync function is not inserted into a Sync Gateway configuration file so we must "unescape"
// backtick characters to preserve the original intention.
function unescapeBackticks(originalString) {
  return originalString.replace(/\\`/g, () => '`');
}
