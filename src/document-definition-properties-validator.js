/**
 * Validates that the given document definition's property validator definitions conform to specifications.
 *
 * @param {Object} docDefinition The document type definition
 * @param {Object} docPropertyValidatorDefinitions The document type's property validator definitions
 *
 * @returns {string[]} An array of all problems that were identified in the property validators
 */
exports.validate = validate;

function validate(docDefinition, docPropertyValidatorDefinitions) {
  var validationErrors = [ ];

  validatePropertyDefinitions(docPropertyValidatorDefinitions);

  function validatePropertyDefinitions(propertyDefinitions) {
    for (var propertyName in propertyDefinitions) {
      var propertyDefinition = propertyDefinitions[propertyName];
      if (isAnObject(propertyDefinition)) {
        validatePropertyDefinition(propertyName, propertyDefinition);
      } else {
        validationErrors.push('the "propertyValidators" entry "' + propertyName + '" is not an object');
      }
    }
  }

  function validatePropertyDefinition(propertyName, propertyDefinition) {
    var type = propertyDefinition.type;
    if (typeof type === 'undefined') {
      validationErrors.push('the "propertyValidators" entry "' + propertyName + '" does not declare a "type"');

      return;
    } else if (typeof type === 'function') {
      // Properties with a type that is determined dynamically cannot be validated at this point
      return;
    } else if (typeof type !== 'string') {
      validationErrors.push('the "propertyValidators" entry "' + propertyName + '" declares a "type" that is neither a string nor a function');

      return;
    }

    switch (type) {
      case 'string':
        break;
      case 'integer':
        break;
      case 'float':
        break;
      case 'boolean':
        break;
      case 'datetime':
        break;
      case 'date':
        break;
      case 'enum':
        break;
      case 'attachmentReference':
        break;
      case 'array':
        break;
      case 'object':
        break;
      case 'hashtable':
        break;
      default:
        validationErrors.push('the "propertyValidators" entry "' + propertyName + '" declares an invalid "type": "' + type + '"');
        break;
    }
  }

  return validationErrors;
}

function isAnObject(value) {
  return value !== null && typeof value === 'object' && !(value instanceof Array);
}
