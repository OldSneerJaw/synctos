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

var propertiesValidator = require('./document-definition-properties-validator.js');

function validate(rawDocDefinitions) {
  var docDefinitions;
  try {
    docDefinitions = resolveDocDefinitions(rawDocDefinitions);
  } catch (ex) {
    return 'Document definitions threw an exception: ' + ex.message;
  }

  if (!isAnObject(docDefinitions)) {
    return 'Document definitions are not specified as an object';
  }

  var allValidationErrors = { };

  for (var docType in docDefinitions) {
    var docDefinition = docDefinitions[docType];

    if (!isAnObject(docDefinition)) {
      allValidationErrors[docType] = [ 'not specified as an object' ];
    } else {
      allValidationErrors[docType] = validateDocDefinition(docDefinition);
    }
  }

  return allValidationErrors;
}

var supportedChannelOperations = { view: true, add: true, replace: true, remove: true, write: true };
var supportedRoleOrUserOperations = { add: true, replace: true, remove: true, write: true };
var supportedCustomActionEvents = {
  onTypeIdentificationSucceeded: true,
  onAuthorizationSucceeded: true,
  onValidationSucceeded: true,
  onAccessAssignmentsSucceeded: true,
  onDocumentChannelAssignmentSucceeded: true
};
var supportedRoleAssignmentProperties = { type: true, roles: true, users: true };
var supportedChannelAssignmentProperties = { type: true, roles: true, users: true, channels: true };

