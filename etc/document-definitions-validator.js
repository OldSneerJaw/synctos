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
      validationErrors.push('document type "' + docType + '" is not defined as an object');
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
          if (typeof(propertyValue) !== 'function') {
            validationErrors.push('document type "' + docType + '": the "typeFilter" property is not a function');
          }
          hasTypeFilter = true;
          break;
        case 'channels':
          if (!isAnObject(propertyValue) && typeof(propertyValue) !== 'function') {
            validationErrors.push('document type "' + docType + '": the "channels" property is not an object');
          }
          hasPermissionGrant = true;
          break;
        case 'authorizedRoles':
          if (!isAnObject(propertyValue) && typeof(propertyValue) !== 'function') {
            validationErrors.push('document type "' + docType + '": the "authorizedRoles" property is not an object');
          }
          hasPermissionGrant = true;
          break;
        case 'authorizedUsers':
          if (!isAnObject(propertyValue) && typeof(propertyValue) !== 'function') {
            validationErrors.push('document type "' + docType + '": the "authorizedUsers" property is not an object');
          }
          hasPermissionGrant = true;
          break;
        case 'propertyValidators':
          if (!isAnObject(propertyValue) && typeof(propertyValue) !== 'function') {
            validationErrors.push('document type "' + docType + '": the "propertyValidators" property is not an object');
          }
          hasPropertyValidators = true;
          break;
        case 'allowUnknownProperties':
          if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
            validationErrors.push('document type "' + docType + '": the "allowUnknownProperties" property is not a boolean');
          }
          break;
        case 'immutable':
          if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
            validationErrors.push('document type "' + docType + '": the "immutable" property is not a boolean');
          }
          break;
        case 'cannotReplace':
          if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
            validationErrors.push('document type "' + docType + '": the "cannotReplace" property is not a boolean');
          }
          break;
        case 'cannotDelete':
          if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
            validationErrors.push('document type "' + docType + '": the "cannotDelete" property is not a boolean');
          }
          break;
        case 'allowAttachments':
          if (typeof(propertyValue) !== 'boolean' && typeof(propertyValue) !== 'function') {
            validationErrors.push('document type "' + docType + '": the "allowAttachments" property is not a boolean');
          }
          break;
        case 'attachmentConstraints':
          if (!isAnObject(propertyValue) && typeof(propertyValue) !== 'function') {
            validationErrors.push('document type "' + docType + '": the "attachmentConstraints" property is not an object');
          }
          break;
        case 'accessAssignments':
          if (!(propertyValue instanceof Array) && typeof(propertyValue) !== 'string' && typeof(propertyValue) !== 'function') {
            validationErrors.push('document type "' + docType + '": the "accessAssignments" property is not an array or string value');
          }
          break;
        case 'customActions':
          if (!isAnObject(propertyValue)) {
            validationErrors.push('document type "' + docType + '": the "customActions" property is not an object');
          }
          break;
        default:
          validationErrors.push('document type "' + docType + '" includes unsupported property: "' + propertyName + '"');
          break;
      }
    }

    if (!hasTypeFilter) {
      validationErrors.push('document type "' + docType + '" is missing a typeFilter property');
    }
    if (!hasPermissionGrant) {
      validationErrors.push('document type "' + docType + '" is missing a channels, authorizedRoles or authorizedUsers property');
    }
    if (!hasPropertyValidators) {
      validationErrors.push('document type "' + docType + '" is missing a propertyValidators property');
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
