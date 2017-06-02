exports.validate = validate;

function validate(rawDocDefinitions) {
  var docDefinitions = resolveDocDefinitions(rawDocDefinitions);

  if (!isAnObject(docDefinitions)) {
    return [ 'Document definitions are not specified as an object' ];
  }

  var validationErrors = [ ];

  for (var docType in docDefinitions) {
    var docDefinition = docDefinitions[docType];

    if (!isAnObject(docDefinition)) {
      validationErrors.push(docTypePrefix(docType) + ' is not defined as an object');
    } else {
      validateDocType(docType, docDefinition);
    }
  }

  function validateDocType(docType, docDefinition) {
    var hasTypeFilter = false;
    var hasPermissionGrant = false;
    var hasPropertyValidators = false;
    for (var propertyName in docDefinition) {
      var propertyValue = docDefinition[propertyName];

      switch(propertyName) {
        case 'typeFilter':
          hasTypeFilter = true;
          if (typeof(propertyValue) !== 'function') {
            validationErrors.push(docTypePrefix(docType) + ': the "typeFilter" property is not a function');
          }
          break;
        case 'channels':
          hasPermissionGrant = true;
          if (isAnObject(propertyValue)) {
            validatePermissions('channels', propertyValue);
          } else if (typeof(propertyValue) !== 'function') {
            validationErrors.push(docTypePrefix(docType) + ': the "channels" property is not an object or a function');
          }
          break;
        case 'authorizedRoles':
          hasPermissionGrant = true;
          if (isAnObject(propertyValue)) {
            validatePermissions('authorizedRoles', propertyValue);
          } else if (typeof(propertyValue) !== 'function') {
            validationErrors.push(docTypePrefix(docType) + ': the "authorizedRoles" property is not an object or a function');
          }
          break;
        case 'authorizedUsers':
          hasPermissionGrant = true;
          if (isAnObject(propertyValue)) {
            validatePermissions('authorizedUsers', propertyValue);
          } else if (typeof(propertyValue) !== 'function') {
            validationErrors.push(docTypePrefix(docType) + ': the "authorizedUsers" property is not an object or a function');
          }
          break;
        case 'propertyValidators':
          hasPropertyValidators = true;
          if (!isAnObject(propertyValue) && typeof(propertyValue) !== 'function') {
            validationErrors.push(docTypePrefix(docType) + ': the "propertyValidators" property is not an object or a function');
          }
          break;
        case 'allowUnknownProperties':
          if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
            validationErrors.push(docTypePrefix(docType) + ': the "allowUnknownProperties" property is not a boolean or a function');
          }
          break;
        case 'immutable':
          if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
            validationErrors.push(docTypePrefix(docType) + ': the "immutable" property is not a boolean or a function');
          }
          break;
        case 'cannotReplace':
          if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
            validationErrors.push(docTypePrefix(docType) + ': the "cannotReplace" property is not a boolean or a function');
          }
          break;
        case 'cannotDelete':
          if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
            validationErrors.push(docTypePrefix(docType) + ': the "cannotDelete" property is not a boolean or a function');
          }
          break;
        case 'allowAttachments':
          if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
            validationErrors.push(docTypePrefix(docType) + ': the "allowAttachments" property is not a boolean or a function');
          }
          break;
        case 'attachmentConstraints':
          if (isAnObject(propertyValue)) {
            if (!docDefinition.allowAttachments) {
              validationErrors.push(docTypePrefix(docType) + ': the "attachmentConstraints" property is defined but attachments have not been enabled via the "allowAttachments" property');
            }

            validateAttachmentConstraints(propertyValue);
          } else if (typeof(propertyValue) !== 'function') {
            validationErrors.push(docTypePrefix(docType) + ': the "attachmentConstraints" property is not an object or a function');
          }
          break;
        case 'accessAssignments':
          if (!(propertyValue instanceof Array) && typeof(propertyValue) !== 'string' && typeof(propertyValue) !== 'function') {
            validationErrors.push(docTypePrefix(docType) + ': the "accessAssignments" property is not an array or a string or a function');
          }
          break;
        case 'customActions':
          if (!isAnObject(propertyValue)) {
            validationErrors.push(docTypePrefix(docType) + ': the "customActions" property is not an object');
          }
          break;
        default:
          validationErrors.push(docTypePrefix(docType) + ' includes unsupported property: "' + propertyName + '"');
          break;
      }
    }

    if (!hasTypeFilter) {
      validationErrors.push(docTypePrefix(docType) + ' is missing a typeFilter property');
    }
    if (!hasPermissionGrant) {
      validationErrors.push(docTypePrefix(docType) + ' is missing a channels, authorizedRoles or authorizedUsers property');
    }
    if (!hasPropertyValidators) {
      validationErrors.push(docTypePrefix(docType) + ' is missing a propertyValidators property');
    }
  }

  function validatePermissions(permissionsCategory, permissionsDefinition) {
    for (var permissionOperation in permissionsDefinition) {
      var permissions = permissionsDefinition[permissionOperation];

      if (!supportedPermissionOperations.has(permissionOperation)) {
        validationErrors.push(docTypePrefix(docType) + ': the "' + permissionsCategory + '" property\'s "' + permissionOperation + '" operation type is not supported');
      } else if (permissions instanceof Array) {
        for (var permissionIndex = 0; permissionIndex < permissions.length; permissionIndex++) {
          var permission = permissions[permissionIndex];
          if (typeof(permission) !== 'string') {
            validationErrors.push(docTypePrefix(docType) + ': the "' + permissionsCategory + '" property\'s "' + permissionOperation + '" operation contains an element that is not a string: ' + JSON.stringify(permission));
          }
        }
      } else if (typeof(permissions) !== 'string') {
        validationErrors.push(docTypePrefix(docType) + ': the "' + permissionsCategory + '" property\'s "' + permissionOperation + '" operation is not a string or array');
      }
    }
  }

  function validateAttachmentConstraints(attachmentConstraintsDefinition) {
    var maximumAttachmentCount = attachmentConstraintsDefinition.maximumAttachmentCount;
    if (typeof(maximumAttachmentCount) !== 'undefined') {
      if (!Number.isInteger(maximumAttachmentCount) || maximumAttachmentCount < 0) {
        validationErrors.push(docTypePrefix(docType) + ': the "attachmentConstraints" specifies a "maximumAttachmentCount" property that is not a positive integer');
      }
    }

    var maximumIndividualSize = attachmentConstraintsDefinition.maximumIndividualSize;
    if (typeof(maximumIndividualSize) !== 'undefined') {
      if (!Number.isInteger(maximumIndividualSize) || maximumIndividualSize < 0) {
        validationErrors.push(docTypePrefix(docType) + ': the "attachmentConstraints" specifies a "maximumIndividualSize" property that is not a positive integer');
      }
    }

    var maximumTotalSize = attachmentConstraintsDefinition.maximumTotalSize;
    if (typeof(maximumTotalSize) !== 'undefined') {
      if (!Number.isInteger(maximumTotalSize) || maximumTotalSize < 0) {
        validationErrors.push(docTypePrefix(docType) + ': the "attachmentConstraints" specifies a "maximumTotalSize" property that is not a positive integer');
      }
    }

    var supportedExtensions = attachmentConstraintsDefinition.supportedExtensions;
    if (typeof(supportedExtensions) !== 'undefined') {
      if (supportedExtensions instanceof Array) {
        for (var extensionIndex = 0; extensionIndex < supportedExtensions.length; extensionIndex++) {
          var extension = supportedExtensions[extensionIndex];
          if (typeof(extension) !== 'string') {
            validationErrors.push(docTypePrefix(docType) + ': the "attachmentConstraints" property\'s "supportedExtensions" contains an element that is not a string: ' + JSON.stringify(extension));
          }
        }
      } else {
        validationErrors.push(docTypePrefix(docType) + ': the "attachmentConstraints" specifies a "supportedExtensions" property that is not an array');
      }
    }

    var supportedContentTypes = attachmentConstraintsDefinition.supportedContentTypes;
    if (typeof(supportedContentTypes) !== 'undefined') {
      if (supportedContentTypes instanceof Array) {
        for (var contentTypeIndex = 0; contentTypeIndex < supportedContentTypes.length; contentTypeIndex++) {
          var contentType = supportedContentTypes[contentTypeIndex];
          if (typeof(contentType) !== 'string') {
            validationErrors.push(docTypePrefix(docType) + ': the "attachmentConstraints" property\'s "supportedContentTypes" contains an element that is not a string: ' + JSON.stringify(contentType));
          }
        }
      } else {
        validationErrors.push(docTypePrefix(docType) + ': the "attachmentConstraints" specifies a "supportedContentTypes" property that is not an array');
      }
    }

    var requireAttachmentReferences = attachmentConstraintsDefinition.requireAttachmentReferences;
    if (typeof(requireAttachmentReferences) !== 'undefined' && typeof(requireAttachmentReferences) !== 'boolean') {
      validationErrors.push(docTypePrefix(docType) + ': the "attachmentConstraints" specifies a "requireAttachmentReferences" property that is not a boolean');
    }
  }

  return validationErrors;
}

var supportedPermissionOperations = new Set([ 'view', 'add', 'replace', 'remove', 'write' ]);

function resolveDocDefinitions(rawDocDefinitions) {
  return (typeof(rawDocDefinitions) === 'function') ? rawDocDefinitions() : rawDocDefinitions;
}

function isAnObject(value) {
  return typeof(value) === 'object' && !(value instanceof Array);
}

function docTypePrefix(docType) {
  return 'document type "' + docType + '"';
}