function validateDocDefinition(docDefinition) {
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
          validatePermissions('channels', propertyValue, supportedChannelOperations);
        } else if (typeof(propertyValue) !== 'function') {
          validationErrors.push('the "channels" property is not an object or a function');
        }
        break;
      case 'authorizedRoles':
        hasPermissionGrant = true;
        if (isAnObject(propertyValue)) {
          validatePermissions('authorizedRoles', propertyValue, supportedRoleOrUserOperations);
        } else if (typeof(propertyValue) !== 'function') {
          validationErrors.push('the "authorizedRoles" property is not an object or a function');
        }
        break;
      case 'authorizedUsers':
        hasPermissionGrant = true;
        if (isAnObject(propertyValue)) {
          validatePermissions('authorizedUsers', propertyValue, supportedRoleOrUserOperations);
        } else if (typeof(propertyValue) !== 'function') {
          validationErrors.push('the "authorizedUsers" property is not an object or a function');
        }
        break;
      case 'propertyValidators':
        hasPropertyValidators = true;
        if (isAnObject(propertyValue)) {
          var propertiesValidationErrors = propertiesValidator.validate(docDefinition, propertyValue);
          validationErrors = validationErrors.concat(propertiesValidationErrors);
        } else if (typeof(propertyValue) !== 'function') {
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
        } else if (docDefinition.immutable === true && (docDefinition.cannotReplace === true || docDefinition.cannotDelete === true)) {
          validationErrors.push('the "immutable" property should not be enabled when either "cannotReplace" or "cannotDelete" are also enabled');
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
        if (!docDefinition.allowAttachments) {
          validationErrors.push('the "attachmentConstraints" property is defined but attachments have not been enabled via the "allowAttachments" property');
        }

        if (isAnObject(propertyValue)) {
          validateAttachmentConstraints(propertyValue);
        } else if (typeof(propertyValue) !== 'function') {
          validationErrors.push('the "attachmentConstraints" property is not an object or a function');
        }
        break;
      case 'accessAssignments':
        if (propertyValue instanceof Array) {
          validateAccessAssignments(propertyValue);
        } else {
          validationErrors.push('the "accessAssignments" property is not an array');
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

  function validatePermissions(permissionsCategory, permissionsDefinition, supportedPermissionOperations) {
    var hasPermissionOperations = false;
    for (var permissionOperation in permissionsDefinition) {
      hasPermissionOperations = true;
      var permissions = permissionsDefinition[permissionOperation];

      if (permissionOperation === 'replace' && (docDefinition.immutable === true || docDefinition.cannotReplace === true)) {
        validationErrors.push('the "' + permissionsCategory + '" property\'s "' + permissionOperation + '" operation type is invalid when the document type is immutable');
      } else if (permissionOperation === 'remove' && (docDefinition.immutable === true || docDefinition.cannotDelete === true)) {
        validationErrors.push('the "' + permissionsCategory + '" property\'s "' + permissionOperation + '" operation type is invalid when the document type is immutable');
      }

      if (!supportedPermissionOperations[permissionOperation]) {
        validationErrors.push('the "' + permissionsCategory + '" property\'s "' + permissionOperation + '" operation type is not supported');
      } else if (permissions instanceof Array) {
        if (permissions.length < 1) {
          validationErrors.push('the "' + permissionsCategory + '" property\'s "' + permissionOperation + '" operation does not contain any elements');
        }

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

    if (!hasPermissionOperations) {
      validationErrors.push('the "' + permissionsCategory + '" property does not specify any operation types');
    }
  }

  function validateAttachmentConstraints(attachmentConstraintsDefinition) {
    for (var attachmentConstraintPropertyName in attachmentConstraintsDefinition) {
      var attachmentConstraintPropertyValue = attachmentConstraintsDefinition[attachmentConstraintPropertyName];

      switch (attachmentConstraintPropertyName) {
        case 'maximumAttachmentCount':
          validateAttachmentIntegerConstraint('maximumAttachmentCount', attachmentConstraintPropertyValue);
          break;
        case 'maximumIndividualSize':
          validateAttachmentIntegerConstraint('maximumIndividualSize', attachmentConstraintPropertyValue);
          break;
        case 'maximumTotalSize':
          validateAttachmentIntegerConstraint('maximumTotalSize', attachmentConstraintPropertyValue);
          break;
        case 'supportedExtensions':
          validateAttachmentListConstraint('supportedExtensions', attachmentConstraintPropertyValue);
          break;
        case 'supportedContentTypes':
          validateAttachmentListConstraint('supportedContentTypes', attachmentConstraintPropertyValue);
          break;
        case 'requireAttachmentReferences':
          if (typeof(attachmentConstraintPropertyValue) !== 'boolean') {
            validationErrors.push('the "attachmentConstraints" specifies a "requireAttachmentReferences" property that is not a boolean');
          }
          break;
        default:
          validationErrors.push('the "attachmentConstraints" contains an unsupported property: "' + attachmentConstraintPropertyName + '"');
          break;
      }
    }

    if (isInteger(attachmentConstraintsDefinition.maximumIndividualSize) &&
        isInteger(attachmentConstraintsDefinition.maximumTotalSize) &&
        attachmentConstraintsDefinition.maximumIndividualSize > attachmentConstraintsDefinition.maximumTotalSize) {
      validationErrors.push('the "attachmentConstraints" property\'s "maximumIndividualSize" is greater than "maximumTotalSize"');
    }
  }

  function validateAttachmentIntegerConstraint(propertyName, propertyValue) {
    if (!isInteger(propertyValue)) {
      validationErrors.push('the "attachmentConstraints" specifies a "' + propertyName + '" property that is not an integer');
    } else if (propertyValue < 1) {
      validationErrors.push('the "attachmentConstraints" specifies a "' + propertyName + '" property that is not a positive number');
    }
  }

  function validateAttachmentListConstraint(propertyName, propertyValue) {
    if (propertyValue instanceof Array) {
      if (propertyValue.length < 1) {
        validationErrors.push('the "attachmentConstraints" specifies a "' + propertyName + '" property that does not contain any elements');
      }

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

  function validateAccessAssignments(accessAssignmentsDefinition) {
    for (var assignmentIndex = 0; assignmentIndex < accessAssignmentsDefinition.length; assignmentIndex++) {
      var accessAssignment = accessAssignmentsDefinition[assignmentIndex];
      if (isAnObject(accessAssignment)) {
        validateAccessAssignment(accessAssignment, assignmentIndex);
      } else {
        validationErrors.push('the "accessAssignments" property specifies an element that is not an object: ' + JSON.stringify(accessAssignment));
      }
    }
  }

  function validateAccessAssignment(accessAssignment, assignmentIndex) {
    if (accessAssignment.type === 'role') {
      validateAccessAssignmentProperties(accessAssignment, assignmentIndex, supportedRoleAssignmentProperties);
      validateRolesAssignment(accessAssignment, assignmentIndex);
    } else if (accessAssignment.type === 'channel' || accessAssignment.type === null || isUndefined(accessAssignment.type)) {
      validateAccessAssignmentProperties(accessAssignment, assignmentIndex, supportedChannelAssignmentProperties);
      validateChannelsAssignment(accessAssignment, assignmentIndex);
    } else {
      validationErrors.push('the "accessAssignments" element ' + assignmentIndex + ' has an invalid "type": ' + JSON.stringify(accessAssignment.type));
    }
  }

  function validateAccessAssignmentProperties(accessAssignment, assignmentIndex, supportedProperties) {
    for (var assignmentPropertyName in accessAssignment) {
      if (!supportedProperties[assignmentPropertyName]) {
        validationErrors.push('the "accessAssignments" element ' + assignmentIndex + ' has an invalid property: ' + JSON.stringify(assignmentPropertyName));
      }
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
      if (entitiesProperty.length < 1) {
        validationErrors.push('the "accessAssignments" element ' + assignmentIndex + ' has an empty "' + entitiesPropertyName + '" property');
      }

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

      if (!supportedCustomActionEvents[customActionName]) {
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
  return value !== null && typeof(value) === 'object' && !(value instanceof Array);
}

function isUndefined(value) {
  return typeof(value) === 'undefined';
}

// Determine if a given value is an integer. Exists as a failsafe because Number.isInteger does not exist in older versions of Node.js
// (e.g. 0.10.x).
function isInteger(value) {
  if (typeof(Number.isInteger) === 'function') {
    return Number.isInteger(value);
  } else {
    return typeof(value) === 'number' && isFinite(value) && Math.floor(value) === value;
  }
}
