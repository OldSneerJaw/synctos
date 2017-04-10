function() {
  function isNonEmpty(value, oldValue, doc, oldDoc) {
    return oldDoc ? oldDoc.dynamicMustNotBeEmptyPropertiesEnforced : doc.dynamicMustNotBeEmptyPropertiesEnforced;
  }

  function minimumDynamicLength(value, oldValue, doc, oldDoc) {
    return doc.dynamicLengthPropertyIsValid ? value.length : value.length + 1;
  }

  function maximumDynamicLength(value, oldValue, doc, oldDoc) {
    return doc.dynamicLengthPropertyIsValid ? value.length : value.length - 1;
  }

  return {
    stringDoc: {
      channels: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'stringDoc';
      },
      propertyValidators: {
        staticLengthValidationProp: {
          type: 'string',
          minimumLength: 3,
          maximumLength: 3
        },
        dynamicLengthPropertyIsValid: {
          type: 'boolean',
          immutable: true
        },
        dynamicLengthValidationProp: {
          type: 'string',
          minimumLength: minimumDynamicLength,
          maximumLength: maximumDynamicLength
        },
        staticNonEmptyProp: {
          type: 'string',
          mustNotBeEmpty: true
        },
        dynamicMustNotBeEmptyPropertiesEnforced: {
          type: 'boolean',
          immutable: true
        },
        dynamicNonEmptyProp: {
          type: 'string',
          mustNotBeEmpty: isNonEmpty
        }
      }
    }
  };
}
