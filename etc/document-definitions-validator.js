/**
 * Validates that the given document definitions object or function conforms to specifications.
 *
 * @param {Object|function} rawDocDefinitions Either an object that contains document definitions or a function that, when called, produces
 *                                            a document definitions object
 *
 * @returns {Object|string} Either an object where each element contains the list of validation errors for a document type, or if the given
 *                          document definitions could not be resolved to an object, a string describing the problem
 */
exports.validate = validate;

function validate(rawDocDefinitions) {
  var docDefinitions = resolveDocDefinitions(rawDocDefinitions);

  if (!isAnObject(docDefinitions)) {
    return 'Document definitions are not specified as an object';
  }

  var allValidationErrors = { };

  for (var docType in docDefinitions) {
    var docDefinition = docDefinitions[docType];

    if (!isAnObject(docDefinition)) {
      allValidationErrors[docType] = [ 'not specified as an object' ];
    } else {
      allValidationErrors[docType] = validateDocType(docType, docDefinition);
    }
  }

  return allValidationErrors;
}

var supportedPermissionOperations = new Set([ 'view', 'add', 'replace', 'remove', 'write' ]);

function validateDocType(docType, docDefinition) {
  var validationErrors = [ ];
  var hasTypeFilter = false;
  var hasPermissionGrant = false;
  var hasPropertyValidators = false;
  for (var propertyName in docDefinition) {
    var propertyValue = docDefinition[propertyName];

    switch(propertyName) {
      case 'typeFilter':
        hasTypeFilter = true;
        if (typeof(propertyValue) !== 'function') {
          validationErrors.push('the "typeFilter" property is not a function');
        }
        break;
      case 'channels':
        hasPermissionGrant = true;
        if (isAnObject(propertyValue)) {
          validatePermissions('channels', propertyValue);
        } else if (typeof(propertyValue) !== 'function') {
          validationErrors.push('the "channels" property is not an object or a function');
        }
        break;
      case 'authorizedRoles':
        hasPermissionGrant = true;
        if (isAnObject(propertyValue)) {
          validatePermissions('authorizedRoles', propertyValue);
        } else if (typeof(propertyValue) !== 'function') {
          validationErrors.push('the "authorizedRoles" property is not an object or a function');
        }
        break;
      case 'authorizedUsers':
        hasPermissionGrant = true;
        if (isAnObject(propertyValue)) {
          validatePermissions('authorizedUsers', propertyValue);
        } else if (typeof(propertyValue) !== 'function') {
          validationErrors.push('the "authorizedUsers" property is not an object or a function');
        }
        break;
      case 'propertyValidators':
        hasPropertyValidators = true;
        if (!isAnObject(propertyValue) && typeof(propertyValue) !== 'function') {
          validationErrors.push('the "propertyValidators" property is not an object or a function');
        }
        break;
      case 'allowUnknownProperties':
        if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
          validationErrors.push('the "allowUnknownProperties" property is not a boolean or a function');
        }
        break;
      case 'immutable':
        if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
          validationErrors.push('the "immutable" property is not a boolean or a function');
        }
        break;
      case 'cannotReplace':
        if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
          validationErrors.push('the "cannotReplace" property is not a boolean or a function');
        }
        break;
      case 'cannotDelete':
        if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
          validationErrors.push('the "cannotDelete" property is not a boolean or a function');
        }
        break;
      case 'allowAttachments':
        if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
          validationErrors.push('the "allowAttachments" property is not a boolean or a function');
        }
        break;
      case 'attachmentConstraints':
        if (isAnObject(propertyValue)) {
          if (!docDefinition.allowAttachments) {
            validationErrors.push('the "attachmentConstraints" property is defined but attachments have not been enabled via the "allowAttachments" property');
          }

          validateAttachmentConstraints(propertyValue);
        } else if (typeof(propertyValue) !== 'function') {
          validationErrors.push('the "attachmentConstraints" property is not an object or a function');
        }
        break;
      case 'accessAssignments':
        if (!(propertyValue instanceof Array) && typeof(propertyValue) !== 'string' && typeof(propertyValue) !== 'function') {
          validationErrors.push('the "accessAssignments" property is not an array or a string or a function');
        }
        break;
      case 'customActions':
        if (!isAnObject(propertyValue)) {
          validationErrors.push('the "customActions" property is not an object');
        }
        break;
      default:
        validationErrors.push('includes unsupported property: "' + propertyName + '"');
        break;
    }
  }

  if (!hasTypeFilter) {
    validationErrors.push('missing a "typeFilter" property');
  }
  if (!hasPermissionGrant) {
    validationErrors.push('missing a "channels", "authorizedRoles" or "authorizedUsers" property');
  }
  if (!hasPropertyValidators) {
    validationErrors.push('missing a "propertyValidators" property');
  }

  function validatePermissions(permissionsCategory, permissionsDefinition) {
    for (var permissionOperation in permissionsDefinition) {
      var permissions = permissionsDefinition[permissionOperation];

      if (!supportedPermissionOperations.has(permissionOperation)) {
        validationErrors.push('the "' + permissionsCategory + '" property\'s "' + permissionOperation + '" operation type is not supported');
      } else if (permissions instanceof Array) {
        for (var permissionIndex = 0; permissionIndex < permissions.length; permissionIndex++) {
          var permission = permissions[permissionIndex];
          if (typeof(permission) !== 'string') {
            validationErrors.push('the "' + permissionsCategory + '" property\'s "' + permissionOperation + '" operation contains an element that is not a string: ' + JSON.stringify(permission));
          }
        }
      } else if (typeof(permissions) !== 'string') {
        validationErrors.push('the "' + permissionsCategory + '" property\'s "' + permissionOperation + '" operation is not a string or array');
      }
    }
  }

  function validateAttachmentConstraints(attachmentConstraintsDefinition) {
    var maximumAttachmentCount = attachmentConstraintsDefinition.maximumAttachmentCount;
    if (typeof(maximumAttachmentCount) !== 'undefined') {
      if (!Number.isInteger(maximumAttachmentCount) || maximumAttachmentCount < 0) {
        validationErrors.push('the "attachmentConstraints" specifies a "maximumAttachmentCount" property that is not a positive integer');
      }
    }

    var maximumIndividualSize = attachmentConstraintsDefinition.maximumIndividualSize;
    if (typeof(maximumIndividualSize) !== 'undefined') {
      if (!Number.isInteger(maximumIndividualSize) || maximumIndividualSize <= 0) {
        validationErrors.push('the "attachmentConstraints" specifies a "maximumIndividualSize" property that is not a non-negative integer');
      }
    }

    var maximumTotalSize = attachmentConstraintsDefinition.maximumTotalSize;
    if (typeof(maximumTotalSize) !== 'undefined') {
      if (!Number.isInteger(maximumTotalSize) || maximumTotalSize <= 0) {
        validationErrors.push('the "attachmentConstraints" specifies a "maximumTotalSize" property that is not a non-negative integer');
      }
    }

    var supportedExtensions = attachmentConstraintsDefinition.supportedExtensions;
    if (typeof(supportedExtensions) !== 'undefined') {
      if (supportedExtensions instanceof Array) {
        for (var extensionIndex = 0; extensionIndex < supportedExtensions.length; extensionIndex++) {
          var extension = supportedExtensions[extensionIndex];
          if (typeof(extension) !== 'string') {
            validationErrors.push('the "attachmentConstraints" property\'s "supportedExtensions" contains an element that is not a string: ' + JSON.stringify(extension));
          }
        }
      } else {
        validationErrors.push('the "attachmentConstraints" specifies a "supportedExtensions" property that is not an array');
      }
    }

    var supportedContentTypes = attachmentConstraintsDefinition.supportedContentTypes;
    if (typeof(supportedContentTypes) !== 'undefined') {
      if (supportedContentTypes instanceof Array) {
        for (var contentTypeIndex = 0; contentTypeIndex < supportedContentTypes.length; contentTypeIndex++) {
          var contentType = supportedContentTypes[contentTypeIndex];
          if (typeof(contentType) !== 'string') {
            validationErrors.push('the "attachmentConstraints" property\'s "supportedContentTypes" contains an element that is not a string: ' + JSON.stringify(contentType));
          }
        }
      } else {
        validationErrors.push('the "attachmentConstraints" specifies a "supportedContentTypes" property that is not an array');
      }
    }

    var requireAttachmentReferences = attachmentConstraintsDefinition.requireAttachmentReferences;
    if (typeof(requireAttachmentReferences) !== 'undefined' && typeof(requireAttachmentReferences) !== 'boolean') {
      validationErrors.push('the "attachmentConstraints" specifies a "requireAttachmentReferences" property that is not a boolean');
    }
  }

  return validationErrors;
}

function resolveDocDefinitions(rawDocDefinitions) {
  return (typeof(rawDocDefinitions) === 'function') ? rawDocDefinitions() : rawDocDefinitions;
}

function isAnObject(value) {
  return typeof(value) === 'object' && !(value instanceof Array);
}
