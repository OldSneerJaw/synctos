/**
 * Saves the sync function to the specified file. Recursively creates the parent directory as needed.
 *
 * @param {string} filePath The path at which to write the sync function file
 * @param {string} syncFunctionString The full contents of the sync function
 * @param {Object} [formatOptions] Controls how the sync function is formatted. Options:
 *                                 - jsonString: Boolean indicating whether to return the result enclosed in a JSON-compatible string
 */
exports.save = save;

const fs = require('fs');
const path = require('path');
const mkdirp = require('../../lib/mkdirp/index');

function save(filePath, syncFunctionString, formatOptions = { }) {
  const outputDirectory = path.dirname(filePath);
  if (!fs.existsSync(outputDirectory)) {
    mkdirp.sync(outputDirectory);
  }

  const formattedSyncFunction = formatSyncFunction(syncFunctionString, formatOptions);

  fs.writeFileSync(filePath, formattedSyncFunction, 'utf8');
}

function formatSyncFunction(syncFunctionString, formatOptions) {
  // Escape backticks so that the sync function can be directly copied and pasted into a Sync Gateway configuration file
  // where backticks are used for multiline strings and then normalize line endings
  const normalizedSyncFuncString = syncFunctionString.replace(/`/g, () => '\\`')
    .replace(/(?:\r\n)|(?:\r)/g, () => '\n');

  if (formatOptions.jsonString) {
    // Escape all escape sequences, backslash characters and line ending characters then wrap the result in quotes to
    // make it a valid JSON string
    const formattedSyncFuncString = normalizedSyncFuncString.replace(/\\/g, () => '\\\\')
      .replace(/"/g, () => '\\"')
      .replace(/\n/g, () => '\\n');

    return `"${formattedSyncFuncString}"`;
  } else {
    return normalizedSyncFuncString;
  }
}
