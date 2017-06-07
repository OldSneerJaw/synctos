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
      allValidationErrors[docType] = validateDocDefinition(docType, docDefinition);
    }
  }

  return allValidationErrors;
}

var supportedPermissionOperations = new Set([ 'view', 'add', 'replace', 'remove', 'write' ]);
var supportedCustomActionEvents = new Set([
  'onTypeIdentificationSucceeded',
  'onAuthorizationSucceeded',
  'onValidationSucceeded',
  'onAccessAssignmentsSucceeded',
  'onDocumentChannelAssignmentSucceeded'
]);

function validateDocDefinition(docType, docDefinition) {
  var validationErrors = [ ];
  var hasTypeFilter = false;
  var hasPermissionGrant = false;
  var hasPropertyValidators = false;
  for (var propertyName in docDefinition) {
    var propertyValue = docDefinition[propertyName];

    if (propertyValue === null) {
      // No need to validate null properties
      continue;
    }

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
        if (propertyValue instanceof Array) {
          validateAccessAssignments(propertyValue);
        } else if (typeof(propertyValue) !== 'function') {
          validationErrors.push('the "accessAssignments" property is not an array or a function');
        }
        break;
      case 'customActions':
        if (isAnObject(propertyValue)) {
          validateCustomActions(propertyValue);
        } else {
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
    validateAttachmentIntegerConstraint('maximumAttachmentCount', attachmentConstraintsDefinition.maximumAttachmentCount);
    validateAttachmentIntegerConstraint('maximumIndividualSize', attachmentConstraintsDefinition.maximumIndividualSize);
    validateAttachmentIntegerConstraint('maximumTotalSize', attachmentConstraintsDefinition.maximumTotalSize);

    if (Number.isInteger(attachmentConstraintsDefinition.maximumIndividualSize) &&
        Number.isInteger(attachmentConstraintsDefinition.maximumTotalSize) &&
        attachmentConstraintsDefinition.maximumIndividualSize > attachmentConstraintsDefinition.maximumTotalSize) {
      validationErrors.push('the "attachmentConstraints" property\'s "maximumIndividualSize" is greater than "maximumTotalSize"');
    }

    validateAttachmentListConstraint('supportedExtensions', attachmentConstraintsDefinition.supportedExtensions);
    validateAttachmentListConstraint('supportedContentTypes', attachmentConstraintsDefinition.supportedContentTypes);

    var requireAttachmentReferences = attachmentConstraintsDefinition.requireAttachmentReferences;
    if (!isUndefined(requireAttachmentReferences) && typeof(requireAttachmentReferences) !== 'boolean') {
      validationErrors.push('the "attachmentConstraints" specifies a "requireAttachmentReferences" property that is not a boolean');
    }
  }

  function validateAttachmentIntegerConstraint(propertyName, propertyValue) {
    if (!isUndefined(propertyValue)) {
      if (!Number.isInteger(propertyValue)) {
        validationErrors.push('the "attachmentConstraints" specifies a "' + propertyName + '" property that is not an integer');
      } else if (propertyValue <= 0) {
        validationErrors.push('the "attachmentConstraints" specifies a "' + propertyName + '" property that is not a positive number');
      }
    }
  }

  function validateAttachmentListConstraint(propertyName, propertyValue) {
    if (!isUndefined(propertyValue)) {
      if (propertyValue instanceof Array) {
        for (var elementIndex = 0; elementIndex < propertyValue.length; elementIndex++) {
          var elementValue = propertyValue[elementIndex];
          if (typeof(elementValue) !== 'string') {
            validationErrors.push('the "attachmentConstraints" property\'s "' + propertyName + '" contains an element that is not a string: ' + JSON.stringify(elementValue));
          }
        }
      } else {
        validationErrors.push('the "attachmentConstraints" specifies a "' + propertyName + '" property that is not an array');
      }
    }
  }

  function validateAccessAssignments(accessAssignmentsDefinition) {
    for (var assignmentIndex = 0; assignmentIndex < accessAssignmentsDefinition.length; assignmentIndex++) {
      var accessAssignment = accessAssignmentsDefinition[assignmentIndex];
      if (isAnObject(accessAssignment)) {
        validateAccessAssignment(accessAssignment, assignmentIndex);
      } else {
        validationErrors.push('the "accessAssignments" property specifies an element that is not an object');
      }
    }
  }

  function validateAccessAssignment(accessAssignment, assignmentIndex) {
    if (accessAssignment.type === 'role') {
      validateRolesAssignment(accessAssignment, assignmentIndex);
    } else if (accessAssignment.type === 'channel' || accessAssignment.type === null || isUndefined(accessAssignment.type)) {
      validateChannelsAssignment(accessAssignment, assignmentIndex);
    } else {
      validationErrors.push('the "accessAssignments" element ' + assignmentIndex + ' has an invalid "type": ' + JSON.stringify(accessAssignment.type));
    }
  }

  function validateRolesAssignment(accessAssignment, assignmentIndex) {
    if (isUndefined(accessAssignment.roles)) {
      validationErrors.push('the "accessAssignments" element ' + assignmentIndex + ' is missing its "roles" property');
    } else {
      validateAccessAssignmentEntities(accessAssignment, 'roles', assignmentIndex);
    }

    if (isUndefined(accessAssignment.users)) {
      validationErrors.push('the "accessAssignments" element ' + assignmentIndex + ' is missing its "users" property');
    } else {
      validateAccessAssignmentEntities(accessAssignment, 'users', assignmentIndex);
    }
  }

  function validateChannelsAssignment(accessAssignment, assignmentIndex) {
    if (!isUndefined(accessAssignment.roles)) {
      validateAccessAssignmentEntities(accessAssignment, 'roles', assignmentIndex);
    }

    if (!isUndefined(accessAssignment.users)) {
      validateAccessAssignmentEntities(accessAssignment, 'users', assignmentIndex);
    }

    if (isUndefined(accessAssignment.users) && isUndefined(accessAssignment.roles)) {
      validationErrors.push('the "accessAssignments" element ' + assignmentIndex + ' does not include either a "roles" or "users" property');
    }

    if (isUndefined(accessAssignment.channels)) {
      validationErrors.push('the "accessAssignments" element ' + assignmentIndex + ' is missing its "channels" property');
    } else {
      validateAccessAssignmentEntities(accessAssignment, 'channels', assignmentIndex);
    }
  }

  function validateAccessAssignmentEntities(accessAssignment, entitiesPropertyName, assignmentIndex) {
    var entitiesProperty = accessAssignment[entitiesPropertyName];
    if (entitiesProperty instanceof Array) {
      for (var elementIndex = 0; elementIndex < entitiesProperty.length; elementIndex++) {
        var elementValue = entitiesProperty[elementIndex];
        if (typeof(elementValue) !== 'string') {
          validationErrors.push('the "accessAssignments" element ' + assignmentIndex + ' "' + entitiesPropertyName + '" property has an element that is not a string: ' + JSON.stringify(elementValue));
        }
      }
    } else if (typeof(entitiesProperty) !== 'string' && typeof(entitiesProperty) !== 'function') {
      validationErrors.push('the "accessAssignments" element ' + assignmentIndex + ' has a "' + entitiesPropertyName + '" property that is not an array, string or function');
    }
  }

  function validateCustomActions(customActionsDefinition) {
    for (var customActionName in customActionsDefinition) {
      var customActionFunc = customActionsDefinition[customActionName];

      if (!supportedCustomActionEvents.has(customActionName)) {
        validationErrors.push('the "customActions" property specifies an invalid event: ' + JSON.stringify(customActionName));
      } else if (typeof(customActionFunc) !== 'function') {
        validationErrors.push('the "customActions" property contains a value for the "' + customActionName + '" event that is not a function');
      }
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

function isUndefined(value) {
  return typeof(value) === 'undefined';
}
