const path = require('path');
const simpleMock = require('../../lib/simple-mock/index');
const stubbedEnvironmentMaker = require('../environments/stubbed-environment-maker');
const underscore = require('../../lib/underscore/underscore-min');

/**
 * Creates simulated Sync Gateway sync function environments for use in tests.
 *
 * @param {string} syncFunctionString The raw string contents of the sync function
 * @param {string} [syncFunctionFile] The optional path to the sync function file, to be used to generate stack traces
 *                                    when errors occur
 * @param {boolean} [unescapeBackticks] Whether backticks in the sync function string have been replaced with an escape
 *                                      sequence and must be "unescaped" for the test environment. False by default.
 *
 * @returns {Object} The simulated environment that was created for the sync function
 */
exports.create = function(syncFunctionString, syncFunctionFile, unescapeBackticks) {
  // If the given file path is relative, it will be interpreted as relative to the process' current working directory.
  // On the other hand, if it's already absolute, it will remain unchanged.
  const absoluteSyncFuncFilePath = syncFunctionFile ? path.resolve(process.cwd(), syncFunctionFile) : syncFunctionFile;

  // If the contents were read from a sync function file, then backtick escape sequences (i.e. "\`") must be
  // unescaped first
  const escapedSyncFuncString = unescapeBackticks ? doUnescapeBackticks(syncFunctionString) : syncFunctionString;

  const envFunction = stubbedEnvironmentMaker.create(
    path.resolve(__dirname, '../../templates/environments/test-environment-template.js'),
    '$SYNC_FUNC_PLACEHOLDER$',
    escapedSyncFuncString,
    absoluteSyncFuncFilePath);

  return envFunction(underscore, simpleMock);
};

// Sync Gateway configuration files use the backtick character to denote the beginning and end of a multiline string.
// The sync function generator script automatically escapes backtick characters with the sequence "\`" so that it
// produces a valid multiline string. However, when loaded by the test fixture, a sync function is not inserted into a
// Sync Gateway configuration file so we must "unescape" backtick characters to preserve the original intention.
function doUnescapeBackticks(originalString) {
  return originalString.replace(/\\`/g, () => '`');
}
