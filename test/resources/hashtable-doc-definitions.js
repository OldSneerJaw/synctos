function() {
  function isNonEmpty(value, oldValue, doc, oldDoc) {
    return oldDoc ? oldDoc.dynamicKeysMustNotBeEmpty : doc.dynamicKeysMustNotBeEmpty;
  }

  return {
    hashtableDoc: {
      channels: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'hashtableDoc';
      },
      propertyValidators: {
        sizeValidationProp: {
          type: 'hashtable',
          minimumSize: 2,
          maximumSize: 2
        },
        staticNonEmptyKeyProp: {
          type: 'hashtable',
          hashtableKeysValidator: {
            mustNotBeEmpty: true
          }
        },
        dynamicKeysMustNotBeEmpty: {
          type: 'boolean',
          immutable: true
        },
        dynamicNonEmptyKeyProp: {
          type: 'hashtable',
          hashtableKeysValidator: {
            mustNotBeEmpty: isNonEmpty
          }
        }
      }
    }
  };
}
