function() {
  function isNonEmpty(value, oldValue, doc, oldDoc) {
    return oldDoc ? oldDoc.dynamicPropertiesMustNotBeEmpty : doc.dynamicPropertiesMustNotBeEmpty;
  }

  return {
    stringDoc: {
      channels: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'stringDoc';
      },
      propertyValidators: {
        lengthValidationProp: {
          type: 'string',
          minimumLength: 3,
          maximumLength: 3
        },
        staticNonEmptyProp: {
          type: 'string',
          mustNotBeEmpty: true
        },
        dynamicPropertiesMustNotBeEmpty: {
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
