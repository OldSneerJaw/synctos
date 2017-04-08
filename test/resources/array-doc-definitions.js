function() {
  function isNonEmpty(value, oldValue, doc, oldDoc) {
    return oldDoc ? oldDoc.dynamicPropertiesMustNotBeEmpty : doc.dynamicPropertiesMustNotBeEmpty;
  }

  return {
    arrayDoc: {
      channels: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'arrayDoc';
      },
      propertyValidators: {
        lengthValidationProp: {
          type: 'array',
          minimumLength: 2,
          maximumLength: 2,
          arrayElementsValidator: {
            type: 'string'
          }
        },
        staticNonEmptyProp: {
          type: 'array',
          mustNotBeEmpty: true
        },
        dynamicPropertiesMustNotBeEmpty: {
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
