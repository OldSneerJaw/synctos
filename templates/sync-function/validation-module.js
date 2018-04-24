function validationModule(utils, simpleTypeFilter, typeIdValidator) {
  var documentConstraintsValidationModule =
    importSyncFunctionFragment('document-constraints-validation-module.js')(utils);
  var documentPropertiesValidationModule =
    importSyncFunctionFragment('document-properties-validation-module.js')(utils, simpleTypeFilter, typeIdValidator);

  return {
    validateDoc: function(doc, oldDoc, docDefinition, docType) {
      var documentConstraintValidationErrors =
        documentConstraintsValidationModule.validateDocument(doc, oldDoc, docDefinition);

      // Only validate the document's contents if it's being created or replaced. There's no need if it's being deleted.
      var propertyConstraintValidationErrors = !doc._deleted ?
        documentPropertiesValidationModule.validateProperties(doc, oldDoc, docDefinition) :
        [ ];

      var validationErrors = documentConstraintValidationErrors.concat(propertyConstraintValidationErrors);

      if (validationErrors.length > 0) {
        var errorMessage = 'Invalid ' + docType + ' document: ' + validationErrors.join('; ');
        var error = new Error(errorMessage);
        error.forbidden = errorMessage;

        throw error;
      } else {
        return true;
      }
    }
  };
}
