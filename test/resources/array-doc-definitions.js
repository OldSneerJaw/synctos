function() {
  function isNonEmpty(doc, oldDoc, value, oldValue) {
    return oldDoc ? oldDoc.dynamicMustNotBeEmptyPropertiesEnforced : doc.dynamicMustNotBeEmptyPropertiesEnforced;
  }

  function minimumDynamicLength(doc, oldDoc, value, oldValue) {
    return doc.dynamicLengthPropertyIsValid ? value.length : value.length + 1;
  }

  function maximumDynamicLength(doc, oldDoc, value, oldValue) {
    return doc.dynamicLengthPropertyIsValid ? value.length : value.length - 1;
  }

  return {
    arrayDoc: {
      channels: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'arrayDoc';
      },
      propertyValidators: {
        staticLengthValidationProp: {
          type: 'array',
          minimumLength: 2,
          maximumLength: 2
        },
        dynamicLengthPropertyIsValid: {
          type: 'boolean',
          immutable: true
        },
        dynamicLengthValidationProp: {
          type: 'array',
          minimumLength: minimumDynamicLength,
          maximumLength: maximumDynamicLength
        },
        staticNonEmptyProp: {
          type: 'array',
          mustNotBeEmpty: true
        },
        dynamicMustNotBeEmptyPropertiesEnforced: {
          type: 'boolean',
          immutable: true
        },
        dynamicNonEmptyProp: {
          type: 'array',
          mustNotBeEmpty: isNonEmpty
        }
      }
    }
  };
}
