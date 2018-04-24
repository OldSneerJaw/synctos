function documentConstraintsValidationModule(utils) {
  return {
    validateDocument: function(doc, oldDoc, docDefinition) {
      var validationErrors = [ ];

      validateDocImmutability(doc, oldDoc, docDefinition, validationErrors);
      validateDocumentIdRegexPattern(doc, oldDoc, docDefinition, validationErrors);

      return validationErrors;
    }
  };

  function validateDocImmutability(doc, oldDoc, docDefinition, validationErrors) {
    if (!utils.isDocumentMissingOrDeleted(oldDoc)) {
      if (utils.resolveDocumentConstraint(docDefinition.immutable)) {
        validationErrors.push('documents of this type cannot be replaced or deleted');
      } else if (doc._deleted) {
        if (utils.resolveDocumentConstraint(docDefinition.cannotDelete)) {
          validationErrors.push('documents of this type cannot be deleted');
        }
      } else {
        if (utils.resolveDocumentConstraint(docDefinition.cannotReplace)) {
          validationErrors.push('documents of this type cannot be replaced');
        }
      }
    }
  }

  function validateDocumentIdRegexPattern(doc, oldDoc, docDefinition, validationErrors) {
    if (!doc._deleted && utils.isDocumentMissingOrDeleted(oldDoc)) {
      // The constraint only applies when a document is created
      var documentIdRegexPattern = utils.resolveDocumentConstraint(docDefinition.documentIdRegexPattern);
      if (documentIdRegexPattern instanceof RegExp && !documentIdRegexPattern.test(doc._id)) {
        validationErrors.push('document ID must conform to expected pattern ' + documentIdRegexPattern);
      }
    }
  }
}
