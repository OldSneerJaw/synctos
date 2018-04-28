const fs = require('fs');
const vm = require('vm');

/**
 * Creates a stubbed Sync Gateway environment for document definitions or a sync function for use in tests, schema
 * validation, etc.
 *
 * @param {string} templateFile The absolute path to the template into which to insert the source contents
 * @param {string} macroName The name of the macro to replace with the given source contents
 * @param {string} sourceContents The raw string contents to be inserted into the template
 * @param {string} [sourceFile] The optional path to the file from which the source contents originated, to be used to
 *                              generate stack traces when errors occur
 * @param {boolean} [unescapeBackticks] Whether backticks in the sync function string have been replaced with an escape
 *                                      sequence and must be "unescaped" for the test environment. False by default.
 *
 * @returns {*} The raw stubbed environment
 */
exports.create = function(templateFile, macroName, sourceContents, sourceFile, unescapeBackticks) {
  const vmOptions = {
    filename: sourceFile,
    displayErrors: true
  };

  const environmentTemplate = fs.readFileSync(templateFile, 'utf8').trim()
    .replace(/(?:\r\n)|(?:\r)|(?:\n)/g, () => ' '); // Compress the template to one line to ensure stack trace line numbers are correct

  // The test environment includes a placeholder string (a macro) that is to be replaced with the contents of the source
  const environmentString = environmentTemplate.replace(
    macroName,
    () => {
      // If the contents were read from a sync function file, then backtick escape sequences (i.e. "\`") must be
      // unescaped first
      return unescapeBackticks ? doUnescapeBackticks(sourceContents) : sourceContents;
    });

  // The code that is compiled must be an expression or a sequence of one or more statements. Surrounding it with
  // parentheses makes it a valid expression.
  const environmentStatement = `(${environmentString});`;

  // Compile the environment within the current virtual machine context so it can share access to the "requireAccess",
  // "channel", etc. stubs as defined by the template
  return vm.runInThisContext(environmentStatement, vmOptions);
};

// Sync Gateway configuration files use the backtick character to denote the beginning and end of a multiline string.
// The sync function generator script automatically escapes backtick characters with the sequence "\`" so that it
// produces a valid multiline string. However, when loaded by the test fixture, a sync function is not inserted into a
// Sync Gateway configuration file so we must "unescape" backtick characters to preserve the original intention.
function doUnescapeBackticks(originalString) {
  return originalString.replace(/\\`/g, () => '`');
}
