/**
 * Replaces each instance of the specified macro in the given raw text with the contents of the referenced file fragment.
 *
 * @param {string} baseDir The base directory to use when attempting to read a file fragment as a relative path
 * @param {string} macroName The name of the macro to replace in the raw text
 * @param {string} rawText The raw content string in which to replace instances of the specified macro
 *
 * @returns A copy of the given text where each instance of the macro has been replaced with the contents of its corresponding file fragment
 */
exports.load = load;

var fs = require('fs');

function load(baseDir, macroName, rawText) {
  function replacer(fullMatch, fragmentFilename) {
    return readFileFragment(fragmentFilename, baseDir);
  }

  return rawText.replace(new RegExp(macroName + '\\s*\\(\\s*"((?:\\\\"|[^"])+)"\\s*\\)', 'g'), replacer)
    .replace(new RegExp(macroName + '\\s*\\(\\s*\'((?:\\\\\'|[^\'])+)\'\\s*\\)', 'g'), replacer);
}

function readFileFragment(fragmentFilename, baseDir) {
  // The filename may have been defined with escape sequences (e.g. \\, \', \") in it, so unescape them
  var sanitizedFragmentFilename = fragmentFilename.replace(/\\(.)/g, function(escapeSequence, escapedChar) { return escapedChar; });

  try {
    // Attempt to import the fragment file with a path that is relative to the base directory
    return fs.readFileSync(baseDir + '/' + sanitizedFragmentFilename, 'utf8').trim();
  } catch (relativePathEx) {
    try {
      // It's possible the fragment file path was not relative so try again as an absolute path
      return fs.readFileSync(sanitizedFragmentFilename, 'utf8').trim();
    } catch (absolutePathEx) {
      console.log('ERROR: Unable to read fragment file "' + sanitizedFragmentFilename + '": ' + absolutePathEx);

      throw absolutePathEx;
    }
  }
}
