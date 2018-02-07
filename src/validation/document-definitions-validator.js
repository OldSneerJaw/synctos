var environmentShellMaker = require('../document-definitions-shell-maker');
var documentDefinitionSchema = require('./document-definition-schema');

/**
 * Performs validation of the specified document definitions.
 *
 * @param {*} documentDefinitions The document definitions as a string (e.g. contents of a file), an object or a
 *                                function that returns an object
 * @param {string} [docDefinitionsFilename] The path to the document definitions file
 *
 * @returns {string[]} A list of validation error messages. Will be empty if no validation errors found.
 */
exports.validate = function(documentDefinitions, docDefinitionsFilename) {
  if (typeof documentDefinitions === 'string') {
    return validateDocumentDefinitionsString(documentDefinitions, docDefinitionsFilename);
  } else {
    return validateDocumentDefinitionsObjectOrFunction(documentDefinitions);
  }
};

function validateDocumentDefinitionsString(rawDocDefinitionsString, docDefinitionsFilename) {
  var environmentShell = environmentShellMaker.createShell(rawDocDefinitionsString, docDefinitionsFilename);

  return validateDocumentDefinitionsObjectOrFunction(environmentShell.documentDefinitions);
}

function validateDocumentDefinitionsObjectOrFunction(documentDefinitions) {
  if (typeof documentDefinitions === 'function') {
    return validateDocumentDefinitionsObject(documentDefinitions());
  } else {
    return validateDocumentDefinitionsObject(documentDefinitions);
  }
}

function validateDocumentDefinitionsObject(documentDefinitions) {
  var validationErrors = [ ];

  Object.keys(documentDefinitions).forEach(function(documentType) {
    documentDefinitionSchema.validate(
      documentDefinitions[documentType],
      { abortEarly: false },
      function(error) {
        if (error) {
          error.details.forEach(function(errorDetails) {
            var path = [ documentType ].concat(errorDetails.path);
            validationErrors.push(path.join('.') + ': ' + errorDetails.message);
          });
        }
      });
  });

  return validationErrors;
}
