const validationEnvironmentMaker = require('./validation-environment-maker');
const documentDefinitionSchema = require('./document-definition-schema');

/**
 * Performs validation of the specified document definitions.
 *
 * @param {*} documentDefinitions The document definitions as a string (e.g. contents of a file), an object or a
 *                                function that returns an object
 * @param {string} [docDefinitionsFilename] The path to the document definitions file
 *
 * @returns {string[]} A list of validation error messages. Will be empty if no validation errors found.
 */
exports.validate = (documentDefinitions, docDefinitionsFilename) => {
  if (typeof documentDefinitions === 'string') {
    return validateDocumentDefinitionsString(documentDefinitions, docDefinitionsFilename);
  } else {
    return validateDocumentDefinitionsObjectOrFunction(documentDefinitions);
  }
};

function validateDocumentDefinitionsString(rawDocDefinitionsString, docDefinitionsFilename) {
  const validationEnv = validationEnvironmentMaker.create(rawDocDefinitionsString, docDefinitionsFilename);

  return validateDocumentDefinitionsObjectOrFunction(validationEnv.documentDefinitions);
}

function validateDocumentDefinitionsObjectOrFunction(documentDefinitions) {
  if (typeof documentDefinitions === 'function') {
    return validateDocumentDefinitionsObject(documentDefinitions());
  } else {
    return validateDocumentDefinitionsObject(documentDefinitions);
  }
}

function validateDocumentDefinitionsObject(documentDefinitions) {
  const validationErrors = [ ];

  Object.keys(documentDefinitions).forEach((documentType) => {
    documentDefinitionSchema.validate(
      documentDefinitions[documentType],
      { abortEarly: false },
      (error) => {
        if (error) {
          error.details.forEach((errorDetails) => {
            const path = [ documentType ].concat(errorDetails.path);
            validationErrors.push(`${path.join('.')}: ${errorDetails.message}`);
          });
        }
      });
  });

  return validationErrors;
}
