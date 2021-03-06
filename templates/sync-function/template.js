// This sync function for Couchbase Sync Gateway was generated by synctos: https://github.com/Kashoo/synctos
function synctos(doc, oldDoc) {
  // Whether the given value is either null or undefined
  function isValueNullOrUndefined(value) {
    return value === void 0 || value === null;
  }

  // Whether the given document is missing/nonexistant (i.e. null or undefined) or deleted (its "_deleted" property is true)
  function isDocumentMissingOrDeleted(candidate) {
    return isValueNullOrUndefined(candidate) || candidate._deleted;
  }

  // A property validator that is suitable for use on type identifier properties. Ensures the value is a string, is neither null nor
  // undefined, is not an empty string and cannot be modified.
  var typeIdValidator = {
    type: 'string',
    required: true,
    mustNotBeEmpty: true,
    immutable: true
  };

  // A type filter that matches on the document's type property
  function simpleTypeFilter(doc, oldDoc, candidateDocType) {
    if (oldDoc) {
      if (doc._deleted) {
        return oldDoc.type === candidateDocType;
      } else {
        return doc.type === oldDoc.type && oldDoc.type === candidateDocType;
      }
    } else {
      return doc.type === candidateDocType;
    }
  }

  // Retrieves the old doc's effective value. If it is null, undefined or its "_deleted" property is true, returns null. Otherwise, returns
  // the value of the "oldDoc" parameter.
  function resolveOldDoc() {
    return !isDocumentMissingOrDeleted(oldDoc) ? oldDoc : null;
  }

  // Add the specified padding to the right of the given string value until its length matches the desired length
  function padRight(value, desiredLength, padding) {
    while (value.length < desiredLength) {
      value += padding;
    }

    return value;
  }

  // Determine if a given value is an integer. Exists because Number.isInteger is not supported by Sync Gateway's JavaScript engine.
  function isValueAnInteger(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
  }

  // Retrieves the effective value of a top-level document constraint (e.g. "channels", "documentIdRegexPattern", "accessAssignments")
  function resolveDocumentConstraint(constraintDefinition) {
    if (typeof constraintDefinition === 'function') {
      return constraintDefinition(doc, resolveOldDoc());
    } else {
      return constraintDefinition;
    }
  }

  // Converts a given value to a JSON string. Exists because JSON.stringify is not supported by all versions of Sync
  // Gateway's JavaScript engine.
  var jsonStringify =
    (typeof JSON !== 'undefined' && JSON.stringify) ? JSON.stringify : importSyncFunctionFragment('json-stringify-module.js');

  var utils = {
    isDocumentMissingOrDeleted: isDocumentMissingOrDeleted,
    isValueAnInteger: isValueAnInteger,
    isValueNullOrUndefined: isValueNullOrUndefined,
    jsonStringify: jsonStringify,
    padRight: padRight,
    resolveOldDoc: resolveOldDoc,
    resolveDocumentConstraint: resolveDocumentConstraint
  };

  // The document authorization module is responsible for verifying the user's permissions (e.g. roles, channels)
  var authorizationModule = importSyncFunctionFragment('./authorization-module.js')(utils);

  // The document validation module is responsible for verifying the document's contents
  var validationModule = importSyncFunctionFragment('./validation-module.js')(utils, simpleTypeFilter, typeIdValidator);

  // The access assignment module is responsible for dynamically assigning channels and roles to users
  var accessAssignmentModule = importSyncFunctionFragment('./access-assignment-module.js')(utils);

  // The expiry module is responsible for controlling when the document will expire and be purged from the DB
  var expiryModule = importSyncFunctionFragment('./expiry-module.js')(utils);

  var rawDocDefinitions = $DOCUMENT_DEFINITIONS_PLACEHOLDER$;

  var docDefinitions;
  if (typeof rawDocDefinitions === 'function') {
    docDefinitions = rawDocDefinitions();
  } else {
    docDefinitions = rawDocDefinitions;
  }

  function getDocumentType() {
    var effectiveOldDoc = resolveOldDoc();

    for (var docType in docDefinitions) {
      var docDefn = docDefinitions[docType];
      if (docDefn.typeFilter(doc, effectiveOldDoc, docType)) {
        return docType;
      }
    }

    // The document type does not exist
    return null;
  }


  // Now put the pieces together
  var theDocType = getDocumentType();

  if (isValueNullOrUndefined(theDocType)) {
    if (doc._deleted) {
      // Attempting to delete a document whose type is unknown. This may occur when bucket access/sharing
      // (https://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/shared-bucket-access.html)
      // is enabled and the document was deleted via the Couchbase SDK or if the document belongs to a type that existed
      // in a previous version of the document definitions but has since been removed. Verify that the user has
      // administrator access and then simply assign the public channel
      // (https://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/channels/index.html#special-channels)
      // to the document so that other users will get a 404 Not Found if they attempt to fetch (i.e. "view") the deleted
      // document rather than a 403 Forbidden.
      requireAccess([ ]); // This test can only be satisfied via the admin API
      channel('!');

      return;
    } else {
      var errorMessage = 'Unknown document type';
      var error = new Error(errorMessage);
      error.forbidden = errorMessage;

      throw error;
    }
  }

  var theDocDefinition = docDefinitions[theDocType];

  var customActionMetadata = {
    documentTypeId: theDocType,
    documentDefinition: theDocDefinition
  };

  if (theDocDefinition.customActions && typeof theDocDefinition.customActions.onTypeIdentificationSucceeded === 'function') {
    theDocDefinition.customActions.onTypeIdentificationSucceeded(doc, oldDoc, customActionMetadata);
  }

  customActionMetadata.authorization = authorizationModule.authorize(doc, oldDoc, theDocDefinition);

  if (theDocDefinition.customActions && typeof theDocDefinition.customActions.onAuthorizationSucceeded === 'function') {
    theDocDefinition.customActions.onAuthorizationSucceeded(doc, oldDoc, customActionMetadata);
  }

  validationModule.validateDoc(doc, oldDoc, theDocDefinition, theDocType);

  if (theDocDefinition.customActions && typeof theDocDefinition.customActions.onValidationSucceeded === 'function') {
    theDocDefinition.customActions.onValidationSucceeded(doc, oldDoc, customActionMetadata);
  }

  if (theDocDefinition.accessAssignments && !doc._deleted) {
    var accessAssignments = accessAssignmentModule.assignUserAccess(doc, oldDoc, theDocDefinition);
    if (accessAssignments.length > 0) {
      customActionMetadata.accessAssignments = accessAssignments;

      if (theDocDefinition.customActions &&
          typeof theDocDefinition.customActions.onAccessAssignmentsSucceeded === 'function') {
        theDocDefinition.customActions.onAccessAssignmentsSucceeded(doc, oldDoc, customActionMetadata);
      }
    }
  }

  if (!isValueNullOrUndefined(theDocDefinition.expiry) && !doc._deleted) {
    customActionMetadata.expiryDate = expiryModule.setDocExpiry(doc, oldDoc, theDocDefinition.expiry);

    if (theDocDefinition.customActions &&
        typeof theDocDefinition.customActions.onExpiryAssignmentSucceeded === 'function') {
      theDocDefinition.customActions.onExpiryAssignmentSucceeded(doc, oldDoc, customActionMetadata);
    }
  }

  // Getting here means the document revision is authorized and valid, and the appropriate channel(s) should now be assigned
  var allDocChannels = authorizationModule.getAllDocChannels(theDocDefinition);
  channel(allDocChannels);
  customActionMetadata.documentChannels = allDocChannels;

  if (theDocDefinition.customActions && typeof theDocDefinition.customActions.onDocumentChannelAssignmentSucceeded === 'function') {
    theDocDefinition.customActions.onDocumentChannelAssignmentSucceeded(doc, oldDoc, customActionMetadata);
  }
}
