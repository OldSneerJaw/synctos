function attachmentsValidationModule(utils, buildItemPath, resolveItemConstraint) {
  var attachmentReferenceValidators = { };

  return {
    validateAttachmentReference: validateAttachmentReference,
    validateAttachments: validateAttachments
  };

  function validateAttachmentReference(doc, validator, itemStack) {
    var validationErrors = [ ];
    var currentItemEntry = itemStack[itemStack.length - 1];
    var itemValue = currentItemEntry.itemValue;

    if (typeof itemValue !== 'string') {
      validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an attachment reference string');
    } else {
      attachmentReferenceValidators[itemValue] = validator;

      var supportedExtensions = resolveItemConstraint(validator.supportedExtensions);
      if (supportedExtensions) {
        var extRegex = buildSupportedExtensionsRegex(supportedExtensions);
        if (!extRegex.test(itemValue)) {
          validationErrors.push('attachment reference "' + buildItemPath(itemStack) + '" must have a supported file extension (' + supportedExtensions.join(',') + ')');
        }
      }

      var regexPattern = resolveItemConstraint(validator.regexPattern);
      if (regexPattern && !regexPattern.test(itemValue)) {
        validationErrors.push('attachment reference "' + buildItemPath(itemStack) + '" must conform to expected pattern ' + regexPattern);
      }

      // Because the addition of an attachment is typically a separate operation from the creation/update of the associated document, we
      // can't guarantee that the attachment is present when the attachment reference property is created/updated for it, so only
      // validate it if it's present. The good news is that, because adding an attachment is a two part operation (create/update the
      // document and add the attachment), the sync function will be run once for each part, thus ensuring the content is verified once
      // both parts have been synced.
      if (doc._attachments && doc._attachments[itemValue]) {
        var attachment = doc._attachments[itemValue];

        var supportedContentTypes = resolveItemConstraint(validator.supportedContentTypes);
        if (supportedContentTypes && supportedContentTypes.indexOf(attachment.content_type) < 0) {
          validationErrors.push('attachment reference "' + buildItemPath(itemStack) + '" must have a supported content type (' + supportedContentTypes.join(',') + ')');
        }

        var maximumSize = resolveItemConstraint(validator.maximumSize);
        if (!utils.isValueNullOrUndefined(maximumSize) && attachment.length > maximumSize) {
          validationErrors.push('attachment reference "' + buildItemPath(itemStack) + '" must not be larger than ' + maximumSize + ' bytes');
        }
      }
    }

    return validationErrors;
  }

  function validateAttachments(doc, docDefinition) {
    var validationErrors = [ ];
    var attachmentConstraints = utils.resolveDocumentConstraint(docDefinition.attachmentConstraints);

    var maximumAttachmentCount =
      attachmentConstraints ? utils.resolveDocumentConstraint(attachmentConstraints.maximumAttachmentCount) : null;
    var maximumIndividualAttachmentSize =
      attachmentConstraints ? utils.resolveDocumentConstraint(attachmentConstraints.maximumIndividualSize) : null;
    var maximumTotalAttachmentSize =
      attachmentConstraints ? utils.resolveDocumentConstraint(attachmentConstraints.maximumTotalSize) : null;

    var supportedExtensions =
      attachmentConstraints ? utils.resolveDocumentConstraint(attachmentConstraints.supportedExtensions) : null;
    var supportedExtensionsRegex = supportedExtensions ? buildSupportedExtensionsRegex(supportedExtensions) : null;

    var supportedContentTypes =
      attachmentConstraints ? utils.resolveDocumentConstraint(attachmentConstraints.supportedContentTypes) : null;

    var requireAttachmentReferences =
      attachmentConstraints ? utils.resolveDocumentConstraint(attachmentConstraints.requireAttachmentReferences) : false;

    var filenameRegexPattern =
      attachmentConstraints ? utils.resolveDocumentConstraint(attachmentConstraints.filenameRegexPattern) : null;

    var totalSize = 0;
    var attachmentCount = 0;
    for (var attachmentName in doc._attachments) {
      attachmentCount++;

      var attachment = doc._attachments[attachmentName];

      var attachmentSize = attachment.length;
      totalSize += attachmentSize;

      var attachmentRefValidator = attachmentReferenceValidators[attachmentName];

      if (requireAttachmentReferences && utils.isValueNullOrUndefined(attachmentRefValidator)) {
        validationErrors.push('attachment ' + attachmentName + ' must have a corresponding attachment reference property');
      }

      if (utils.isValueAnInteger(maximumIndividualAttachmentSize) && attachmentSize > maximumIndividualAttachmentSize) {
        // If this attachment is owned by an attachment reference property, that property's size constraint (if any) takes precedence
        if (utils.isValueNullOrUndefined(attachmentRefValidator) || !utils.isValueAnInteger(attachmentRefValidator.maximumSize)) {
          validationErrors.push('attachment ' + attachmentName + ' must not exceed ' + maximumIndividualAttachmentSize + ' bytes');
        }
      }

      if (supportedExtensionsRegex && !supportedExtensionsRegex.test(attachmentName)) {
        // If this attachment is owned by an attachment reference property, that property's extensions constraint (if any) takes
        // precedence
        if (utils.isValueNullOrUndefined(attachmentRefValidator) ||
            utils.isValueNullOrUndefined(attachmentRefValidator.supportedExtensions)) {
          validationErrors.push('attachment "' + attachmentName + '" must have a supported file extension (' + supportedExtensions.join(',') + ')');
        }
      }

      if (supportedContentTypes && supportedContentTypes.indexOf(attachment.content_type) < 0) {
        // If this attachment is owned by an attachment reference property, that property's content types constraint (if any) takes
        // precedence
        if (utils.isValueNullOrUndefined(attachmentRefValidator) ||
            utils.isValueNullOrUndefined(attachmentRefValidator.supportedContentTypes)) {
          validationErrors.push('attachment "' + attachmentName + '" must have a supported content type (' + supportedContentTypes.join(',') + ')');
        }
      }

      if (filenameRegexPattern && !filenameRegexPattern.test(attachmentName)) {
        // If this attachment is owned by an attachment reference property, that property's regular expression pattern
        // constraint (if any) takes precedence
        if (utils.isValueNullOrUndefined(attachmentRefValidator) ||
            utils.isValueNullOrUndefined(attachmentRefValidator.supportedContentTypes)) {
          validationErrors.push('attachment "' + attachmentName + '" must conform to expected pattern ' + filenameRegexPattern);
        }
      }
    }

    if (utils.isValueAnInteger(maximumTotalAttachmentSize) && totalSize > maximumTotalAttachmentSize) {
      validationErrors.push('documents of this type must not have a combined attachment size greater than ' + maximumTotalAttachmentSize + ' bytes');
    }

    if (utils.isValueAnInteger(maximumAttachmentCount) && attachmentCount > maximumAttachmentCount) {
      validationErrors.push('documents of this type must not have more than ' + maximumAttachmentCount + ' attachments');
    }

    if (!utils.resolveDocumentConstraint(docDefinition.allowAttachments) && attachmentCount > 0) {
      validationErrors.push('document type does not support attachments');
    }

    return validationErrors;
  }

  // A regular expression that matches one of the given file extensions
  function buildSupportedExtensionsRegex(extensions) {
    // Note that this regex uses double quotes rather than single quotes as a workaround to https://github.com/Kashoo/synctos/issues/116
    return new RegExp("\\.(" + extensions.join("|") + ")$", "i");
  }
}
