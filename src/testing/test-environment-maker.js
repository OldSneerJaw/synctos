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

  const envFunction = stubbedEnvironmentMaker.create(
    path.resolve(__dirname, '../../templates/environments/test-environment-template.js'),
    '$SYNC_FUNC_PLACEHOLDER$',
    syncFunctionString,
    absoluteSyncFuncFilePath,
    unescapeBackticks);

  return envFunction(underscore, simpleMock);
};
